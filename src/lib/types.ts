import { type User } from '@auth/sveltekit';

export type UserWithKeys = User & {
	secretKey: string;
	publicKey: string;
};

export type TokenWithKeys = {
	secretKey: string;
	publicKey: string;
};
