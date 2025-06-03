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
	<header class="mb-8 flex flex-col gap-2">
		<a href="/blog" target="_self" class="mb-6 underline text-blue-500 hover:text-blue-300">&larr; Back to posts</a>
		
		<h1 class="text-3xl font-bold mb-2">{data.meta.title}</h1>
		<p>Published at {formatDate(data.meta.date)}</p>
		<section>
			{#each data.meta.tags as tag}
				<span class="inline-block bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded mr-2 mb-2">
					{tag}
				</span>
			{/each}
		</section>
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

<style>
	.prose {
		max-width: 100%;
	}
</style>