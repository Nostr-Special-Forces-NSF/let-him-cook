import type { Event, Filter } from 'nostr-tools';
import { Relay, SimplePool } from 'nostr-tools';
import { Contacts, Followsets, Metadata, RelayList } from 'nostr-tools/kinds';

export interface RelayInfo {
	url: string;
	mode: string; // "read", "write", or "read+write"
}

export interface FollowEntry {
	pubkey: string;
	relay?: string;
	petname?: string;
}

export interface Follower {
	pubkey: string;
	relays: RelayInfo[];
	petname?: string;
	sets?: {
		followSets?: string[];
	};
	influenceScore: number;
	profile?: ProfileMetadata;
}

export interface ProfileMetadata {
	name: string;
	about: string;
	picture: string;
}

export interface FollowerNetwork {
	followers: Follower[];
}

export interface BuildFollowerNetworkInput {
	userPubkey: string;
	relays: RelayInfo[];
}

export interface RelayInfo {
	url: string;
	mode: string;
}

export async function fetchRelayList(pubkey: string): Promise<RelayInfo[]> {
	// Known bootstrap relays
	const bootstrapRelayUrls = ['wss://relay.damus.io', 'wss://relay.snort.social'];
	const filter: Filter = {
		kinds: [RelayList],
		authors: [pubkey]
	};
	const pool = new SimplePool();

	const event = await pool.get(bootstrapRelayUrls, filter);

	if (event) {
		const relayTags = event.tags.filter((t) => t[0] === 'r');
		const readWriteRelays = relayTags.map((tag) => {
			const [, url, mode] = tag;
			return { url, mode: mode || 'read+write' };
		});
		return readWriteRelays;
	}

	return [];
}

/**
 * Fetch a single event that matches a given filter from a set of relays.
 */
export async function fetchSingleEventFromRelays(
	relays: RelayInfo[],
	filter: Filter
): Promise<Event | null> {
	const relayUrls = filterRelaysByMode(relays, 'write').map((r) => r.url);
	if (relayUrls.length === 0) return null;
	const pool = new SimplePool();
	const event = await pool.get(relayUrls, filter);
	return event || null;
}

/**
 * Fetch multiple events matching a filter from a set of relays.
 */
export async function fetchAllEventsFromRelays(
	relays: RelayInfo[],
	filter: Filter
): Promise<Event[]> {
	const relayUrls = filterRelaysByMode(relays, 'read').map((r) => r.url);
	if (relayUrls.length === 0) return [];
	const pool = new SimplePool();
	const events = await pool.querySync(relayUrls, filter);
	return events;
}

async function connectWithTimeout(
	relayUrl: string,
	filters: Filter[],
	params: { id?: string | null } = {},
	timeoutDuration: number = 3000
): Promise<number> {
	const relay = await Relay.connect(relayUrl);
	const timeoutPromise = new Promise<number>((_, reject) =>
		setTimeout(() => reject(new Error('Count request timed out')), timeoutDuration)
	);
	return Promise.race([relay.count(filters, params), timeoutPromise]);
}

/**
 * Fetch the event count matching a filter from a set of relays.
 */
export async function fetchEventCountsFromRelays(
	relays: RelayInfo[],
	filter: Filter
): Promise<number> {
	const relayUrls = filterRelaysByMode(relays, 'read').map((r) => r.url);
	if (relayUrls.length === 0) return 0;
	const pool = new SimplePool();
	const events = await pool.querySync(relayUrls, filter);
	return events.length;
}

/**
 * Fetch the user's follow list (kind:3) from their WRITE relays.
 */
export async function fetchKind3FollowList(
	userPubkey: string,
	relays: RelayInfo[]
): Promise<FollowEntry[]> {
	const filter: Filter = {
		kinds: [Contacts],
		authors: [userPubkey]
	};

	const event = await fetchSingleEventFromRelays(relays, filter);
	if (!event) return [];

	const followEntries = event.tags
		.filter((tag) => tag[0] === 'p')
		.map((tag) => ({
			pubkey: tag[1],
			relay: tag[2] || '',
			petname: tag[3] || ''
		}));
	return followEntries;
}

/**
 * Fetch NIP-51 sets (e.g., follow sets kind:30000) to supplement follower info.
 */
async function fetchNip51Sets(userPubkey: string, relays: RelayInfo[]): Promise<Event[]> {
	const filter: Filter = {
		kinds: [Followsets], // Follow sets
		authors: [userPubkey]
	};

	const events = await fetchAllEventsFromRelays(relays, filter);
	return events;
}

/**
 * Parse follow sets from NIP-51 events.
 */
function parseFollowSets(events: Event[]): Record<string, string[]> {
	const map: Record<string, string[]> = {};
	for (const ev of events) {
		const dTag = ev.tags.find((t) => t[0] === 'd');
		const setName = dTag ? dTag[1] : 'unnamed-set';

		const pTags = ev.tags.filter((t) => t[0] === 'p');
		for (const pTag of pTags) {
			const followerPubkey = pTag[1];
			if (!map[followerPubkey]) map[followerPubkey] = [];
			map[followerPubkey].push(setName);
		}
	}
	return map;
}

/**
 * Build the initial follower network using kind:3 events and NIP-51 sets.
 */
export async function buildInitialFollowerNetwork(
	input: BuildFollowerNetworkInput
): Promise<FollowerNetwork> {
	const { userPubkey, relays } = input;

	// 1. Basic follow list from kind:3
	const followEntries = await fetchKind3FollowList(userPubkey, relays);
	// 2. Fetch sets (like kind:30000) from NIP-51
	const sets = await fetchNip51Sets(userPubkey, relays);

	const followSetsMap = parseFollowSets(sets);
	const followers: Follower[] = followEntries.map((fe) => {
		const setsForPubkey = followSetsMap[fe.pubkey] || [];
		return {
			pubkey: fe.pubkey,
			relays: fe.relay ? [fe.relay] : [],
			petname: fe.petname || undefined,
			sets: {
				followSets: setsForPubkey
			},
			influenceScore: 0
		};
	});
	return { followers };
}

/**
 * Helper to filter relays by a given mode (read/write).
 * If mode='write', we return all relays that have 'write' in mode.
 * If mode='read', all relays that have 'read' in mode.
 */
function filterRelaysByMode(relays: RelayInfo[], mode: 'read' | 'write'): RelayInfo[] {
	return relays.filter((r) => {
		if (mode === 'read') return r.mode === 'read' || r.mode === 'r+w';
		if (mode === 'write') return r.mode === 'write' || r.mode === 'r+w';
		return false;
	});
}

/**
 * Retrieve User profile metadata.
 */
export async function fetchUserProfile(
	pubKey: string,
	relays: RelayInfo[]
): Promise<ProfileMetadata | undefined> {
	const event = await fetchSingleEventFromRelays(relays, {
		kinds: [Metadata],
		authors: [pubKey]
	});
	if (event !== null) {
		return JSON.parse(event.content!);
	}
}
