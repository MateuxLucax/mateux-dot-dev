<script>
	let { children } = $props();
</script>

<div class="flex w-full flex-row flex-wrap gap-2 break-all">
	{@render children()}
</div>
