import type { Event, Filter } from 'nostr-tools';
import { SimplePool } from 'nostr-tools';
import type { FollowerNetwork, Follower, RelayInfo } from './wof';
import {
	fetchEventCountsFromRelays,
	fetchKind3FollowList,
	fetchRelayList,
	fetchUserProfile
} from './wof';
import { Reaction, Zap } from 'nostr-tools/kinds';
import pLimit from 'p-limit';
// Relationship event kinds from NIP-81:
// 30382 for public relationship status
const RELATIONSHIP_KINDS = [30382];

export async function workerPool<T>(
	tasks: (() => Promise<T>)[],
	concurrency: number
): Promise<T[]> {
	const limit = pLimit(concurrency);
	const promises = tasks.map((task) => limit(task));
	return Promise.all(promises);
}

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

	const tasks: (() => Promise<void>)[] = [];

	followers.forEach(async (follower) => {
		// - Is follower present in user's NIP-51 sets?
		if (follower.sets?.followSets && follower.sets.followSets.length > 0) {
			follower.influenceScore += follower.sets.followSets.length;
		}
		// - Relationship categories (NIP-81)
		// If we find that follower is placed in a special "trusted" category
		// or the user is placed by follower in a positive category, increment score
		const relCats = relationshipData[follower.pubkey] || [];
		if (relCats.includes('friend')) follower.influenceScore += 5;
		// Fetch reactions and zaps between user and each follower and compute
		// the influence score for each follower
		// This will help us measure engagement and reciprocation.
		tasks.push(() => processReactionsAndZaps(userPubkey, relays, follower));
	});

	const numProcessors = navigator.hardwareConcurrency || 4;
	await workerPool(tasks, numProcessors);

	return network;
}

// Fetch relationship events (NIP-81, kind:30382) related to user.
// We'll assume we want all events authored by user or referencing user in `d` tag or `p` tags.
async function fetchRelationshipEvents(userPubkey: string, relays: RelayInfo[]): Promise<Event[]> {
	const relayUrls = relays.filter((r) => r.mode.includes('read')).map((r) => r.url);
	const filter: Filter = {
		kinds: RELATIONSHIP_KINDS,
		authors: [userPubkey]
	};
	const pool = new SimplePool();
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

// Process reactions and zaps.
// Realistically, you'd query NIP-25 (kind:7 for reactions) and NIP-57 (kind:9735 for zaps).
// Also check if user is in follower’s sets and if follower is in user’s sets for reciprocal follow logic.
async function processReactionsAndZaps(
	userPubkey: string,
	relays: RelayInfo[],
	follower: Follower
): Promise<void> {
	const followerPubkey = follower.pubkey;
	const followerRelays = await fetchRelayList(followerPubkey);
	let score = 0;
	//let relays = fetchRelayList(followerPubkey);
	// 1. Check reciprocal follow:
	// Query `kind:3` event from follower’s perspective
	const followerKind3 = await fetchKind3FollowList(followerPubkey, followerRelays);
	followerKind3.filter((value) => value.pubkey === userPubkey).forEach(() => (score += 5));

	// 2. Check reactions (kind:7)
	const reactCount = await fetchEventCountsFromRelays(relays, {
		kinds: [Reaction],
		authors: [followerPubkey, userPubkey],
		'#p': [userPubkey, followerPubkey],
	});
	score += reactCount;

	// User -> Follower: authors=[userPubkey], "#p"=[followerPubkey]
	const followeReacts = await fetchEventCountsFromRelays(followerRelays, {
		kinds: [Reaction],
		authors: [userPubkey],
		'#p': [followerPubkey]
	});
	score += followeReacts;

	// 3. Check zaps (kind:9735)
	// Zap receipts require analyzing tags:
	// If there's a `p` tag with followerPubkey and a `p` tag with userPubkey, follower zapped user.
	const zappedUser = await hasZapBetween(relays, followerPubkey, userPubkey);
	score += zappedUser;
	const zappedFollower = await hasZapBetween(relays, userPubkey, followerPubkey);
	score += zappedFollower;

	follower.influenceScore = score;

	// Fetch and deserialize the follower's profile
	if (follower.influenceScore > 0) {
		follower.profile = await fetchUserProfile(followerPubkey, followerRelays);
	}
}

/**
 * Check for zap receipts (kind:9735) that indicate one pubkey zapped another.
 * We'll query `kind:9735` events and then parse their tags:
 * - `p` tag: main recipient
 * - `P` tag: the zap request initiator (payer)
 */
async function hasZapBetween(
	relays: RelayInfo[],
	payerPubkey: string,
	receiverPubkey: string
): Promise<number> {
	const filter: Filter = {
		kinds: [Zap],
		'#p': [receiverPubkey, payerPubkey]
	};

	let zapCount = 0;

	try {
		zapCount = await fetchEventCountsFromRelays(relays, filter);
	} catch (e) {
		console.error(e);
	}

	return zapCount;
}
