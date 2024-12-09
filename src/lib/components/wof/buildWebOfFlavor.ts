import type { Event, Filter } from 'nostr-tools';
import type { FollowerNetwork, RelayInfo } from './wof'; // from previous steps
import { SimplePool } from 'nostr-tools';

const pool = new SimplePool();

const INTEREST_KINDS = [10015];
const CURATION_KINDS = [30023];
const LABEL_KINDS = [1985];

interface Ontology {
	cuisines: Set<string>;
	categories: Set<string>;
	ingredients: Set<string>;
	// any other concepts? vegan/vegetarian?
}

interface BuildOntologyInput {
	userPubkey: string;
	followerNetwork: FollowerNetwork;
	relays: RelayInfo[];
	topN?: number;
}

/**
 * Using influential followers to build a "web of flavor":
 * 1. Identify top N influencers by influenceScore
 * 2. For each influencer, fetch interest sets, curation sets, labeling events.
 * 3. Extract cuisines, categories, ingredients from tags (`t`, `l`, `a`).
 * 4. Combine results into an ontology.
 */
export async function buildWebOfFlavor(input: BuildOntologyInput): Promise<Ontology> {
	const { followerNetwork, relays, topN = 5 } = input;

	// Sort followers by influenceScore descending
	const followers = [...followerNetwork.followers].sort((a, b) => {
		const aScore = a.influenceScore || 0;
		const bScore = b.influenceScore || 0;
		return bScore - aScore;
	});

	const topFollowers = followers.slice(0, topN);

	// Initialize empty ontology sets
	const ontology: Ontology = {
		cuisines: new Set<string>(),
		categories: new Set<string>(),
		ingredients: new Set<string>()
	};

	for (const f of topFollowers) {
		const influencerPubkey = f.pubkey;
		const interestEvents = await fetchEventsForUser(influencerPubkey, INTEREST_KINDS, relays);
		const curationEvents = await fetchEventsForUser(influencerPubkey, CURATION_KINDS, relays);
		const labelEvents = await fetchEventsForUser(influencerPubkey, LABEL_KINDS, relays);

		parseInterests(interestEvents, ontology);
		parseCurations(curationEvents, ontology);
		parseLabels(labelEvents, ontology);
	}

	return ontology;
}

/**
 * Fetch events of certain kinds for a given user from read relays.
 */
async function fetchEventsForUser(
	authorPubkey: string,
	kinds: number[],
	relays: RelayInfo[]
): Promise<Event[]> {
	const relayUrls = relays.filter((r) => r.mode.includes('read')).map((r) => r.url);
	const filter: Filter = { authors: [authorPubkey], kinds };
	const events = await pool.querySync(relayUrls, filter);
	return events;
}

/**
 * Parse interest events (kind:10015) which may contain "t" tags for topics,
 * these might represent cuisines or categories. Let's say we treat them as categories.
 */
function parseInterests(events: Event[], ontology: Ontology) {
	for (const ev of events) {
		const tTags = ev.tags.filter((t) => t[0] === 't').map((t) => t[1]);
		for (const topic of tTags) {
			// Decide if topic is cuisine/category/ingredient.
			// For simplicity, let's add them as categories here:
			ontology.categories.add(topic.toLowerCase());
		}
	}
}

/**
 * Parse curation sets (kind:30023) which may reference recipes or articles about cuisine.
 * They can have "a" tags referencing articles or sets and "t" tags for topics.
 * "a" tags might represent a recipe article (NIP-23?), "t" could be topics again.
 */
function parseCurations(events: Event[], ontology: Ontology) {
	for (const ev of events) {
		const tTags = ev.tags.filter((t) => t[0] === 't').map((t) => t[1]);
		const aTags = ev.tags.filter((t) => t[0] === 'a').map((t) => t[1]);
		// For each topic, guess if it's cuisine or ingredient.
		// Suppose that if it contains "Italian", add to cuisines:
		for (const topic of tTags) {
			if (isCuisine(topic)) {
				ontology.cuisines.add(topic.toLowerCase());
			} else {
				// Could be categories or ingredients, heuristic needed
				ontology.categories.add(topic.toLowerCase());
			}
		}
		// The "a" tags might point to specific recipe events or sets,
		// If we had a known mapping of "a" tags to recipes, we could fetch them and extract ingredients.
		// For now, we skip that complexity.
	}
}

/**
 * Parse labeling events (NIP-32 kind:1985) which may have "l" and "L" tags to classify items.
 * "l" tags might represent specific labels like "vegan", "gluten-free" etc.
 * If we see labels that match known categories (like "vegan"), add to categories.
 * If "l" matches known ingredients, add to ingredients.
 */
function parseLabels(events: Event[], ontology: Ontology) {
	for (const ev of events) {
		const lTags = ev.tags.filter((t) => t[0] === 'l').map((t) => t[1]);
		for (const label of lTags) {
			// Heuristic:
			// If label ends with "-free" (e.g. "gluten-free"), maybe category
			if (label.includes('free')) {
				ontology.categories.add(label.toLowerCase());
			} else if (isIngredient(label)) {
				ontology.ingredients.add(label.toLowerCase());
			} else {
				// If we can't classify, assume category by default
				ontology.categories.add(label.toLowerCase());
			}
		}
	}
}

/**
 * Heuristic function to detect if a topic is a cuisine.
 * In a real scenario, you might have a known list of cuisines or detect language patterns.
 */
function isCuisine(topic: string): boolean {
	const knownCuisines = ['italian', 'french', 'mexican', 'thai', 'japanese'];
	return knownCuisines.includes(topic.toLowerCase());
}

/**
 * Heuristic function to detect if a label is an ingredient.
 * In a real scenario, you'd have a dictionary. For now, guess if it contains words like "tomato", "garlic".
 */
function isIngredient(label: string): boolean {
	const knownIngredients = ['tomato', 'garlic', 'onion', 'basil', 'cheese'];
	return knownIngredients.includes(label.toLowerCase());
}
