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
	let matchedRecipes = [];

	const selectedFilters = [
		{ name: 'ingredients', values: [] },
		{ name: 'cuisine', values: [] },
		{ name: 'category', values: [] },
		{ name: 'prep_time', values: [] },
		{ name: 'cook_time', values: [] },
		{ name: 'servings', values: [] },
		{ name: 'author', values: [] }
	];

	async function getRecipes() {
		const res = await fetchRecipes();
		recipes = res;
		matchedRecipes = res;
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

	function applyFilters() {
		const filteredRecipes = [];
		let numberOfMatchesNeeded = 0;

		selectedFilters.forEach((filter) => {
			numberOfMatchesNeeded = numberOfMatchesNeeded + filter.values.length;
		});

		const numberOfRecipes = recipes.length;
		const matchesFoundForEachRecipe = new Array(numberOfRecipes).fill(0);

		if (numberOfMatchesNeeded === 0) {
			matchedRecipes = recipes;
		} else {
			selectedFilters.forEach((filter) => {
				filter.values.forEach((value) => {
					recipes.forEach((recipe, recipeIndex) => {
						for (let tag of recipe.tags) {
							if (filter.name === tag[0]) {
								const regex = new RegExp('(^|\\W)' + value + '($|\\W)', 'i');
								const result = tag[1].match(regex);
								if (result !== null) {
									matchesFoundForEachRecipe[recipeIndex] =
										matchesFoundForEachRecipe[recipeIndex] + 1;
									break;
								}
							}
						}
						if (numberOfMatchesNeeded === matchesFoundForEachRecipe[recipeIndex]) {
							filteredRecipes.push(recipe);
						}
					});
				});
			});

			matchedRecipes = filteredRecipes;
		}
	}

	function clearFilters(filterName) {
		const filterIndex = findFilterIndex(filterName);

		if (filterIndex !== -1) {
			selectedFilters[filterIndex].values = [];
		}

		matchedRecipes = recipes;
	}

	onMount(getRecipes);
</script>

<div class="flex flex-col">
	<div class="my-2 flex gap-1.5">
		{#each FILTERS as filter}
			<Drawer.Root>
				<Drawer.Trigger>
					<Badge variant="outline" class="px-3 py-1 text-sm">{filter.displayName}</Badge>
				</Drawer.Trigger>
				<Drawer.Content>
					<div class="mx-auto w-full max-w-sm">
						<Drawer.Header>
							<Drawer.Title>{filter.displayName}</Drawer.Title>
							<Drawer.Description>Select your {filter.displayName.toLowerCase()}</Drawer.Description
							>
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
													onclick={() => addFilter(filter.name, value)}
													pressed={includesFilter(filter.name, value)}
												>
													{value}
												</Toggle>
											</div>
										{/each}
									</div>
								</div>
								<Drawer.Footer>
									<Button onclick={() => applyFilters()}>Apply</Button>
									<Drawer.Close
										class={buttonVariants({ variant: 'outline' })}
										onclick={() => clearFilters(filter.name)}>Clear</Drawer.Close
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
		{#each matchedRecipes as recipe}
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
