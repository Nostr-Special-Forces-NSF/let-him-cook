import { type Event } from 'nostr-tools';

export interface ProfileContent {
	relay?: string;
	about?: string;
	lud06?: string;
	lud16?: string;
	name?: string;
	display_name?: string;
	nip05?: string;
	picture?: string;
	website?: string;
	banner?: string;
	location?: string;
	[key: string]: unknown;
}

export interface Profile {
	event: Event;
	content: ProfileContent;
}

export const parseProfileEvent = (event: Event) => {
	const profileEvent: Profile = {
		event,
		content: {}
	};
	try {
		const content = JSON.parse(event?.content ?? '{}') as ProfileContent;
		profileEvent.content = content;
		return profileEvent;
	} catch (err) {
		console.error('Error parsing profile content', err);
		return profileEvent;
	}
};
