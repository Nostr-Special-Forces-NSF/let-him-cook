<script lang="ts">
	import type { PageData } from './$types.js';
	import RecipesForm from '../recipes-form.svelte';
	export let data: PageData;
</script>

<RecipesForm data={data.form} />
