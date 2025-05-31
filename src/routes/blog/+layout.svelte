<script>
  import { page } from '$app/stores';
  let { children } = $props();
</script>

<svelte:head>
  <title>Mateux's Blog</title>
</svelte:head>

{@render children()}
