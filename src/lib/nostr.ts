import {
	SimplePool,
	nip19,
	// getEventHash,
	finalizeEvent,
	type Event,
	type EventTemplate
} from 'nostr-tools';
import { hexToBytes } from '@noble/hashes/utils';
import { DEFAULT_RELAYS } from './constants';
import { type Profile } from '$lib/events/profile-event';
import type { UserWithKeys } from './types';

export function shortNpub(pubkey: string | undefined, length = 4) {
	if (!pubkey) {
		return undefined;
	}
	const npub = nip19.npubEncode(pubkey);
	return `npub...${npub.substring(npub.length - length)}`;
}

export function tag(key: string, event: Event | undefined) {
	if (!event) {
		return undefined;
	}

	const array = event.tags;
	if (!array) {
		return undefined;
	}

	const item = array.find((element) => element[0] === key);
	return item ? item[1] : undefined;
}

// TODO
// Implement this fcn by accessing the nostr window object
// async function finishEventWithExtension(t: EventTemplate) {
// 	let event = t as Event;
// 	try {
// 		if (nostr) {
// 			event.pubkey = await nostr.getPublicKey();
// 			event.id = getEventHash(event);
// 			event = (await nostr.signEvent(event)) as Event;
// 			return event;
// 		} else {
// 			console.error('nostr not defined');
// 			return undefined;
// 		}
// 	} catch (err) {
// 		console.error('Error signing event', err);
// 		return undefined;
// 	}
// }

async function finishEventWithSecretKey(t: EventTemplate, user: UserWithKeys) {
	if (!user) {
		throw new Error('User not found');
	}

	// TODO
	// Convert user.secretKey to hex
	const secretKey = hexToBytes(user.secretKey);

	return finalizeEvent(t, secretKey);
}

export async function publish(eventTemplate: EventTemplate, relays: string[], user: UserWithKeys) {
	let event;

	if (user?.secretKey === '0') {
		// event = await finishEventWithExtension(eventTemplate);
	} else {
		if (user?.secretKey) {
			event = await finishEventWithSecretKey(eventTemplate, user);
		} else {
			console.error('User not found');
			return false;
		}
	}

	if (!event) {
		return false;
	}
	const pool = new SimplePool();

	await Promise.any(pool.publish(relays, event));

	const retrievedEvent = await pool.get(relays, {
		ids: [event.id]
	});
	pool.close(relays);

	if (!retrievedEvent) {
		return false;
	}

	return true;
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

export async function fetchProfileEvent(relays: string[], publicKey: string | undefined) {
	if (!publicKey) return null;

	const pool = new SimplePool();

	const profileEvent = await pool.get(relays, {
		kinds: [0],
		authors: [publicKey]
	});

	pool.close(relays);

	return profileEvent;
}

export function createProfileLink(profile: Profile | undefined | null, publicKey: string) {
	if (profile?.content?.nip05) {
		if (profile.content?.nip05.startsWith('_@')) {
			return `/${profile.content?.nip05.slice(2)}`;
		}
		return `/${profile.content?.nip05}`;
	}
	return `/${nip19.npubEncode(publicKey)}`;
}
