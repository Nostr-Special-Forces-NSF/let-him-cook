<script lang="ts">
	import type { HTMLInputAttributes } from "svelte/elements";
	import type { WithElementRef } from "bits-ui";
	import { cn } from "$lib/utils.js";
	import { writable, type Writable } from "svelte/store";


	let {
		placeholder = "Add new item",
		ref = $bindable(null),
		value = $bindable(),
		items = $bindable([]),
		class: className,
		...restProps
	}: WithElementRef<HTMLInputAttributes> = $props();

	let inputValue = $state("");

	// Add a new item to the store
	const addItem = () => {
		if (inputValue.trim() && !$items.includes(inputValue.trim())) {
			items.update((currentItems) => [...currentItems, inputValue.trim()]);
			inputValue = ""; // Reset the input
		}
	};

	// Remove an item from the store
	const removeItem = (itemToRemove: string) => {
		items.update((currentItems) => currentItems.filter((item) => item !== itemToRemove));
	};
</script>

<div
	class={cn(
		"pills-container flex flex-wrap gap-2",
		className
	)}
>
	<!-- Render pills -->
	{#each $items as item}
		<div
			class={cn(
				"pill flex items-center bg-muted px-2 py-1 rounded-full text-sm",
				"border border-input"
			)}
		>
			<span class="pill-label mr-1">{item}</span>
			<button
				type="button"
				class="pill-remove text-danger hover:text-danger-focus"
				aria-label="Remove item"
			>
				&times;
			</button>
		</div>
	{/each}

	<!-- Input for adding new items -->
	<input
		bind:this={ref}
		bind:value
		placeholder={placeholder}
		class={cn(
			"input flex-grow bg-background border px-3 py-2 text-sm rounded-md focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
			className
		)}
		{...restProps}
	/>
</div>

<style>
	.pills-container {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.pill {
		display: flex;
		align-items: center;
		background-color: var(--bg-muted);
		border-radius: var(--radius-md);
		padding: 0.25rem 0.5rem;
		font-size: var(--font-size-sm);
		color: var(--text-muted);
	}
	.pill-remove {
		border: none;
		background: none;
		color: var(--text-danger);
		cursor: pointer;
		font-size: 1rem;
	}
	.input {
		flex-grow: 1;
		padding: 0.5rem;
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		outline: none;
		font-size: var(--font-size-sm);
	}
</style>
