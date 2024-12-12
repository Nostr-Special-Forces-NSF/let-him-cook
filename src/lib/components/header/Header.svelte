<script lang="ts">
	import { ProfileDropdown } from '$lib';
	import { LoginButton } from '$lib';
	import { ThemeToggle } from '$lib';
	import { ChefHat } from 'lucide-svelte';
	import { type UserWithKeys } from '$lib/types';
	import { page } from '$app/stores';

	const session = $page.data.session;
	const user = session?.user as UserWithKeys | undefined;
	const publicKey = user?.publicKey;
</script>

<header
	class="relative flex items-center justify-between border-b px-6 py-4 sm:border-none lg:px-8"
>
	<a href="/" class="flex items-center gap-2">
		<ChefHat class="h-5 w-5" />
		<span class="font-merriweather text-xl font-bold">Let Him Cook</span>
	</a>
	<div class="flex items-center gap-4">
		<ThemeToggle />
		{#if $page.data.session && publicKey}
			<ProfileDropdown {publicKey} />
		{:else}
			<LoginButton />
		{/if}
	</div>
</header>
