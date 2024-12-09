import { SimplePool, type Filter } from 'nostr-tools';

interface RelayInfo {
	url: string;
	mode: string;
}

const pool = new SimplePool();

export async function fetchRelayList(pubkey: string): Promise<RelayInfo[]> {
	// Known bootstrap relays
	const bootstrapRelayUrls = ['wss://relay.damus.io', 'wss://relay.snort.social'];

	const filter: Filter = {
		kinds: [10002],
		authors: [pubkey]
	};

	const event = await pool.get(bootstrapRelayUrls, filter);

	if (event) {
		const relayTags = event.tags.filter((t) => t[0] === 'r');
		const readWriteRelays = relayTags.map((tag) => {
			const [url, mode] = tag;
			return { url, mode: mode || 'read+write' };
		});
		return readWriteRelays;
	}

	return [];
}
