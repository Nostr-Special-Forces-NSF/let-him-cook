<script lang="ts">
	import WebOfFlavor from "$lib/components/wof/WebOfFlavor.svelte";
	import { getUserWotScore } from "@welshman/app";
	import type { PageData } from './$types.js';
	export let data: PageData;
	const wotScore = getUserWotScore(data.pubKey);

	console.log(wotScore);

</script>

<WebOfFlavor userPubkey="{data.pubKey}" maxFollows={30} rings={5} />