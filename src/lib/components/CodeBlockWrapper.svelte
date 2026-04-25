<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
	let container: HTMLElement;

	onMount(() => {
		if (!container) return;

		const blocks = container.querySelectorAll<HTMLElement>('.shiki-light, .shiki-dark');

		blocks.forEach((block) => {
			const pre = block.querySelector('pre');
			if (!pre || pre.parentElement?.querySelector('.copy-btn')) return;

			const btn = document.createElement('button');
			btn.className =
				'copy-btn absolute top-2 right-2 hidden rounded bg-gray-200 px-2 py-1 text-xs text-gray-700 group-hover:block dark:bg-gray-700 dark:text-gray-200';
			btn.textContent = 'copy';
			btn.setAttribute('aria-label', 'Copy code to clipboard');

			btn.addEventListener('click', async () => {
				const code = pre.textContent || '';
				try {
					await navigator.clipboard.writeText(code);
					btn.textContent = 'copied';
					setTimeout(() => {
						btn.textContent = 'copy';
					}, 1500);
				} catch {
					btn.textContent = 'error';
					setTimeout(() => {
						btn.textContent = 'copy';
					}, 1500);
				}
			});

			pre.parentElement?.classList.add('relative', 'group');
			pre.parentElement?.appendChild(btn);
		});
	});
</script>

<div bind:this={container} class="contents">
	{@render children?.()}
</div>
