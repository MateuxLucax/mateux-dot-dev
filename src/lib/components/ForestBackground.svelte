<script lang="ts">
	import { onMount } from 'svelte';

	const lightPalette = {
		sky: ['#fdfdfa', '#f2f6eb', '#e4ecdb'],
		layers: ['#e2e9d8', '#d0dcc5', '#a8bc9d', '#7a967c', '#4e6b52', '#2d4f3b'],
		ground: '#233d2d',
		mist: '#f0f4e8',
		finalMist: '#d4e1c9',
		bg: '#fdfdfa'
	};

	const darkPalette = {
		sky: ['#0b1120', '#111d35', '#162040'],
		layers: ['#1a2a3a', '#172633', '#1a3328', '#163024', '#122a1e', '#0d2218'],
		ground: '#081a12',
		mist: '#0e1525',
		finalMist: '#0f1e16',
		bg: '#0b1120'
	};

	let dark = $state(false);

	onMount(() => {
		const mq = window.matchMedia('(prefers-color-scheme: dark)');
		dark = mq.matches;
		const handler = (e: MediaQueryListEvent) => {
			dark = e.matches;
		};
		mq.addEventListener('change', handler);
		return () => mq.removeEventListener('change', handler);
	});

	const palette = $derived(dark ? darkPalette : lightPalette);

	const baseLayers = [
		{
			id: 'haze',
			y: 200,
			height: 200,
			opacity: 0.3,
			blur: 'blur(8px)',
			count: 20,
			spacing: 100
		},
		{
			id: 'far',
			y: 260,
			height: 280,
			opacity: 0.5,
			blur: 'blur(4px)',
			count: 22,
			spacing: 90
		},
		{
			id: 'distant',
			y: 330,
			height: 350,
			opacity: 0.7,
			blur: 'blur(1.5px)',
			count: 25,
			spacing: 80
		},
		{
			id: 'mid',
			y: 450,
			height: 450,
			opacity: 0.9,
			blur: 'none',
			count: 15,
			spacing: 140
		},
		{
			id: 'near',
			y: 580,
			height: 600,
			opacity: 1,
			blur: 'none',
			count: 12,
			spacing: 180
		},
		{
			id: 'foreground',
			y: 750,
			height: 850,
			opacity: 1,
			blur: 'none',
			count: 10,
			spacing: 250
		}
	];

	const layers = $derived(
		baseLayers.map((layer, i) => ({
			...layer,
			color: palette.layers[i]
		}))
	);

	const seedRandom = (seed: number) => {
		const x = Math.sin(seed) * 10000;
		return x - Math.floor(x);
	};

	const getTreeType = (seed: number) => {
		const r = seedRandom(seed);
		if (r < 0.2) return '#tree1';
		if (r < 0.4) return '#tree2';
		if (r < 0.6) return '#tree3';
		if (r < 0.8) return '#tree4';
		return '#tree5';
	};

	// Generate deterministic star positions
	const stars = Array.from({ length: 60 }, (_, i) => ({
		x: seedRandom(i * 7 + 3) * 1600,
		y: seedRandom(i * 11 + 5) * 400,
		r: 0.5 + seedRandom(i * 13 + 7) * 1.5,
		opacity: 0.3 + seedRandom(i * 17 + 11) * 0.7
	}));
</script>

