<script lang="ts">
	import { onMount } from 'svelte';
	import { createRocket } from './engine';

	let canvas: HTMLCanvasElement;

	onMount(() => {
		const readHashTime = () => {
			const match = /(?:^|&)t=([\d.]+)(?:&|$)/.exec(window.location.hash.slice(1));
			return match ? Number(match[1]) : Number.NaN;
		};
		const engine = createRocket(canvas, {
			mode: 'launch',
			launchLayer: 'flight',
			time: readHashTime()
		});
		const updateTime = () => engine.setTime(readHashTime());
		const themeObserver = new MutationObserver(() => engine.redraw());
		themeObserver.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-theme']
		});
		window.addEventListener('hashchange', updateTime);
		const sheet = canvas.closest<HTMLElement>('.sheet');
		const figure = document.querySelector<HTMLElement>('.rocket-figure');
		if (!sheet || !figure) {
			engine.destroy();
			return;
		}

		const positionPad = () => {
			const canvasRect = canvas.getBoundingClientRect();
			const figureRect = figure.getBoundingClientRect();
			const unit = Math.min(figureRect.height / 13.5, figureRect.width / 6.4);
			const centerX = figureRect.width * 0.6;
			const centerY = figureRect.height - 44 - 0.9 * Math.cos(0.28) * unit;
			engine.setLaunchPlacement({
				x: figureRect.left - canvasRect.left + centerX,
				y: figureRect.top - canvasRect.top + centerY,
				unit
			});
		};
		const resizeObserver = new ResizeObserver(positionPad);
		resizeObserver.observe(sheet);
		resizeObserver.observe(figure);
		window.addEventListener('resize', positionPad);
		positionPad();

		return () => {
			resizeObserver.disconnect();
			window.removeEventListener('resize', positionPad);
			window.removeEventListener('hashchange', updateTime);
			themeObserver.disconnect();
			engine.destroy();
		};
	});
</script>

<div class="flight-layer" aria-hidden="true">
	<canvas bind:this={canvas} class="rocket-flight-canvas"></canvas>
</div>

<style>
	.flight-layer {
		position: absolute;
		z-index: 0;
		inset: 0;
		overflow: hidden;
		pointer-events: none;
	}

	canvas {
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
