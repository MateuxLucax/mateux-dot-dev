<script>
	let { children } = $props();
</script>

<svelte:head>
	<title>mateux@tars ~/Blog&gt;</title>
	<link rel="alternate" type="application/atom+xml" title="mateux.dev blog" href="/blog/rss.xml" />
</svelte:head>

{@render children()}
