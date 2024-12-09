import type { PageServerLoad, Actions } from './$types.js';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { formSchema } from '../schema';
import { finalizeEvent, Relay } from 'nostr-tools';

const RELAY_URL = 'wss://nsf.testrelay.xyz';

export const load: PageServerLoad = async () => {
	// Initialize an empty form for new recipes
	return {
		form: await superValidate(zod(formSchema))
	};
};

export const actions: Actions = {
	default: async (event) => {
		const data = await superValidate(event, zod(formSchema));
		if (!data.valid) {
			return { status: 400, data };
		}

			// Create a new recipe
			const relay = await Relay.connect(RELAY_URL);

			const newEvent = {
				kind: 1,
				created_at: Math.floor(Date.now() / 1000),
				tags: [
					['d', data.slug ? data.slug : data.title.toLowerCase().replace(/\s+/g, '-')], // Generate 'd' tag from title
					['title', data.title],
					['author', data.author],
					...data.ingredients.split('\n').map((ingredient) => ['ingredients', ingredient]),
					['prep_time', data.prepTime],
					['cook_time', data.cookTime],
					['servings', data.servings],
					['summary', data.summary]
				],
				content: data.instructions
			};

			// Sign and publish the event
			const signedEvent = finalizeEvent(newEvent, 'your-secret-key');
			await relay.publish(signedEvent);
			relay.close();

			console.log('New recipe created:', signedEvent);
			return { data, success: true };
	}
};
