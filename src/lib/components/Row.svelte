<script>
	let { children } = $props();
</script>

<li class="flex w-full flex-row flex-wrap gap-2 break-all">
	{@render children()}
</li>
