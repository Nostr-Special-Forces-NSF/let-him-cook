<script lang="ts">
	import { LoginButton } from '$lib';
</script>

<header
	class="relative flex items-center justify-between border-b px-6 py-4 sm:border-none lg:px-8"
>
	<a href="/" class="flex items-center gap-2">
		<span class="font-merriweather text-xl font-bold">Let Him Cook</span>
	</a>
	<div class="flex items-center gap-4">
		<LoginButton />
	</div>
</header>
