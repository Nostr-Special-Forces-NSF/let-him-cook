<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Toggle } from '$lib/components/ui/toggle/index.js';
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import { FILTERS } from '$lib/constants';
	import { fetchRecipes, tag } from '$lib/nostr.js';
	import { onMount } from 'svelte';

	let recipes = [];

	const selectedFilters = [
		{ name: 'Ingredients', values: [] },
		{ name: 'Cuisine', values: [] },
		{ name: 'Category', values: [] },
		{ name: 'Prep Time', values: [] },
		{ name: 'Cook Time', values: [] },
		{ name: 'Servings', values: [] },
		{ name: 'Author', values: [] }
	];

	async function getRecipes() {
		const res = await fetchRecipes();
		recipes = res;
	}

	function findFilterIndex(filterName) {
		return selectedFilters.findIndex((filter) => filter.name === filterName);
	}

	function includesFilter(filterName, filterValue) {
		const filterIndex = findFilterIndex(filterName);

		if (filterIndex !== -1) {
			if (selectedFilters[filterIndex].values.includes(filterValue)) {
				return true;
			}
		}

		return false;
	}

	function addFilter(filterName, filterValue) {
		const filterIndex = findFilterIndex(filterName);

		if (filterIndex !== -1) {
			const valuesIndex = selectedFilters[filterIndex].values.findIndex(
				(value) => value === filterValue
			);

			if (valuesIndex === -1) {
				selectedFilters[filterIndex].values.push(filterValue);
			} else {
				selectedFilters[filterIndex].values.splice(valuesIndex, 1);
			}
		}
	}

	function clearFilters(filterName) {
		const filterIndex = findFilterIndex(filterName);

		if (filterIndex !== -1) {
			selectedFilters[filterIndex].values = [];
		}
	}

	onMount(getRecipes);
</script>

<div class="flex flex-col">
	<div class="my-2 flex gap-1.5">
		{#each FILTERS as filter}
			<Drawer.Root>
				<Drawer.Trigger>
					<Badge variant="outline" class="px-3 py-1 text-sm">{filter.name}</Badge>
				</Drawer.Trigger>
				<Drawer.Content>
					<div class="mx-auto w-full max-w-sm">
						<Drawer.Header>
							<Drawer.Title>{filter.name}</Drawer.Title>
							<Drawer.Description>Select your {filter.name.toLowerCase()}</Drawer.Description>
						</Drawer.Header>
						<div class="p-4 pb-0">
							<div class="flex-col items-center justify-center space-x-2">
								<div class="grid gap-4 py-4">
									<div class="grid grid-cols-4 items-center gap-4">
										{#each filter.values as value}
											<div class="my-2 flex w-full gap-1.5">
												<Toggle
													variant="outline"
													aria-label="Toggle italic"
													onclick={() => {
														addFilter(filter.name, value);
													}}
													pressed={includesFilter(filter.name, value)}
												>
													{value}
												</Toggle>
											</div>
										{/each}
									</div>
								</div>
								<Drawer.Footer>
									<Button>Apply</Button>
									<Drawer.Close
										class={buttonVariants({ variant: 'outline' })}
										onclick={() => {
											clearFilters(filter.name);
										}}>Clear</Drawer.Close
									>
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
			<Card.Root class="flex w-[15%] max-w-[15%] grow flex-col">
				<Card.Header>
					<Card.Title>{tag('title', recipe)}</Card.Title>
				</Card.Header>
				<Card.Content class="flex grow items-end px-0 pb-0 pt-4">
					<img class="rounded-lg" src={tag('image', recipe)} alt="Recipe" />
				</Card.Content>
			</Card.Root>
		{/each}
	</div>
</div>
