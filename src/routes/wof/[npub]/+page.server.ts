import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ params }) => {
	const { npub } = params;
	return { pubKey: npub };
}