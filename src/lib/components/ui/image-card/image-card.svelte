<script lang="ts">
	import type { WithElementRef } from 'bits-ui';
	import { cn } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		href = $bindable(),
		imageUrl = $bindable(),
		class: className,
		onClick,
		uploadText = "Click to upload an image",
		...restProps
	}: WithElementRef<HTMLDivElement> & {
		href?: string;
		imageUrl?: string | null;
		onClick?: () => void;
	} = $props();

	const handleClick = () => {
		if (onClick) {
			onClick();
		}
	};
</script>

<svelte:element
	this={href ? 'a' : 'div'}
	role="button"
	tabindex="0"
	bind:this={ref}
	{href}
	class={cn(
		'block cursor-pointer overflow-hidden rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
		className
	)}
	onclick={handleClick}
	{...restProps}
>
	{#if imageUrl != null}
		<div class="h-auto w-full">
			<img src={imageUrl} alt="" class="h-auto w-full rounded-md object-cover" />
		</div>
	{:else}
		<div
			class="flex h-40 w-full items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-100 text-center text-sm text-gray-500"
		>
			{uploadText}
		</div>
	{/if}
</svelte:element>
