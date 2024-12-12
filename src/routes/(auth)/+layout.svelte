<script lang="ts">
	import '../../app.css';

	let { children } = $props();
</script>

<div class="mx-auto h-screen w-full">
	<div class="h-screen w-full lg:grid lg:grid-cols-2">
		<div class="flex h-screen flex-col items-center pt-32">
			{@render children()}
		</div>
		<div class="hidden h-screen bg-muted lg:block">
			<img
				src="https://images.unsplash.com/photo-1507638940746-7b17d6b55b8f?q=80&w=1789&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
				alt="Background"
				width="2000"
				height="2000"
				class="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
			/>
		</div>
	</div>
</div>
