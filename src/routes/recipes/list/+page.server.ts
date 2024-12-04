import type { PageServerLoad } from './$types.js';
import { Relay } from 'nostr-tools/relay';

const RELAY_URL = 'wss://nsf.testrelay.xyz';

export const load: PageServerLoad = async ({ url }) => {
	const pubkey = url.searchParams.get('pubkey');

	const filter = {
		kinds: [35000],
	};

	if (pubkey) {
		filter.authors = [pubkey];
	}

	const recipes: {
		id: string;
		created_at: number;
		content: string;
		tags: string[][];
		pubkey: string;
	}[] = [];
	try {
		const relay = await Relay.connect(RELAY_URL);
		const subscription = relay.subscribe([filter], {
			onevent(e) {
				recipes.push({
					id: e.id,
					created_at: e.created_at,
					content: e.content,
					tags: e.tags,
					pubkey: e.pubkey
				});
			},
			oneose() {
				subscription.close();
				relay.close();
			}
		});

		await new Promise((resolve) => setTimeout(resolve, 1000));

		if (recipes.length === 0) {
			return {
				error: 'No recipes found for the specified author.',
				recipes: []
			};
		}
	} catch (error) {
		console.error('Error fetching recipes:', error);
		return {
			error: 'Error fetching recipes.',
			recipes: []
		};
	}

	return {
		recipes
	};
};
