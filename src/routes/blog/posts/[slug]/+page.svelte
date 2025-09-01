<script lang="ts">
	import { formatDate } from '$lib/utils';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.meta.title}</title>
	<meta property="og:type" content="article" />
	<meta property="og:title" content={data.meta.title} />
	<meta property="og:description" content={data.meta.description} />
</svelte:head>

<article>
	<header class="mb-8 flex flex-col gap-2">
		<a
			href="/blog"
			target="_self"
			class="mb-6 text-blue-500 underline hover:text-blue-300 dark:text-blue-200 dark:hover:text-blue-100"
			>&larr; Back to posts</a
		>

		<h1 class="mb-2 text-3xl font-bold">{data.meta.title}</h1>
		<p>Published at {formatDate(data.meta.date)}</p>
		<section>
			{#each data.meta.tags as tag}
				<span
					class="mr-2 mb-2 inline-block rounded bg-gray-200 px-2 py-1 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
				>
					{tag}
				</span>
			{/each}
		</section>
	</header>

	<section>
		{#each data.meta.categories as category}
			<span>&num;{category}</span>
		{/each}
	</section>

	<section class="prose max-w-prose">
		<data.content />
	</section>
</article>

<style>
	.prose {
		max-width: 100%;
	}

	* {
		--tw-prose-links: var(--color-blue-600);
		--tw-prose-code: var(--color-green-600);
		--tw-prose-headings: var(--color-red-800);
		--tw-prose-bold: var(--color-gray-900);
	}

	@media (prefers-color-scheme: dark) {
		* {
			--tw-prose-body: var(--color-white);
			--tw-prose-headings: var(--color-red-200);
			--tw-prose-links: var(--color-blue-200);
			--tw-prose-code: var(--color-green-200);
			--tw-prose-quotes: var(--color-gray-200);
			--tw-prose-bold: var(--color-gray-100);
		}
	}
</style>
