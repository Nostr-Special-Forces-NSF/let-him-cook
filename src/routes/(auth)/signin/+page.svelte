<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input/index.js';
	import { z } from 'zod';
	import { zod } from 'sveltekit-superforms/adapters';
	import { superForm, defaults } from 'sveltekit-superforms';
	import { signIn } from '@auth/sveltekit/client';
	import { getPublicKey, nip19 } from 'nostr-tools';
	import { bytesToHex } from '@noble/hashes/utils';
	import { isValidNsec } from '$lib/utils';

	let isLoading = false;

	const formSchema = z.object({
		nsec: z.string().refine(isValidNsec, {
			message: 'Invalid nsec.'
		})
	});

	const form = superForm(defaults(zod(formSchema)), {
		SPA: true,
		validators: zod(formSchema),
		resetForm: false
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
					nsec: result.errors.nsec
				};
			});

			isLoading = false;
			return;
		}

		const secretKeyUint8 = nip19.decode($formData.nsec).data as Uint8Array;
		const publicKey = getPublicKey(secretKeyUint8);
		const secretKey = bytesToHex(secretKeyUint8);

		await signIn('credentials', {
			publicKey,
			secretKey,
			redirect: true,
			callbackUrl: '/'
		});

		isLoading = false;
	}

	const signInWithExtension = async (e) => {
		e.preventDefault();
		const nostrWindowObj = window.nostr;
		if (typeof nostrWindowObj !== 'undefined') {
			const publicKey: string = await nostrWindowObj.getPublicKey();

			await signIn('credentials', {
				publicKey: publicKey,
				secretKey: 0,
				redirect: true,
				callbackUrl: '/'
			});
		} else {
			alert('No extension found');
		}
	};
</script>

<div class="mx-auto grid w-[350px] gap-6">
	<div class="flex w-full flex-col space-y-4 text-left">
		<h1 class="text-2xl font-semibold tracking-tight">Log in</h1>
		<p class="text-sm text-muted-foreground">
			New to Nostr?{' '}
			<a href="/register" class="font-semibold text-blue-500 dark:text-blue-400">
				Create an account
			</a>
		</p>
	</div>

	<div class="flex flex-col gap-3">
		<form method="POST" use:enhance onsubmit={handleSubmit}>
			<Form.Field {form} name="nsec">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>nsec</Form.Label>
						<Input
							{...props}
							placeholder="nsec..."
							bind:value={$formData.nsec}
							disabled={isLoading}
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Button disabled={isLoading}>Sign in</Form.Button>
		</form>
	</div>

	<div class="relative">
		<div class="absolute inset-0 flex items-center">
			<span class="w-full border-t"></span>
		</div>
		<div class="relative flex justify-center text-xs uppercase">
			<span class="bg-background px-2 text-muted-foreground"> Or continue with </span>
		</div>
	</div>
	<Button
		class="flex gap-x-1"
		variant="outline"
		type="button"
		onclick={(e) => signInWithExtension(e)}
		disabled={isLoading}
	>
		<svg
			class="-ml-3.5 -mt-0.5 h-6 w-6 fill-secondary-foreground"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 256 256"
		>
			<path
				d="m210.81,116.2v83.23c0,3.13-2.54,5.67-5.67,5.67h-68.04c-3.13,0-5.67-2.54-5.67-5.67v-15.5c.31-19,2.32-37.2,6.54-45.48,2.53-4.98,6.7-7.69,11.49-9.14,9.05-2.72,24.93-.86,31.67-1.18,0,0,20.36.81,20.36-10.72,0-9.28-9.1-8.55-9.1-8.55-10.03.26-17.67-.42-22.62-2.37-8.29-3.26-8.57-9.24-8.6-11.24-.41-23.1-34.47-25.87-64.48-20.14-32.81,6.24.36,53.27.36,116.05v8.38c-.06,3.08-2.55,5.57-5.65,5.57h-33.69c-3.13,0-5.67-2.54-5.67-5.67V55.49c0-3.13,2.54-5.67,5.67-5.67h31.67c3.13,0,5.67,2.54,5.67,5.67,0,4.65,5.23,7.24,9.01,4.53,11.39-8.16,26.01-12.51,42.37-12.51,36.65,0,64.36,21.36,64.36,68.69Zm-60.84-16.89c0-6.7-5.43-12.13-12.13-12.13s-12.13,5.43-12.13,12.13,5.43,12.13,12.13,12.13,12.13-5.43,12.13-12.13Z"
			></path>
		</svg>
		Nostr Extension
	</Button>
</div>
