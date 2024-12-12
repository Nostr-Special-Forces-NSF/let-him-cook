<script lang="ts">
	import { onMount } from 'svelte';
	import {
		fetchRelayList,
		buildInitialFollowerNetwork,
		type Follower,
		fetchUserProfile,
		type ProfileMetadata
	} from './wof';
	import { enhanceAndScoreFollowers } from './scoreFollowers';
	import * as Avatar from '$lib/components/ui/avatar/index.js';

	export let userPubkey: string;
	export let maxFollows: number = 50;
	export let rings: number = 3;

	let userProfile: ProfileMetadata | undefined;
	let follows: Array<Follower> = [];

	onMount(async () => {
		const relays = await fetchRelayList(userPubkey);
		userProfile = await fetchUserProfile(userPubkey, relays);
		const network = await buildInitialFollowerNetwork({ userPubkey, relays });
		follows = network.followers;
		const scoredFollowers = await enhanceAndScoreFollowers(userPubkey, network, relays);
		console.log(scoredFollowers);
		follows = scoredFollowers.followers;
	});

	function computeRing(score: number, maxScore: number): number {
		if (rings <= 0) return 0;
		const step = maxScore / rings;
		return Math.min(Math.floor(score / step), rings - 1);
	}

	$: maxScore = Math.max(...follows.map((f) => f.influenceScore), 1);
</script>

<div class="relative h-full w-full">
	<div class="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 transform">
		<Avatar.Root>
			<Avatar.Image src={userProfile?.picture} alt={userProfile?.name} />
			<Avatar.Fallback>NU</Avatar.Fallback>
		</Avatar.Root>
	</div>

	{#each follows as follow, i}
		<div
			class="absolute transform"
			style={`
					--angle: ${(i / maxFollows) * 360}deg;
					--ring: ${(computeRing(follow.influenceScore, maxScore) + 1) * 100}px;
					top: calc(50% + var(--ring) * sin(var(--angle)));
					left: calc(50% + var(--ring) * cos(var(--angle)));
				`}
		>
			<Avatar.Root>
				<Avatar.Image src={follow.profile?.picture!} alt={follow.profile?.name} />
				<Avatar.Fallback>{follow.profile?.name}({follow.influenceScore})</Avatar.Fallback>
			</Avatar.Root>
		</div>
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
