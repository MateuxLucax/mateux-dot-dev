<script lang="ts">
	import { formatDate } from '$lib/utils';
	import CodeBlockWrapper from '$lib/components/CodeBlockWrapper.svelte';

	let { data } = $props();

	const canonicalUrl = $derived(`https://mateux.dev/blog/posts/${data.meta.slug}`);
	const jsonLd = $derived({
		'@context': 'https://schema.org',
		'@type': 'BlogPosting',
		headline: data.meta.title,
		description: data.meta.description,
		author: {
			'@type': 'Person',
			name: 'Mateus Brandt'
		},
		datePublished: data.meta.date,
		url: canonicalUrl
	});
</script>

<svelte:head>
	<title>{data.meta.title}</title>
	<meta name="description" content={data.meta.description} />
	<link rel="canonical" href={canonicalUrl} />

	<meta property="og:type" content="article" />
	<meta property="og:title" content={data.meta.title} />
	<meta property="og:description" content={data.meta.description} />
	<meta property="og:url" content={canonicalUrl} />

	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={data.meta.title} />
	<meta name="twitter:description" content={data.meta.description} />

	{@html `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/&/g, '\\u0026').replace(/</g, '\\u003c').replace(/>/g, '\\u003e')}</script>`}
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
		<p>
			Published at {formatDate(data.meta.date)}
			{#if data.meta.readingTime}
				&middot; {data.meta.readingTime} min read
			{/if}
		</p>
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

	<section class="prose max-w-prose">
		<CodeBlockWrapper>
			<data.content />
		</CodeBlockWrapper>
	</section>

	{#if data.related && data.related.length > 0}
		<footer class="mt-12 border-t border-gray-200 pt-6 dark:border-gray-700">
			<h2 class="mb-4 text-lg font-bold">Related posts</h2>
			<ul class="flex list-none flex-col gap-2">
				{#each data.related as related}
					<li>
						<a
							href={`/blog/posts/${related.slug}`}
							class="text-blue-500 underline underline-offset-2 hover:bg-gray-200 focus:bg-gray-300 active:bg-gray-300 dark:text-blue-300 dark:hover:bg-gray-700 dark:focus:bg-gray-600 dark:active:bg-gray-600"
						>
							{related.title}/
						</a>
					</li>
				{/each}
			</ul>
		</footer>
	{/if}
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
