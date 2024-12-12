<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<div class="overflow-x-hidden bg-secondary antialiased sm:bg-background">
	{@render children()}
</div>
