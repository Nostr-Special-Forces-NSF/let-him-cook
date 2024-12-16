<script lang="ts">
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import '../app.css';

	let { children } = $props();
</script>

<div class="overflow-x-hidden bg-secondary antialiased sm:bg-background">
	{@render children()}
	<Toaster />
</div>
