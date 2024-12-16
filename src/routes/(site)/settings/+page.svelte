<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input/index.js';

	import { Separator } from '$lib/components/ui/separator/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { z } from 'zod';
	import { zod } from 'sveltekit-superforms/adapters';
	import { superForm, defaults } from 'sveltekit-superforms';
	import { type UserWithKeys } from '$lib/types';
	import { DEFAULT_RELAYS } from '$lib/constants';
	import { fetchProfileEvent, publish } from '$lib/nostr';
	import { parseProfileEvent, type Profile } from '$lib/events/profile-event';
	import { getAvatar } from '$lib/utils';
	import { type EventTemplate } from 'nostr-tools';
	import { toast } from 'svelte-sonner';

	const session = $page.data.session;
	const user = session?.user as UserWithKeys | undefined;
	const publicKey: string | undefined = user?.publicKey;

	let isSubmitting = false;

	const formSchema = z.object({
		picture: z.string(),
		username: z
			.string()
			.min(1, {
				message: 'Username must be at least 1 character.'
			})
			.max(30, {
				message: 'Username must not be longer than 30 characters.'
			}),
		website: z.string(),
		bio: z.string().max(160).min(4),
		lud16: z.string()
	});

	const defaultValues = defaults(zod(formSchema));

	const form = superForm(defaultValues, {
		SPA: true,
		validators: zod(formSchema),
		resetForm: true
	});

	const { form: formData, enhance, validateForm, errors, reset } = form;

	let profileEvent;
	let profile: Profile;

	async function getProfileEvent() {
		profileEvent = await fetchProfileEvent(DEFAULT_RELAYS, publicKey);

		// TODO
		// Reset form when calling reset and on profileEvent changes
		// Look into why reset function call isn't working on initial load, i.e., values aren't being loaded intially
		if (profileEvent !== null) {
			profile = parseProfileEvent(profileEvent);
			reset({
				picture: profile?.content.picture,
				username: profile?.content.name,
				website: profile?.content.website,
				bio: profile?.content.about,
				lud16: profile?.content.lud16
			});
		}
	}

	async function handleSubmit(e) {
		e.preventDefault();
		isSubmitting = true;
		const result = await validateForm();

		if (!result.valid) {
			errors.update((v) => {
				return {
					...v,
					picture: result.errors.picture,
					username: result.errors.username,
					website: result.errors.website,
					bio: result.errors.bio,
					lud16: result.errors.lud16
				};
			});

			isSubmitting = false;
			return;
		}

		const { picture, username, website, bio, lud16 } = $formData;

		let tags = profileEvent?.tags;

		if (!tags) tags = [];

		let content = '';
		let profile;

		if (profileEvent) {
			profile = parseProfileEvent(profileEvent);
			profile.content.picture = picture;
			profile.content.name = username;
			profile.content.website = website;
			profile.content.about = bio;
			profile.content.lud16 = lud16;
		}

		if (!profile) {
			content = JSON.stringify({
				picture,
				name: username,
				website,
				about: bio,
				lud16
			});
		} else {
			content = JSON.stringify(profile.content);
		}

		const eventTemplate: EventTemplate = {
			kind: 0,
			tags,
			content,
			created_at: Math.floor(Date.now() / 1000)
		};

		const published = await publish(eventTemplate, DEFAULT_RELAYS, user);

		isSubmitting = false;

		if (published) {
			toast('Profile updated', {
				description: 'Your profile has been updated.'
			});
		} else {
			toast('Profile update failed', {
				description: 'There was an error updating your profile.'
			});
		}
	}

	onMount(getProfileEvent);
</script>

<div class="flex w-full flex-col items-center pt-12">
	<form class="w-full max-w-xl space-y-8" method="POST" use:enhance onsubmit={handleSubmit}>
		<Form.Field {form} name="username">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Username</Form.Label>
					<Input {...props} placeholder="Username..." bind:value={$formData.username} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="picture">
			<div class="flex items-center gap-x-4">
				{#if $formData.picture}
					<img
						class="aspect-square w-12 overflow-hidden rounded-full object-cover"
						src={$formData.picture}
						width={48}
						height={48}
						alt="Profile"
					/>
				{:else}
					<img
						class="aspect-square w-12 overflow-hidden rounded-full object-cover"
						src={getAvatar(publicKey)}
						width={48}
						height={48}
						alt="Profile"
					/>
				{/if}
				<div class="flex w-full flex-col gap-2">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Picture URL</Form.Label>
							<Input {...props} placeholder="Picture URL..." bind:value={$formData.picture} />
						{/snippet}
					</Form.Control>
				</div>
			</div>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="website">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Website</Form.Label>
					<Input {...props} placeholder="Website..." bind:value={$formData.website} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="bio">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Bio</Form.Label>
					<Textarea
						class="resize-none"
						{...props}
						placeholder="Tell us a little bit about yourself"
						bind:value={$formData.bio}
					/>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>

		<Separator />

		<div class="space-y-0.5">
			<h2 class="text-lg font-bold tracking-tight">Integrations</h2>
			<p class="text-sm text-muted-foreground">Manage integrations with external services.</p>
		</div>

		<Form.Field {form} name="lud16">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Lightning Address</Form.Label>
					<Input {...props} placeholder="lud16..." bind:value={$formData.lud16} />
				{/snippet}
			</Form.Control>
			<Form.Description>Link your Lightning Address to your profile.</Form.Description>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Button type="submit" disabled={isSubmitting}>Update profile</Form.Button>
	</form>
</div>
