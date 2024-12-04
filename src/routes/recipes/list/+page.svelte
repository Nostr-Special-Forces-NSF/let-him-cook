<script lang="ts">
	export let data: { recipes: Array<any>; error?: string };

	function getRecipeTitle(tags: Array<[string, ...string[]]>): string {
		return tags.find((tag) => tag[0] === 'title')?.[1] || 'Untitled Recipe';
	}

	function getRecipeId(tags: Array<[string, ...string[]]>): string | undefined {
		return tags.find((tag) => tag[0] === 'd')?.[1];
	}
</script>

{#if data.error}
	<p class="error">{data.error}</p>
{/if}

{#if data.recipes.length > 0}
	<ul class="recipe-list">
		{#each data.recipes as recipe}
			<li>
				<a href={`/recipes/${getRecipeId(recipe.tags)}`}>
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
	}
	.recipe-list a {
		text-decoration: none;
		color: blue;
	}
	.recipe-list a:hover {
		text-decoration: underline;
	}
</style>
