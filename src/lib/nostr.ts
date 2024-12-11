import { SimplePool, type Event } from 'nostr-tools';
import { DEFAULT_RELAYS } from './constants';

export function tag(key: string, event: Event | undefined) {
	if (!event) {
		return undefined;
	}

	const array = event.tags;
	if (!array) {
		return undefined;
	}

	const item = array.find((element) => element[0] === key);
	console.log('item', item);
	return item ? item[1] : undefined;
}

export async function fetchRecipes(relays: string[]) {
	const pool = new SimplePool();

	const limit = 30;

	relays = DEFAULT_RELAYS;

	const events = await pool.querySync(
		relays,
		{
			kinds: [35000],
			limit
		},
		{
			id: 'fetchRecipes'
		}
	);

	if (!events) {
		return [];
	}

	// Sort the events by created_at in descending order
	events.sort((a, b) => b.created_at - a.created_at);

	return events;
}
