<script lang="ts">
	import { onMount } from 'svelte';
	import Avatar from './Avatar.svelte';
	import { fetchRelayList } from './fetchRelayList';
	import { buildInitialFollowerNetwork } from './wof';
	import { enhanceAndScoreFollowers } from './scoreFollowers';

	export let userPubkey: string;
	export let maxFollows: number = 50;
	export let rings: number = 3;

	let userAvatar: string | null = null;
	let follows: Array<{ pubkey: string; score: number; avatar: string | null }> = [];

	onMount(async () => {
		const relays = await fetchRelayList(userPubkey);
		const network = await buildInitialFollowerNetwork({ userPubkey, relays });
		const scoredFollowers = await enhanceAndScoreFollowers(userPubkey, network, relays);
	});

	function computeRing(score: number, maxScore: number): number {
		if (rings <= 0) return 0;
		const step = maxScore / rings;
		return Math.min(Math.floor(score / step), rings - 1);
	}

	$: maxScore = Math.max(...follows.map((f) => f.score), 1);
</script>

<div class="relative h-full w-full">
	<div class="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 transform">
		<Avatar imageUrl={userAvatar} size="large" />
	</div>

	{#each follows as follow, i}
		{#if follow.avatar}
			<div
				class="absolute transform"
				style={`
					--angle: ${(i / follows.length) * 360}deg;
					--ring: ${(computeRing(follow.score, maxScore) + 1) * 100}px;
					top: calc(50% + var(--ring) * sin(var(--angle)));
					left: calc(50% + var(--ring) * cos(var(--angle)));
				`}
			>
				<Avatar imageUrl={follow.avatar} size="small" />
			</div>
		{/if}
	{/each}
</div>

<style>
	:global(:root) {
		--angle: 0deg;
		--ring: 100px;
	}
	.transform {
		position: absolute;
		transform: rotate(var(--angle));
	}
</style>
