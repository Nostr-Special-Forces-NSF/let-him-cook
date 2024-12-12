<script lang="ts">
	import WebOfFlavor from "$lib/components/wof/WebOfFlavor.svelte";
	import type { PageData } from './$types.js';
	export let data: PageData;
</script>

<WebOfFlavor userPubkey="{data.pubKey}" maxFollows={30} rings={5} />