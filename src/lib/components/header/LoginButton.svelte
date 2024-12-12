<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { signIn } from '@auth/sveltekit/client';
</script>

<Button
	className="focus-visible:outline-none focus-visible:ring-transparent"
	variant="outline"
	type="submit"
	onclick={() => signIn()}
>
	<span class="text-[1.05rem]">Login &rarr;</span>
</Button>
