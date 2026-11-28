<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '#lib/components/Icon.svelte';
	import { createRocket, type RocketMode } from './engine';

	interface Props {
		mode: RocketMode;
		class?: string;
		label?: string;
	}

	const defaultLabels: Record<RocketMode, string> = {
		launch: 'Wireframe drawing of a two-stage rocket ascending',
		exploded: 'Wireframe drawing of an exploded two-stage rocket',
		tumble: 'Wireframe drawing of a rocket tumbling in space'
	};

	let { mode, class: className = '', label }: Props = $props();
	let canvas: HTMLCanvasElement;
	let paused = $state(false);
	let engine: ReturnType<typeof createRocket> | undefined;

	function toggleAnimation() {
		paused = !paused;
		engine?.setPaused(paused);
		try {
			localStorage.setItem('animation-paused', String(paused));
		} catch {
			// The current page still honors the choice when storage is unavailable.
		}
	}

	onMount(() => {
		const readHashTime = () => {
			const match = /(?:^|&)t=([\d.]+)(?:&|$)/.exec(window.location.hash.slice(1));
			return match ? Number(match[1]) : Number.NaN;
		};
		try {
			paused = localStorage.getItem('animation-paused') === 'true';
		} catch {
			paused = false;
		}
		const rocket = createRocket(canvas, { mode, time: readHashTime() });
		engine = rocket;
		rocket.setPaused(paused);
		const themeObserver = new MutationObserver(() => rocket.redraw());
		themeObserver.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-theme']
		});
		const colorScheme = window.matchMedia('(prefers-color-scheme: dark)');
		const redrawForScheme = () => rocket.redraw();
		const updateTime = () => rocket.setTime(readHashTime());
		colorScheme.addEventListener('change', redrawForScheme);
		window.addEventListener('hashchange', updateTime);

		return () => {
			themeObserver.disconnect();
			colorScheme.removeEventListener('change', redrawForScheme);
			window.removeEventListener('hashchange', updateTime);
			rocket.destroy();
			engine = undefined;
		};
	});
</script>

<!-- svelte-ignore a11y_no_interactive_element_to_noninteractive_role -->
<canvas
	bind:this={canvas}
	class={mode === 'launch' ? `rocket-launch-canvas ${className}` : className}
	role="img"
	aria-label={label ?? defaultLabels[mode]}
></canvas>
<button
	class="animation-toggle"
	aria-label={paused ? 'Play animation' : 'Pause animation'}
	aria-pressed={paused}
	onclick={toggleAnimation}
>
	<Icon name={paused ? 'play' : 'pause'} />
</button>

<style>
	canvas {
		display: block;
		width: 100%;
		height: 100%;
	}
	.animation-toggle {
		position: absolute;
		right: 4px;
		bottom: 4px;
		width: 32px;
		height: 32px;
		display: grid;
		place-items: center;
		padding: 0;
		border: 0;
		background: var(--paper);
		color: var(--text);
		cursor: pointer;
	}
	@media (prefers-reduced-motion: reduce) {
		.animation-toggle {
			display: none;
		}
	}
</style>
