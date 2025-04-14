<script>
	import { onMount } from 'svelte';
	import '../app.css';
	import TerminalHeader from '../lib/TerminalHeader.svelte';
	import ActivityBar from '../lib/ActivityBar.svelte';

	let { children } = $props();

  let showXLImage = $state(false);

  onMount(() => {
    const media = window.matchMedia('(min-width: 1280px)');
    showXLImage = media.matches;

    media.addEventListener('change', (event) => {
			const willMatch = event.matches;

			if (willMatch !== showXLImage) {
				showXLImage = willMatch;
			}
		});
  });
</script>

<ActivityBar />

<main
  class="min-h-screen bg-base text-text font-mono flex xl:items-center xl:justify-center w-full"
>
  {#if showXLImage}
		<enhanced:img
			src="/static/background.jpg?blur=5" 
			sizes="min(1280px, 100vw)"
			alt="Forest with enormeous trees"
			class="fixed inset-0 -z-10 w-full h-full object-cover"
		/>
	{/if}	
	<section
		class="xl:relative w-full max-w-7xl xl:max-w-4xl shadow-md border-2xl xl:rounded-xl overflow-hidden"
	>
		<TerminalHeader />
		<section class="p-4 xl:p-8 h-full bg-white dark:bg-gray-800 dark:text-white terminal-body overflow-y-auto">
  		<ul class="list-none gap-2 flex flex-col">
				{@render children()}
			</ul>
	</section>
</main>

<style>
	@media (min-width: 1280px) {
		.terminal-body {
			max-height: var(--container-2xl);
		}
	}
</style>