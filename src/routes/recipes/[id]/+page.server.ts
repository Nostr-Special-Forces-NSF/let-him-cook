import type { PageServerLoad, Actions } from './$types.js';
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { formSchema } from '../schema.js';
import { Relay } from 'nostr-tools/relay';
import { finalizeEvent, type NostrEvent } from 'nostr-tools';

const RELAY_URL = 'wss://nsf.testrelay.xyz';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;

	if (!id) {
		return fail(400, { error: 'Missing recipe ID.' });
	}

	let event: NostrEvent | null = null;
	try {
		// Connect to the relay
		const relay = await Relay.connect(RELAY_URL);
		console.log(`Connected to relay: ${relay.url}`);

		// Subscribe to the specific event with the 'd' tag
		const subscription = relay.subscribe(
			[
				{
					'#d': [id]
				}
			],
			{
				onevent(e) {
					console.log('Event received:', e);
					event = e;
					subscription.close();
					relay.close();
				},
				oneose() {
					subscription.close();
					relay.close();
				}
			}
		);

		// Wait for the subscription to finish
		await new Promise((resolve) => setTimeout(resolve, 1000));

		if (!event) {
			return fail(404, { error: 'Recipe not found.' });
		}
	} catch (error) {
		console.error('Error fetching recipe:', error);
		return fail(500, { error: 'Error fetching recipe.' });
	}

	const recipeData = {
		title: event.tags.find((tag) => tag[0] === 'title')?.[1] || '',
		author: event.tags.find((tag) => tag[0] === 'author')?.[1] || '',
		ingredients: event.tags
			.filter((tag) => tag[0] === 'ingredients')
			.map((tag) => tag[1])
			.join('\n'),
		instructions: event.content || '',
		summary: event.tags.find((tag) => tag[0] === 'summary')?.[1] || '',
		prepTime: event.tags.find((tag) => tag[0] === 'prep_time')?.[1] || '',
		cookTime: event.tags.find((tag) => tag[0] === 'cook_time')?.[1] || '',
		servings: event.tags.find((tag) => tag[0] === 'servings')?.[1] || ''
	};

	return {
		form: await superValidate(recipeData, zod(formSchema)) // Pre-fill the form with the recipe data
	};
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(formSchema));
		if (!form.valid) {
			return fail(400, { form });
		}

		const data = form.data;

		if (!event.params.id) {
			// Case: Create a new recipe
			const relay = await Relay.connect(RELAY_URL);

			const newEvent = {
				kind: 1,
				created_at: Math.floor(Date.now() / 1000),
				tags: [
					['d', data.title.toLowerCase().replace(/\s+/g, '-')], // Generate 'd' tag from title
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
			return { form, success: true };
		} else {
			// Case: Update an existing recipe
			console.log('Updating recipe:', data);
			// Implement update logic here
			return { form, success: true };
		}
	}
};
