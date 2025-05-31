<script>
  import { page } from '$app/state';
	import Cursor from '$lib/Cursor.svelte';
	import Prompt from '$lib/Prompt.svelte';
	import Row from '$lib/Row.svelte';
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
<Row>cd: The directory "{page.url.pathname}" does not exist</Row>
<Row><Prompt /><Cursor /></Row>