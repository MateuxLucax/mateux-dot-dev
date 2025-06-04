<script>
  import { onMount } from 'svelte';
  import mermaid from 'mermaid';
	import { isDarkMode } from '$lib/utils';

  export let diagram = '';


  onMount(() => {
    mermaid.initialize({
      startOnLoad: false,
      wrap: true,
      theme: isDarkMode() ? 'dark' : 'default',
    });
    mermaid.run({
      nodes: document.querySelectorAll('.mermaid'),
    });
  });
</script>

<div class="mermaid w-full grow flex justify-center items-center">{diagram}</div>