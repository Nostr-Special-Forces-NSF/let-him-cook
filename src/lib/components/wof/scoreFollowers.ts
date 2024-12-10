import type { Event, Filter } from 'nostr-tools';
import { SimplePool } from 'nostr-tools';
import type { FollowerNetwork, Follower, RelayInfo } from './wof';
import { fetchAllEventsFromRelays, fetchKind3FollowList } from './wof';

const pool = new SimplePool();

// Relationship event kinds from NIP-81:
// 30382 for public relationship status
const RELATIONSHIP_KINDS = [30382];

/**
 * Enhance followers with relationship data (NIP-81) and then score influence.
 * @param userPubkey User we are analyzing
 * @param network The follower network previously built
 * @param relays User’s chosen relays from fetchRelayList
 */
export async function enhanceAndScoreFollowers(
	userPubkey: string,
	network: FollowerNetwork,
	relays: RelayInfo[]
): Promise<FollowerNetwork> {
	const followers = network.followers;

	// 1. Fetch relationship events from user's READ relays
	const relationshipEvents = await fetchRelationshipEvents(userPubkey, relays);
	// 2. Parse relationships and apply to followers
	// For each `kind:30382` event authoring by user or referencing user
	// we map pubkeys found in `p` tags and relationship categories in `n` tags
	const relationshipData = parseRelationships(relationshipEvents);
	// 3. Fetch reactions and zaps between user and each follower
	// This will help us measure engagement and reciprocation.
	const reactionsAndZaps = await fetchReactionsAndZapsBetween(userPubkey, followers, relays);
	// 4. Compute influence score for each follower
	followers.forEach(async (follower) => {
		let score = 0;
		// Criteria:
		// - Does the follower follow the user back? (Check if follower in user’s sets or if reciprocal)
		if (reactionsAndZaps.isReciprocalFollow(userPubkey, follower.pubkey)) {
			score += 5;
		}
		// - Has the follower liked/commented/boosted/zapped user's notes?
		score += reactionsAndZaps.hasReactedToUser(userPubkey, follower.pubkey)!;

		if (reactionsAndZaps.hasZappedUser(userPubkey, follower.pubkey)) {
			score += 4;
		}

		// - Is follower present in user's NIP-51 sets?
		if (follower.sets?.followSets && follower.sets.followSets.length > 0) {
			score += follower.sets.followSets.length;
		}

		// - Relationship categories (NIP-81)
		// If we find that follower is placed in a special "trusted" category
		// or the user is placed by follower in a positive category, increment score
		const relCats = relationshipData[follower.pubkey] || [];

		if (relCats.includes('bitcoiner')) score += 2;
		if (relCats.includes('friend')) score += 5; // example categories

		// - If user also engaged back with follower (like user zapped follower’s posts)
		if (reactionsAndZaps.hasUserEngagedBack(userPubkey, follower.pubkey)) {
			score += 2;
		}

		follower.influenceScore = score;
	});

	return network;
}

// Fetch relationship events (NIP-81, kind:30382) related to user.
// We'll assume we want all events authored by user or referencing user in `d` tag or `p` tags.
async function fetchRelationshipEvents(userPubkey: string, relays: RelayInfo[]): Promise<Event[]> {
	const relayUrls = relays.filter((r) => r.mode.includes('read')).map((r) => r.url);
	const filter: Filter = {
		kinds: RELATIONSHIP_KINDS,
		authors: [userPubkey],
		limit: 100
	};
	const events = await pool.querySync(relayUrls, filter);
	return events;
}

// Parse relationship events
// Suppose `kind:30382` events have `d` tags with a target pubkey and `n` tags for categories.
function parseRelationships(events: Event[]): Record<string, string[]> {
	const map: Record<string, string[]> = {};
	for (const ev of events) {
		const dTag = ev.tags.find((t) => t[0] === 'd');
		if (!dTag) continue;

		const targetPubkey = dTag[1];
		// Extract `n` tags for categories
		const nTags = ev.tags.filter((t) => t[0] === 'n').map((t) => t[1]);

		map[targetPubkey] = nTags;
	}
	return map;
}

