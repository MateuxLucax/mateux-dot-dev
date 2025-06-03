<script>
  import { onMount } from 'svelte';
  import mermaid from 'mermaid';
	import { theme } from '$lib/theme';

  export let diagram = '';

  onMount(() => {
    mermaid.initialize({
      startOnLoad: false,
      wrap: true,
      theme: theme.isDark ? 'dark' : 'default',
    });
    mermaid.run({
      nodes: document.querySelectorAll('.mermaid'),
    });
  });
</script>

<div class="mermaid w-full grow flex justify-center items-center">{diagram}</div>