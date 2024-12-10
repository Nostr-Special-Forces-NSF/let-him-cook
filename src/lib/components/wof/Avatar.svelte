<script lang="ts">
	export let imageUrl: string | null;
	export let size: "small" | "medium" | "large" = "medium";

	const sizeClasses = {
		small: "w-10 h-10",
		medium: "w-16 h-16",
		large: "w-24 h-24"
	};
</script>

<div class={`rounded-full overflow-hidden ${sizeClasses[size]}`}>
	{#if imageUrl}
		<img src={imageUrl} alt="Avatar" class="w-full h-full object-cover" />
	{:else}
		<div class="bg-gray-200 w-full h-full flex items-center justify-center">
			<span class="text-sm text-gray-500">No Image</span>
		</div>
	{/if}
</div>
