<script lang="ts">
  import { onMount, tick } from 'svelte';
  import mermaid from 'mermaid';
  import { isDarkMode } from '$lib/utils';

  export let diagram = '';
  let diagramElement: HTMLElement;
  let currentTheme: 'dark' | 'default' = isDarkMode() ? 'dark' : 'default';

  async function renderDiagram() {
    if (!diagramElement) return;

    mermaid.initialize({
      startOnLoad: false,
      wrap: true,
      theme: currentTheme,
    });

    try {
      await mermaid.run({
        nodes: [diagramElement],
        querySelector: '.mermaid',
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

<div bind:this={diagramElement} class="mermaid w-full grow flex justify-center items-center">{diagram}</div>