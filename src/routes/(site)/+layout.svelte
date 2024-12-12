<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import Header from '$lib/components/header/Header.svelte';
	import '../../app.css';

	let { children } = $props();
</script>

<Sidebar.Provider>
	<AppSidebar />
	<Sidebar.Trigger />
	<div class="relative isolate flex min-h-svh w-full flex-col bg-secondary sm:bg-background">
		<Header />
		<div class="flex flex-1 flex-col pb-2 sm:px-2">
			<main
				class="grow px-6 py-4 sm:rounded-lg sm:bg-secondary sm:px-10 sm:shadow-sm sm:ring-1 sm:ring-foreground/10"
			>
				{@render children()}
			</main>
		</div>
	</div>
</Sidebar.Provider>
