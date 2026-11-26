<script lang="ts">
	import { onMount } from 'svelte';
	import { createRocket, type RocketMode } from './engine';

	interface Props {
		mode: RocketMode;
		class?: string;
		label?: string;
	}

	const defaultLabels: Record<RocketMode, string> = {
		launch: 'Wireframe drawing of a two-stage rocket launching',
		exploded: 'Wireframe drawing of an exploded two-stage rocket',
		tumble: 'Wireframe drawing of a rocket tumbling in space'
	};

	let { mode, class: className = '', label }: Props = $props();
	let canvas: HTMLCanvasElement;

	onMount(() => {
		const readHashTime = () => {
			const match = /(?:^|&)t=([\d.]+)(?:&|$)/.exec(window.location.hash.slice(1));
			return match ? Number(match[1]) : Number.NaN;
		};
		const engine = createRocket(canvas, { mode, time: readHashTime() });
		const themeObserver = new MutationObserver(() => engine.redraw());
		themeObserver.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-theme']
		});
		const colorScheme = window.matchMedia('(prefers-color-scheme: dark)');
		const redrawForScheme = () => engine.redraw();
		const updateTime = () => engine.setTime(readHashTime());
		colorScheme.addEventListener('change', redrawForScheme);
		window.addEventListener('hashchange', updateTime);

		return () => {
			themeObserver.disconnect();
			colorScheme.removeEventListener('change', redrawForScheme);
			window.removeEventListener('hashchange', updateTime);
			engine.destroy();
		};
	});
</script>

<!-- svelte-ignore a11y_no_interactive_element_to_noninteractive_role -->
<canvas
	bind:this={canvas}
	class={mode === 'launch' ? `rocket-ground-canvas ${className}` : className}
	role="img"
	aria-label={label ?? defaultLabels[mode]}
></canvas>

<style>
	canvas {
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
