<script lang="ts">
	import { formatDate } from '$lib/utils'

	let { data } = $props()
</script>

<svelte:head>
	<title>{data.meta.title}</title>
	<meta property="og:type" content="article" />
	<meta property="og:title" content={data.meta.title} />
</svelte:head>

<article>
	<header>
		<a href="/blog" target="_self">Back to posts</a>
		<h1>{data.meta.title}</h1>
		<p>Published at {formatDate(data.meta.date)}</p>
	</header>

	<div>
		{#each data.meta.categories as category}
			<span>&num;{category}</span>
		{/each}
	</div>

	<div class="prose max-w-prose">
		<data.content />
	</div>
</article>