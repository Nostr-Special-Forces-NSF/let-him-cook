<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { formSchema, type FormSchema } from './schema';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';

	export let data: SuperValidated<Infer<FormSchema>>;

	const form = superForm(data, {
		validators: zodClient(formSchema)
	});

	const { form: formData, enhance } = form;
</script>

<form method="POST" use:enhance>
	<Form.Field {form} name="npub">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>npub</Form.Label>
				<Input {...props} bind:value={$formData.npub} />
			{/snippet}
		</Form.Control>
		<Form.Description>npub</Form.Description>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="relay">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Relay</Form.Label>
				<Input {...props} bind:value={$formData.relay} />
			{/snippet}
		</Form.Control>
		<Form.Description>Relay</Form.Description>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="ingredients">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Ingredients</Form.Label>
				<Input {...props} bind:value={$formData.ingredients} />
			{/snippet}
		</Form.Control>
		<Form.Description>Ingredients</Form.Description>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="directions">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Directions</Form.Label>
				<Input {...props} bind:value={$formData.directions} />
			{/snippet}
		</Form.Control>
		<Form.Description>Directions</Form.Description>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Button>Submit</Form.Button>
</form>
