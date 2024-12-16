import { glass } from '@dicebear/collection';
import { createAvatar } from '@dicebear/core';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { nip19 } from 'nostr-tools';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const isValidNpub = (npub: string) => {
	try {
		return nip19.decode(npub).type === 'npub';
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (e) {
		return false;
	}
};

export const isValidNsec = (nsec: string) => {
	try {
		return nip19.decode(nsec).type === 'nsec';
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (e) {
		return false;
	}
};

export function getAvatar(seed: string | undefined) {
	return createAvatar(glass, {
		seed: seed ?? ''
	}).toDataUri();
}
