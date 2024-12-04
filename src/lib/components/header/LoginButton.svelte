<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { signIn } from '@auth/sveltekit/client';
</script>

<Button
	onClick={() => signIn()}
	className="focus-visible:outline-none focus-visible:ring-transparent"
	variant="outline"
	type="submit"
>
	<span class="text-[1.05rem]">Login &rarr;</span>
</Button>
