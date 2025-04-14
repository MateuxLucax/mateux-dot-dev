<script>
  
	let { children } = $props();

</script>

<li class="flex flex-row gap-2 flex-wrap w-full break-all">
  {@render children()}
</li>