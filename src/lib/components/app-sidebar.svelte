<script lang="ts">
	import House from 'lucide-svelte/icons/house';
	import CookingPot from 'lucide-svelte/icons/cooking-pot';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';

	// Menu items
	const items = [
		{
			title: 'Home',
			url: '/',
			icon: House
		},
		{
			title: 'Recipes',
			url: '/recipes/list',
			icon: CookingPot
		}
	];
</script>

<Sidebar.Root>
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel>Let Him Cook</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each items as item (item.title)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton>
								{#snippet child({ props })}
									<a href={item.url} {...props}>
										<item.icon />
										<span>{item.title}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>
</Sidebar.Root>
