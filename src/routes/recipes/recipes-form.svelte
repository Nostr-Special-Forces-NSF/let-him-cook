<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { formSchema, type FormSchema } from './schema';
	import { Badge } from '$lib/components/ui/badge';
	import { ImageCard } from '$lib/components/ui/image-card/';

	export let data: SuperValidated<Infer<FormSchema>>;

	const form = superForm(data, {
		validators: zodClient(formSchema)
	});

	const { form: formData, enhance } = form;
</script>

<form method="POST" use:enhance>
	<Form.Field {form} name="slug">
		<Form.Control>
			{#snippet children({ props })}
				<Input type="hidden" {...props} bind:value={$formData.slug} />
			{/snippet}
		</Form.Control>
	</Form.Field>
	<Form.Field {form} name="image">
		<Form.Control>
			{#snippet children({ props })}
				<ImageCard
					{...props}
					bind:imageUrl={$formData.image}
					class="w-full"
					uploadText="Cover Image: Drag and drop or click to upload"
				/>
				<Input type="hidden" {...props} bind:value={$formData.image} />
				<Form.Description>Appears on the recipe card</Form.Description>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="title">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Title</Form.Label>
				<Input {...props} bind:value={$formData.title} />
			{/snippet}
		</Form.Control>
		<Form.Description>Title of the recipe.</Form.Description>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="author">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Author</Form.Label>
				<Input {...props} bind:value={$formData.author} />
			{/snippet}
		</Form.Control>
		<Form.Description>Author of the recipe.</Form.Description>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="category">
		<Form.Control>
			<Form.Label>Categories</Form.Label>
			<div class="badge-container">
				{#if $formData.category}
					{#each $formData.category as category (category)}
						<Badge>{category}</Badge>
					{/each}
				{:else}
					<Input />
				{/if}
			</div>
		</Form.Control>
		<Form.Description>Recipe categories</Form.Description>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="cuisine">
		<Form.Control>
			<Form.Label>Cuisine</Form.Label>
			<div class="badge-container">
				{#if $formData.cuisine}
					{#each $formData.cuisine as category (category)}
						<Badge>{category}</Badge>
					{/each}
				{:else}
					<Input />
				{/if}
			</div>
		</Form.Control>
		<Form.Description>Recipe categories</Form.Description>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="summary">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Summary</Form.Label>
				<Textarea
					{...props}
					bind:value={$formData.summary}
					placeholder="Brief summary of the recipe"
				/>
			{/snippet}
		</Form.Control>
		<Form.Description>Short description of the recipe.</Form.Description>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="ingredients">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Ingredients</Form.Label>
				<Textarea
					{...props}
					bind:value={$formData.ingredients}
					placeholder="Enter each ingredient on a new line"
				/>
			{/snippet}
		</Form.Control>
		<Form.Description>List of ingredients, one per line.</Form.Description>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="instructions">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Instructions</Form.Label>
				<Textarea
					{...props}
					bind:value={$formData.instructions}
					placeholder="Enter step-by-step instructions"
				/>
			{/snippet}
		</Form.Control>
		<Form.Description>Step-by-step cooking instructions.</Form.Description>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="prepTime">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Prep Time</Form.Label>
				<Input {...props} bind:value={$formData.prepTime} />
			{/snippet}
		</Form.Control>
		<Form.Description>Preparation time in minutes.</Form.Description>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="cookTime">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Cook Time</Form.Label>
				<Input {...props} bind:value={$formData.cookTime} />
			{/snippet}
		</Form.Control>
		<Form.Description>Cooking time in minutes.</Form.Description>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="servings">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Servings</Form.Label>
				<Input {...props} bind:value={$formData.servings} />
			{/snippet}
		</Form.Control>
		<Form.Description>Number of servings.</Form.Description>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Button>Submit</Form.Button>
</form>

<style>
	.badge-container {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}
</style>
