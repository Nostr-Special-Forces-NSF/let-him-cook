import type { Event, Filter } from 'nostr-tools';
import { SimplePool } from 'nostr-tools';

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
	relays: string[];
	petname?: string;
	sets?: {
		followSets?: string[];
	};
	influenceScore: number;
}

export interface FollowerNetwork {
	followers: Follower[];
}

export interface BuildFollowerNetworkInput {
	userPubkey: string;
	relays: RelayInfo[];
}

const pool = new SimplePool();


/**
 * Fetch a single event that matches a given filter from a set of relays.
 */
async function fetchSingleEventFromRelays(
	relays: RelayInfo[],
	filter: Filter
): Promise<Event | null> {
	const relayUrls = filterRelaysByMode(relays, 'write').map((r) => r.url);
	if (relayUrls.length === 0) return null;

	const event = await pool.get(relayUrls, filter);
	return event || null;
}

/**
 * Fetch multiple events matching a filter from a set of relays.
 */
export async function fetchAllEventsFromRelays(relays: RelayInfo[], filter: Filter): Promise<Event[]> {
	const relayUrls = filterRelaysByMode(relays, 'read').map((r) => r.url);
	if (relayUrls.length === 0) return [];

	const events = await pool.querySync(relayUrls, filter);
	return events;
}

/**
 * Fetch the user's follow list (kind:3) from their WRITE relays.
 */
export async function fetchKind3FollowList(
	userPubkey: string,
	relays: RelayInfo[]
): Promise<FollowEntry[]> {
	const filter: Filter = {
		kinds: [3],
		authors: [userPubkey],
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
		kinds: [30000], // Follow sets
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
			influenceScore: 0,
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
		if (mode === 'read') return r.mode.includes('read');
		if (mode === 'write') return r.mode.includes('write');
		return false;
	});
}
