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
			btn.className = 'copy-btn';
			btn.textContent = 'COPY';
			btn.setAttribute('aria-label', 'Copy code to clipboard');

			btn.addEventListener('click', async () => {
				const code = pre.textContent || '';
				try {
					await navigator.clipboard.writeText(code);
					btn.classList.add('done');
					btn.textContent = 'COPIED';
					setTimeout(() => {
						btn.classList.remove('done');
						btn.textContent = 'COPY';
					}, 1600);
				} catch {
					btn.textContent = 'ERROR';
					setTimeout(() => {
						btn.textContent = 'COPY';
					}, 1600);
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
