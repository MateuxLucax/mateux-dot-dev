<script>
  import { page } from '$app/state';
	import Cursor from '$lib/Cursor.svelte';
	import Prompt from '$lib/Prompt.svelte';
	import Row from '$lib/Row.svelte';
</script>

<Row><Prompt /> cd <span class="text-yellow-500 dark:text-yellow-300">~{page.url.pathname}</span></Row>
<Row>cd: The directory 'test' does not exist</Row>
<Row><Prompt /><Cursor /></Row>