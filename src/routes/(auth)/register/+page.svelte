<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input/index.js';
	import { z } from 'zod';
	import { zod } from 'sveltekit-superforms/adapters';
	import { superForm, defaults } from 'sveltekit-superforms';
	import { signIn } from '@auth/sveltekit/client';
	import { nip19, generateSecretKey, getPublicKey } from 'nostr-tools';
	import { isValidNsec, isValidNpub } from '$lib/utils';

	let isLoading = false;

	const formSchema = z.object({
		npub: z.string().refine(isValidNpub, {
			message: 'Invalid npub.'
		}),
		nsec: z.string().refine(isValidNsec, {
			message: 'Invalid nsec.'
		})
	});

	const defaultValues = defaults(zod(formSchema));

	const secretKey = generateSecretKey();
	const nsec = nip19.nsecEncode(secretKey);

	const publicKey = getPublicKey(secretKey);
	const npub = nip19.npubEncode(publicKey);

	defaultValues.data.npub = npub;
	defaultValues.data.nsec = nsec;

	const form = superForm(defaultValues, {
		SPA: true,
		validators: zod(formSchema)
	});

	const { form: formData, enhance, validateForm, errors } = form;

	async function handleSubmit(e) {
		e.preventDefault();
		isLoading = true;
		const result = await validateForm();

		if (!result.valid) {
			errors.update((v) => {
				return {
					...v,
					npub: result.errors.npub,
					nsec: result.errors.nsec
				};
			});

			isLoading = false;
			return;
		}

		const publicKey = nip19.decode($formData.npub).data as string;
		const secretKey = nip19.decode($formData.nsec).data as Uint8Array;

		await signIn('credentials', {
			publicKey,
			secretKey,
			redirect: true,
			callbackUrl: '/'
		});

		isLoading = false;
	}
</script>

<div class="mx-auto grid w-[350px] gap-6">
	<div class="flex w-full flex-col space-y-4 text-left">
		<h1 class="text-2xl font-semibold tracking-tight">Create an Account</h1>
		<p class="text-sm text-muted-foreground">
			Already have an account?{' '}
			<a href="/signin" class="font-semibold text-blue-500 dark:text-blue-400">Sign in</a>
		</p>
	</div>
	<div class="flex flex-col gap-3">
		<form method="POST" use:enhance onsubmit={handleSubmit}>
			<Form.Field {form} name="nsec">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>nsec</Form.Label>
						<Input
							class="border-primary/60"
							{...props}
							placeholder="nsec..."
							bind:value={$formData.nsec}
							disabled
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="npub">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>npub</Form.Label>
						<Input
							class="border-primary/60"
							{...props}
							placeholder="npub..."
							bind:value={$formData.npub}
							disabled
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<p class="mt-2 flex gap-x-1 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
				<span>Use a</span>
				<span>
					<a
						href="https://getalby.com/"
						target="_blank"
						rel="noreferrer"
						class="font-semibold text-blue-500 hover:underline dark:text-blue-400"
					>
						nostr extension
					</a>
				</span>
				<span>to login in the future</span>
			</p>
			<Form.Button type="submit" disabled={isLoading}>Register</Form.Button>
		</form>
	</div>
</div>
