<script lang="ts">
	import Row from "$lib/components/Row.svelte";
	import Prompt from "$lib/components/Prompt.svelte";

	let { data } = $props();
</script>

<Row><Prompt /> cd <span class="text-yellow-500 dark:text-yellow-300">~/Blog</span></Row>
{#if data.posts.length > 0}
  <Row><Prompt path="/Blog" /> ls -1	</Row>
  <Row>total {data.posts.length}</Row>
  {#each data.posts as post}
    <Row>
      <a href={`/blog/posts/${post.slug}`} class="text-blue-500 dark:text-blue-300 underline underline-offset-2 hover:bg-gray-200 active:bg-gray-300 focus:bg-gray-300 dark:hover:bg-gray-700 dark:active:bg-gray-600 dark:focus:bg-gray-600">
        {post.title}/
      </a>
      <span class="text-gray-500 dark:text-gray-400"># {post.description}</span>
    </Row>
  {/each}
{/if}