<div class="forest-container" class:dark>
	<svg
		viewBox="0 0 1600 900"
		preserveAspectRatio="xMidYMid slice"
		xmlns="http://www.w3.org/2000/svg"
		class="h-full w-full"
	>
		<defs>
			<linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
				<stop offset="0%" stop-color={palette.sky[0]} stop-opacity="1" />
				<stop offset="50%" stop-color={palette.sky[1]} stop-opacity="1" />
				<stop offset="100%" stop-color={palette.sky[2]} stop-opacity="1" />
			</linearGradient>

			<!-- Tree Symbols -->
			<!-- Classic Conifer -->
			<symbol id="tree1" viewBox="0 0 40 100">
				<path
					d="M20 0 L25 15 L22 15 L28 30 L24 30 L32 50 L26 50 L36 80 L28 80 L40 100 L0 100 L12 80 L4 80 L14 50 L8 50 L16 30 L12 30 L18 15 L15 15 Z"
					fill="inherit"
				/>
			</symbol>

			<!-- Jagged Conifer -->
			<symbol id="tree2" viewBox="0 0 40 100">
				<path
					d="M20 5 L23 18 L21 18 L26 35 L22 35 L30 55 L25 55 L34 85 L26 85 L38 100 L2 100 L14 85 L6 85 L15 55 L10 55 L18 35 L14 35 L19 18 L17 18 Z"
					fill="inherit"
				/>
			</symbol>

			<!-- Tall & Skinny -->
			<symbol id="tree3" viewBox="0 0 30 100">
				<path
					d="M15 0 L18 10 L16 10 L20 25 L18 25 L22 45 L19 45 L25 70 L21 70 L30 100 L0 100 L9 70 L5 70 L11 45 L8 45 L12 25 L10 25 L14 10 L12 10 Z"
					fill="inherit"
				/>
			</symbol>

			<!-- Bushy & Short -->
			<symbol id="tree4" viewBox="0 0 60 100">
				<path
					d="M30 15 L38 30 L33 30 L45 50 L38 50 L55 75 L45 75 L60 100 L0 100 L15 75 L5 75 L22 50 L15 50 L27 30 L22 30 L30 15 Z"
					fill="inherit"
				/>
			</symbol>

			<!-- Asymmetric Leaning -->
			<symbol id="tree5" viewBox="0 0 40 100">
				<path
					d="M18 0 L25 20 L20 20 L27 40 L22 40 L35 65 L25 65 L40 100 L0 100 L15 75 L10 75 L18 45 L12 45 L15 25 L10 25 L14 10 Z"
					fill="inherit"
				/>
			</symbol>

			<filter id="mistSoft">
				<feGaussianBlur stdDeviation="3" />
			</filter>
		</defs>

		<!-- Background -->
		<rect width="1600" height="900" fill="url(#skyGradient)" />

		<!-- Stars (dark mode only) -->
		{#if dark}
			{#each stars as star}
				<circle cx={star.x} cy={star.y} r={star.r} fill="white" opacity={star.opacity * 0.6} />
			{/each}
		{/if}

		<!-- Ground layer behind all trees -->
		<rect width="1600" height="500" y="400" fill="url(#groundGradient)" />
		<defs>
			<linearGradient id="groundGradient" x1="0%" y1="0%" x2="0%" y2="100%">
				<stop offset="0%" stop-color={palette.ground} stop-opacity="0" />
				<stop offset="40%" stop-color={palette.ground} stop-opacity="0.5" />
				<stop offset="100%" stop-color={palette.ground} stop-opacity="1" />
			</linearGradient>
		</defs>

		{#each layers as layer, i}
			<!-- Intermediate Mist for each layer -->
			<rect
				width="1600"
				height="300"
				y={layer.y - 100}
				fill="url(#mistGradient{i})"
				opacity="0.4"
			/>
			<defs>
				<linearGradient id="mistGradient{i}" x1="0%" y1="0%" x2="0%" y2="100%">
					<stop offset="0%" stop-color={palette.mist} stop-opacity="0" />
					<stop offset="100%" stop-color={layer.color} stop-opacity="0.3" />
				</linearGradient>
			</defs>

			<!-- Tree Groups -->
			<g fill={layer.color} opacity={layer.opacity} style="filter: {layer.blur}">
				{#each Array(layer.count) as _, j}
					{@const seed = i * 100 + j}
					{@const xPos = j * layer.spacing + seedRandom(seed) * 50 - 100}
					{@const yOffset = seedRandom(seed + 1) * 30}
					{@const scale = 0.9 + seedRandom(seed + 2) * 0.2}
					<use
						href={getTreeType(seed)}
						x={xPos}
						y={layer.y + yOffset}
						width={layer.height * 0.4 * scale}
						height={layer.height * scale}
					/>
				{/each}
			</g>
		{/each}

		<!-- Final Base Mist -->
		<rect width="1600" height="400" y="500" fill="url(#finalMist)" opacity="0.3" />
		<defs>
			<linearGradient id="finalMist" x1="0%" y1="0%" x2="0%" y2="100%">
				<stop offset="0%" stop-color={palette.mist} stop-opacity="0" />
				<stop offset="100%" stop-color={palette.finalMist} stop-opacity="0.6" />
			</linearGradient>
		</defs>
	</svg>
</div>

<style>
	.forest-container {
		position: fixed;
		inset: 0;
		z-index: -10;
		height: 100%;
		width: 100%;
		overflow: hidden;
		background-color: #fdfdfa;
		transition: background-color 0.3s ease;
	}

	.forest-container.dark {
		background-color: #0b1120;
	}
</style>