// Fetch reactions and zaps.
// Realistically, you'd query NIP-25 (kind:7 for reactions) and NIP-57 (kind:9735 for zaps).
// Also check if user is in follower’s sets and if follower is in user’s sets for reciprocal follow logic.
async function fetchReactionsAndZapsBetween(
	userPubkey: string,
	followers: Follower[],
	relays: RelayInfo[]
) {
	const reciprocalFollows = new Set<string>();
	const followerReactedToUser = new Map<string, number>();
	const userReactedToFollower = new Set<string>();
	const followerZappedUser = new Set<string>();
	const userZappedFollower = new Set<string>();

	// For each follower, fetch and analyze relevant events
	for (const f of followers) {
		const followerPubkey = f.pubkey;

		// 1. Check reciprocal follow:
		// Query `kind:3` event from follower’s perspective
		const followerKind3 = await fetchKind3FollowList(followerPubkey, relays);
		followerKind3
			.filter((value) => value.pubkey === userPubkey)
			.forEach(() => reciprocalFollows.add(followerPubkey));

		// 2. Check reactions (kind:7)
		// Follower -> User: authors=[followerPubkey], "#p"=[userPubkey]
		let events = await fetchAllEventsFromRelays(relays, {
			kinds: [7],
			authors: [followerPubkey],
			'#p': [userPubkey]
		});
		const eventCount = events.length;
		followerReactedToUser.set(followerPubkey, eventCount);

		// User -> Follower: authors=[userPubkey], "#p"=[followerPubkey]
		events = await fetchAllEventsFromRelays(relays, {
			kinds: [7],
			authors: [userPubkey],
			'#p': [followerPubkey]
		});
		followerReactedToUser.set(
			followerPubkey,
			eventCount + events.length
		);

		if (await hasReactionBetween(relays, { authors: [userPubkey], '#p': [followerPubkey] })) {
			userReactedToFollower.add(followerPubkey);
		}

		// 3. Check zaps (kind:9735)
		// Zap receipts require analyzing tags:
		// If there's a `P` tag with followerPubkey and a `p` tag with userPubkey, follower zapped user.
		if (await hasZapBetween(relays, followerPubkey, userPubkey)) {
			followerZappedUser.add(followerPubkey);
		}
		if (await hasZapBetween(relays, userPubkey, followerPubkey)) {
			userZappedFollower.add(followerPubkey);
		}
	}

	return {
		isReciprocalFollow: (user: string, follower: string) => reciprocalFollows.has(follower),
		hasReactedToUser: (user: string, follower: string) => followerReactedToUser.get(follower),
		hasZappedUser: (user: string, follower: string) => followerZappedUser.has(follower),
		hasUserEngagedBack: (user: string, follower: string) => {
			return userReactedToFollower.has(follower) || userZappedFollower.has(follower);
		}
	};
}

/**
 * Check for reaction events (kind:7) matching a given filter.
 * If we find at least one event, return true.
 */
async function hasReactionBetween(relays: RelayInfo[], filter: Filter): Promise<boolean> {
	// We'll just get any single event that matches kind:7 and the filter
	const relayUrls = relays.filter((r) => r.mode.includes('read')).map((r) => r.url);
	const fullFilter: Filter = { ...filter, kinds: [7], limit: 1 };
	const event = await pool.get(relayUrls, fullFilter);
	return event !== null;
}

/**
 * Check for zap receipts (kind:9735) that indicate one pubkey zapped another.
 * We'll query `kind:9735` events and then parse their tags:
 * - `p` tag: main recipient
 * - `P` tag: the zap request initiator (payer)
 *
 * If payerPubkey zapped receiverPubkey, we look for a `p` tag = receiverPubkey and `P` tag = payerPubkey.
 */
async function hasZapBetween(relays: RelayInfo[], payerPubkey: string, receiverPubkey: string): Promise<boolean> {
	const relayUrls = relays.filter(r => r.mode.includes('read')).map(r => r.url);
  
	const filter: Filter = {
	  kinds: [9735],
	  "#p": [receiverPubkey],
	  limit: 50
	};
  
	const events = await pool.querySync(relayUrls, filter);
	for (const ev of events) {
	  const pTag = ev.tags.find(t => t[0] === 'p');
	  const PTag = ev.tags.find(t => t[0] === 'P');
	  if (pTag && pTag[1] === receiverPubkey && PTag && PTag[1] === payerPubkey) {
		return true;
	  }
  
	  // If no `P` tag is available, we'd need to parse the `description` tag which contains the zap request event JSON.
	  // The zap request (kind:9734) event includes `p` tags, `relays`, and an `lnurl`.
	  // We would decode `description`, parse it as JSON, extract the original zap request event, and see if authors/payers match.
	  // Let's do a fallback attempt:
	  const descTag = ev.tags.find(t => t[0] === 'description');
	  if (descTag) {
		try {
		  const zapRequestEvent = JSON.parse(descTag[1]);
		  // The zap request event (kind:9734) should have `p` and `relays` and `pubkey` fields.
		  // The `authors` doesn't apply to requests since not published to relay, but `pubkey` is the payer.
		  if (zapRequestEvent.pubkey === payerPubkey) {
			// Check if zap request aimed at receiverPubkey:
			// The zap request `p` tag should represent final recipient.
			if (zapRequestEvent.tags.some((tag: string[]) => tag[0] === 'p' && tag[1] === receiverPubkey)) {
			  return true;
			}
		  }
		} catch (err) {
		  // Ignore JSON parse errors
		  console.log(err);
		}
	  }
	}
  
	return false;
  }