import { z } from 'zod';
import { isValidNpub } from '$lib/utils';

export const formSchema = z.object({
	npub: z.string().refine(isValidNpub, {
		message: 'Invalid npub.'
	}),
	relay: z.string(),
	title: z.string(),
	ingredients: z.string(),
	directions: z.string()
});

export type FormSchema = typeof formSchema;
