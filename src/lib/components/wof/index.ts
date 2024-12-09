import { buildWebOfFlavor } from './buildWebOfFlavor';
import { fetchRelayList } from './fetchRelayList';
import { enhanceAndScoreFollowers } from './scoreFollowers';
import { buildInitialFollowerNetwork } from './wof';

export async function computeWebOfFlavor(userPubkey: string) {
	const relays = await fetchRelayList(userPubkey);
	const network = await buildInitialFollowerNetwork({ userPubkey, relays });
	const scoredFollowers = await enhanceAndScoreFollowers(userPubkey, network, relays);
	const wof = buildWebOfFlavor({
		userPubkey: userPubkey,
		followerNetwork: scoredFollowers,
		relays: relays,
		topN: 10
	});
	return wof;
}
