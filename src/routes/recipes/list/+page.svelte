<script lang="ts">
	export let data: { recipes: Array<any>; error?: string };

	let fallbackImage = '/icons/dish.png';

	function getRecipeTitle(tags: Array<[string, ...string[]]>): string {
		return tags.find((tag) => tag[0] === 'title')?.[1] || 'Untitled Recipe';
	}

	function getRecipeId(tags: Array<[string, ...string[]]>): string | undefined {
		return tags.find((tag) => tag[0] === 'd')?.[1];
	}

	function getRecipeImage(tags: Array<[string, ...string[]]>): string | undefined {
		const image = tags.find((tag) => tag[0] === 'image')?.[1];
		return image || fallbackImage;
	}

	const handleError = (event: Event) => {
		const img = event.target as HTMLImageElement;
		img.src = fallbackImage;
	};
</script>

{#if data.error}
	<p class="error">{data.error}</p>
{/if}

{#if data.recipes.length > 0}
	<ul class="recipe-list">
		{#each data.recipes as recipe}
			<li>
				<a href={`/recipes/${getRecipeId(recipe.tags)}`}>
					{#if getRecipeImage(recipe.tags)}
						<img
							src={getRecipeImage(recipe.tags)}
							alt={getRecipeTitle(recipe.tags)}
							class="recipe-icon"
							onerror={handleError}
						/>
					{/if}
					{getRecipeTitle(recipe.tags)}
				</a>
			</li>
		{/each}
	</ul>
{:else}
	<p>No recipes found.</p>
{/if}

<style>
	.recipe-list {
		list-style-type: none;
		padding: 0;
	}
	.recipe-list li {
		margin: 0.5rem 0;
		display: flex;
		align-items: center;
	}
	.recipe-list a {
		text-decoration: none;
		color: blue;
		display: flex;
		align-items: center;
	}
	.recipe-list a:hover {
		text-decoration: underline;
	}
	.recipe-icon {
		width: 30px; /* Set the size of the icon */
		height: 30px;
		margin-right: 10px; /* Add space between the icon and the title */
		border-radius: 50%; /* Optional: make the image circular */
		object-fit: cover; /* Ensure the image fits the dimensions */
	}
</style>
