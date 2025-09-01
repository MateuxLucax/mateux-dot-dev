<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';
	import { tick } from 'svelte';
	import ActivityBar from '$lib/components/ActivityBar.svelte';
	import TerminalHeader from '$lib/components/TerminalHeader.svelte';

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
		});
	});
</script>

<ActivityBar />

<main
	class="bg-base text-text flex min-h-screen w-full font-mono md:items-center md:justify-center"
>
	<enhanced:img
		src="/static/background.jpg?blur=5"
		alt="Forest with enormeous trees"
		class="fixed inset-0 -z-10 h-full w-full object-cover"
	/>
	<section
		class="border-2xl w-full max-w-7xl overflow-hidden shadow-md md:relative md:max-w-4xl md:rounded-xl"
	>
		<TerminalHeader />
		<section
			bind:this={terminalSection}
			class="terminal-body h-full overflow-y-auto bg-white p-4 md:p-8 dark:bg-gray-800 dark:text-white"
		>
			<ul class="flex list-none flex-col gap-2">
				{@render children?.()}
			</ul>
		</section>
	</section>
</main>

<style>
	@media (min-width: 768px) {
		.terminal-body {
			max-height: calc(100dvh - 196px);
			transition: max-height 0.3s ease-in-out;
		}
	}

	/* Syntax highlighting theme switching */
	:global(.shiki-dark) {
		display: none;
	}

	:global(.shiki-light) {
		display: block;
	}

	@media (prefers-color-scheme: dark) {
		:global(.shiki-dark) {
			display: block;
		}

		:global(.shiki-light) {
			display: none;
		}
	}
</style>
