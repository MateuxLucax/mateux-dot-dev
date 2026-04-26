<script lang="ts">
	import Row from '$lib/components/Row.svelte';
	import Prompt from '$lib/components/Prompt.svelte';
	import { formatDate } from '$lib/utils';

	let { data } = $props();
</script>

<svelte:head>
	<title>mateux@tars ~/Blog</title>
	<meta property="og:type" content="website" />
	<meta property="og:title" content="mateux.dev blog" />
	<meta
		property="og:description"
		content="Posts about software engineering, distributed systems, and developer tooling."
	/>
</svelte:head>

<Row><Prompt /> cd <span class="text-yellow-500 dark:text-yellow-300">~/Blog</span></Row>
<Row
	><Prompt path="/Blog" />
	<span class="text-gray-700 dark:text-gray-300"
		># <a
			href="/blog/rss.xml"
			class="text-blue-500 underline hover:text-blue-300 dark:text-blue-300 dark:hover:text-blue-100"
			>rss.xml</a
		></span
	></Row
>
{#if data.posts.length > 0}
	<Row><Prompt path="/Blog" /> ls -1</Row>
	<Row>total {data.posts.length}</Row>
	{#each data.posts as post}
		<Row>
			<a
				href={`/blog/posts/${post.slug}`}
				class="text-blue-500 underline underline-offset-2 hover:bg-gray-200 focus:bg-gray-300 active:bg-gray-300 dark:text-blue-300 dark:hover:bg-gray-700 dark:focus:bg-gray-600 dark:active:bg-gray-600"
			>
				{post.title}/
			</a>
			<span class="text-gray-700 dark:text-gray-300">
				# {formatDate(post.date)} &middot; {post.readingTime} min read &middot; {post.description}
			</span>
		</Row>
	{/each}
{/if}
