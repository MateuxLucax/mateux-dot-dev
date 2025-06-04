<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';
	import { tick } from "svelte";
	import TerminalHeader from '$lib/components/TerminalHeader.svelte';
	import ActivityBar from '$lib/components/ActivityBar.svelte';

	let { children } = $props();

  let terminalSection: HTMLElement | null = null;

  onMount(() => {
  	window.addEventListener('on-new-commmand', async (_) => {

			await tick();

			if (!terminalSection) return;
			terminalSection.scrollTo({
				top: terminalSection.scrollHeight * 2,
				behavior: 'smooth'
			});
		})
  });
</script>

<ActivityBar />

<main
  class="min-h-screen bg-base text-text font-mono flex md:items-center md:justify-center w-full"
>
	<enhanced:img
		src="/static/background.jpg?blur=5"
		alt="Forest with enormeous trees"
		class="fixed inset-0 -z-10 w-full h-full object-cover"
	/>
	<section
		class="md:relative w-full max-w-7xl md:max-w-4xl shadow-md border-2xl md:rounded-xl overflow-hidden"
	>
		<TerminalHeader />
		<section
			bind:this={terminalSection}
			class="p-4 md:p-8 h-full bg-white dark:bg-gray-800 dark:text-white terminal-body overflow-y-auto"
		>
  		<ul class="list-none gap-2 flex flex-col">
				{@render children()}
			</ul>
	</section>
</main>
<style>
	@media (min-width: 768px) {
		.terminal-body {
			max-height: calc(100dvh - 196px);
			transition: max-height 0.3s ease-in-out;
		}
	}
</style>