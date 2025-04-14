<script>
  import { page } from '$app/state';
	import Prompt from '../components/Prompt.svelte';
</script>

<li><Prompt /> cd <span class="text-yellow-500 dark:text-yellow-300">~{page.url.pathname}</span></li>
<li>cd: The directory 'test' does not exist</li>
<li><Prompt /></li>