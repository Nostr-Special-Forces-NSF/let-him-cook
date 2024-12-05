<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Toggle } from '$lib/components/ui/toggle/index.js';
	import * as Drawer from '$lib/components/ui/drawer/index.js';

	import { fetchRecipes, tag } from '$lib/nostr.js';
	import { onMount } from 'svelte';

	const filters = ['Ingredients', 'Cuisine', 'Prep Time'];
	const ingredients = ['cheese', 'noodles', 'popcorn'];
	let recipes = [];

	async function getRecipes() {
		const res = await fetchRecipes();
		console.log('res', res);
		recipes = res;

		console.log('recipes', recipes);
	}

	onMount(getRecipes);
</script>

<div class="flex flex-col">
	<div class="my-2 flex gap-1.5">
		{#each filters as filter}
			<Drawer.Root>
				<Drawer.Trigger>
					<Badge variant="outline">{filter}</Badge>
				</Drawer.Trigger>
				<Drawer.Content>
					<div class="mx-auto w-full max-w-sm">
						<Drawer.Header>
							<Drawer.Title>{filter}</Drawer.Title>
							<Drawer.Description>Select your ingredients</Drawer.Description>
						</Drawer.Header>
						<div class="p-4 pb-0">
							<div class="flex-col items-center justify-center space-x-2">
								<div class="grid gap-4 py-4">
									<div class="grid grid-cols-4 items-center gap-4">
										{#each ingredients as ingredient}
											<div class="my-2 flex w-full gap-1.5">
												<Toggle variant="outline" aria-label="Toggle italic">
													{ingredient}
												</Toggle>
											</div>
										{/each}
									</div>
								</div>
								<Drawer.Footer>
									<Button>Apply</Button>
									<Drawer.Close class={buttonVariants({ variant: 'outline' })}>Clear</Drawer.Close>
								</Drawer.Footer>
							</div>
						</div>
					</div>
				</Drawer.Content>
			</Drawer.Root>
		{/each}
	</div>

	<div class="my-8 flex flex-wrap gap-5">
		{#each recipes as recipe}
			<Card.Root class="max-w-[15%] w-[15%] grow">
				<Card.Header>
					<Card.Title>{tag('title', recipe)}</Card.Title>
				</Card.Header>
				<Card.Content>
					<img src={tag('image', recipe)} alt="Recipe" />
				</Card.Content>
			</Card.Root>
		{/each}
	</div>
</div>
