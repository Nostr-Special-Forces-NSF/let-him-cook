<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
</script>

<div class="relative h-screen w-full overflow-hidden">
	<div
		style="background-image: url('https://images.unsplash.com/photo-1507638940746-7b17d6b55b8f?q=80&w=1789&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D');"
		class="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
	>
		<div class="relative z-10 flex h-full flex-col items-center justify-center text-center">
			<h1 class="mb-4 text-4xl font-bold text-white">404 - Page Not Found</h1>
			<p class="mb-8 max-w-md text-lg text-white">
				Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
			</p>
			<Button>
				<a href="/">Return to Home</a>
			</Button>
		</div>
	</div>
</div>
