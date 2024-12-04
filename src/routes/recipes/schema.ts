import { z } from 'zod';
import { isValidNpub } from '$lib/utils';

export const formSchema = z.object({
	npub: z.string().refine(isValidNpub, {
		message: 'Invalid npub.'
	}),
	relay: z.string(),
	title: z.string().min(1, 'Title is required'),
	author: z.string().optional(),
	summary: z.string().optional(),
	image: z.string().url().optional(),
	prepTime: z.string().optional(),
	cookTime: z.string().optional(),
	servings: z.string().optional(),
	ingredients: z.string().min(1, 'At least one ingredient is required'),
	instructions: z.string().min(1, 'Instructions are required'),
	nutrition: z.record(z.string(), z.string()).optional(),
	categories: z.array(z.string()).optional(),
	cuisines: z.array(z.string()).optional(),
	tags: z.array(z.string()).optional()
});

export type FormSchema = typeof formSchema;
