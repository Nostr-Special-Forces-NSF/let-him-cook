<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuSeparator,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu';
	import { onMount } from 'svelte';
	import { signOut } from '@auth/sveltekit/client';
	import { DEFAULT_RELAYS } from '$lib/constants';
	import { fetchProfileEvent, createProfileLink, shortNpub } from '$lib/nostr';
	import { parseProfileEvent, type Profile } from '$lib/events/profile-event';
	import { getAvatar } from '$lib/utils';

	export let publicKey: string | undefined;
	let profile: Profile;

	async function getProfileEvent() {
		const res = await fetchProfileEvent(DEFAULT_RELAYS, publicKey);

		if (res !== null) {
			profile = parseProfileEvent(res);
		}
	}

	onMount(getProfileEvent);
</script>

<DropdownMenu>
	<DropdownMenuTrigger>
		<Button
			variant="outline"
			size="icon"
			class="overflow-hidden rounded-full focus-visible:ring-muted"
		>
			<img
				class="aspect-square w-12 overflow-hidden rounded-full object-cover"
				src={profile?.content?.picture ?? getAvatar(publicKey)}
				width={48}
				height={48}
				alt="Profile"
			/>
		</Button>
	</DropdownMenuTrigger>
	<DropdownMenuContent align="end">
		<DropdownMenuItem>
			<a href={createProfileLink(profile, publicKey)}>
				{profile?.content?.name ?? shortNpub(publicKey)}
			</a>
		</DropdownMenuItem>
		<DropdownMenuSeparator />
		<DropdownMenuItem>
			<a href="/settings">Settings</a>
		</DropdownMenuItem>
		<DropdownMenuItem>
			<a href="/relays">Relays</a>
		</DropdownMenuItem>
		<DropdownMenuSeparator />
		<DropdownMenuItem onclick={() => signOut()}>Logout</DropdownMenuItem>
	</DropdownMenuContent>
</DropdownMenu>
