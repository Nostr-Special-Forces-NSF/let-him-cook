<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuSeparator,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu';
	import { signOut } from '@auth/sveltekit/client';
	import { shortNpub } from '$lib/nostr';

	export let publicKey;
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
				src="https://images.unsplash.com/photo-1507638940746-7b17d6b55b8f?q=80&w=1789&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
				width={48}
				height={48}
				alt="Profile"
			/>
		</Button>
	</DropdownMenuTrigger>
	<DropdownMenuContent align="end">
		<DropdownMenuItem>
			<a href="/user-profile">{shortNpub(publicKey)}</a>
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
