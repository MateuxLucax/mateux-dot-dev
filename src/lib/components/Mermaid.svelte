<script lang="ts">
	import { onMount, tick } from 'svelte';
	import mermaid from 'mermaid';
	import { isDarkMode } from '$lib/utils';

	let { diagram }: { diagram: string } = $props();

	let diagramElement: HTMLElement | null;
	let currentTheme: 'dark' | 'default' = isDarkMode() ? 'dark' : 'default';

	async function renderDiagram() {
		if (!diagramElement) return;

		mermaid.initialize({
			startOnLoad: false,
			wrap: true,
			theme: currentTheme
		});

		try {
			await mermaid.run({
				nodes: [diagramElement],
				querySelector: '.mermaid'
			});
		} catch (error) {
			console.error('Error rendering mermaid diagram:', error);
		}
	}

	onMount(() => {
		renderDiagram();

		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

		const handleThemeChange = async (e: MediaQueryListEvent) => {
			await tick();
			currentTheme = e.matches ? 'dark' : 'default';
			renderDiagram();
		};

		mediaQuery.addEventListener('change', handleThemeChange);

		return () => {
			mediaQuery.removeEventListener('change', handleThemeChange);
		};
	});
</script>

<div bind:this={diagramElement} class="mermaid flex w-full grow items-center justify-center">
	{diagram}
</div>
