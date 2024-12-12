<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import {
		DropdownMenu,
		DropdownMenuContent,
		DropdownMenuItem,
		DropdownMenuTrigger
	} from '$lib/components/ui/dropdown-menu/index.js';
	import { Moon, Sun } from 'lucide-svelte/icons';
</script>

<DropdownMenu>
	<DropdownMenuTrigger>
		<Button
			class="hidden focus-visible:outline-none focus-visible:ring-transparent sm:flex"
			variant="outline"
			size="icon"
		>
			<Sun
				class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
			/>
			<Moon
				class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
			/>
			<span class="sr-only">Toggle theme</span>
		</Button>
	</DropdownMenuTrigger>
	<DropdownMenuContent align="end">
		<DropdownMenuItem on:click={() => console.log('light')}>Light</DropdownMenuItem>
		<DropdownMenuItem on:click={() => console.log('dark')}>Dark</DropdownMenuItem>
		<DropdownMenuItem on:click={() => console.log('system')}>System</DropdownMenuItem>
	</DropdownMenuContent>
</DropdownMenu>
