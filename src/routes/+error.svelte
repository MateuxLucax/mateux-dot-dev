<script>
  import { page } from '$app/state';
	import Cursor from '$lib/components/Cursor.svelte';
	import Prompt from '$lib/components/Prompt.svelte';
	import Row from '$lib/components/Row.svelte';
	import { onMount } from 'svelte';

	onMount(() => {
		setTimeout(() => {
			window.location.href = '/';
		}, 5000);
	});
</script>

<svelte:head>
	<title>mateux@tars ~/{page.url.pathname}</title>
</svelte:head>

<Row><Prompt /> cd <span class="text-red-600 dark:text-red-300">~{page.url.pathname}<span class="text-pink-400 dark:text-pink-100">></span></span></Row>
{#if page.status === 404}
	<Row>cd: The directory "{page.url.pathname}" does not exist</Row>
{:else if page.status === 500}
	<Row>cd: An error occurred while trying to access "{page.url.pathname}"</Row>
{/if}
<Row><Prompt /><Cursor /></Row>