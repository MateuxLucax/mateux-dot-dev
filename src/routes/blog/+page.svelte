<script lang="ts">
	import { onMount } from 'svelte';
	import type { Post } from './posts/type';

	let { data }: { data: { posts: Post[] } } = $props();
	let activeTag = $state('all');
	let chart: HTMLCanvasElement;
	let chartHost: HTMLElement;
	let postRows = $derived(
		data.posts.map((post, index) => ({
			...post,
			number: String(data.posts.length - index).padStart(3, '0'),
			visible: activeTag === 'all' || post.tags.includes(activeTag)
		}))
	);
	let tags = $derived.by(() => {
		const counts: Record<string, number> = Object.create(null);
		const tieOrder = [
			'kotlin',
			'dart',
			'sveltekit',
			'markdown',
			'ci-cd',
			'automated-testing',
			'monitoring'
		];
		for (const post of data.posts)
			for (const tag of post.tags) counts[tag] = (counts[tag] ?? 0) + 1;
		return Object.entries(counts)
			.sort((a, b) => {
				const aOrder = tieOrder.indexOf(a[0]);
				const bOrder = tieOrder.indexOf(b[0]);
				return (
					b[1] - a[1] ||
					(aOrder < 0 ? Infinity : aOrder) - (bOrder < 0 ? Infinity : bOrder) ||
					a[0].localeCompare(b[0])
				);
			})
			.map(([tag]) => tag);
	});
	let topTags = $derived(tags.slice(0, 8));
	let moreTags = $derived(tags.slice(8));
	let visibleCount = $derived(postRows.filter((post) => post.visible).length);

	function setTag(tag: string) {
		activeTag = tag === activeTag && tag !== 'all' ? 'all' : tag;
		const url = new URL(window.location.href);
		if (activeTag === 'all') url.searchParams.delete('tag');
		else url.searchParams.set('tag', activeTag);
		window.history.replaceState(
			window.history.state,
			'',
			`${url.pathname}${url.search}${url.hash}`
		);
		drawChart();
	}

	function drawChart() {
		if (!chart || !chartHost) return;
		const context = chart.getContext('2d');
		if (!context) return;
		const style = getComputedStyle(document.documentElement);
		const color = (name: string) => style.getPropertyValue(`--${name}`).trim();
		const ratio = window.devicePixelRatio || 1;
		const width = chartHost.clientWidth;
		const height = chartHost.clientHeight;
		chart.width = Math.round(width * ratio);
		chart.height = Math.round(height * ratio);
		context.setTransform(ratio, 0, 0, ratio, 0, 0);
		context.clearRect(0, 0, width, height);
		const earliest = Math.min(...data.posts.map((post) => Date.parse(`${post.date}T00:00:00`)));
		const today = new Date();
		const end = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
		const left = 4;
		const right = width - 4;
		const top = 8;
		const bottom = height - 22;
		const x = (date: string) =>
			left +
			((Date.parse(`${date}T00:00:00`) - earliest) / Math.max(1, end - earliest)) * (right - left);
		const y = (count: number) => bottom - (count / data.posts.length) * (bottom - top);
		const chronological = [...data.posts].reverse();
		context.strokeStyle = color('line');
		context.lineWidth = 1.5;
		context.beginPath();
		context.moveTo(left, bottom);
		chronological.forEach((post, index) => {
			context.lineTo(x(post.date), y(index));
			context.lineTo(x(post.date), y(index + 1));
		});
		context.lineTo(right, y(data.posts.length));
		context.stroke();
		context.font = '11px "IBM Plex Mono", monospace';
		context.fillStyle = color('mute');
		const start = new Date(earliest);
		const ticks = [
			{
				at: earliest,
				label: start
					.toLocaleString('en-US', { month: 'short', year: '2-digit', timeZone: 'UTC' })
					.toUpperCase()
			},
			...(width > 500
				? [
						{ at: Date.UTC(2025, 9, 1), label: 'OCT 25' },
						{ at: Date.UTC(2026, 0, 1), label: 'JAN 26' },
						{ at: Date.UTC(2026, 5, 1), label: 'JUN 26' }
					]
				: [{ at: Date.UTC(2026, 0, 1), label: 'JAN 26' }]),
			{ at: end, label: 'NOW' }
		].filter(
			(tick, index, all) =>
				tick.at >= earliest && tick.at <= end && (index === 0 || tick.at > all[index - 1].at)
		);
		ticks.forEach((tick, index) => {
			const px = left + ((tick.at - earliest) / Math.max(1, end - earliest)) * (right - left);
			context.beginPath();
			context.moveTo(px, bottom);
			context.lineTo(px, bottom + 4);
			context.strokeStyle = color('line');
			context.stroke();
			context.textAlign = index === 0 ? 'left' : index === ticks.length - 1 ? 'right' : 'center';
			context.fillText(tick.label, px, height - 4);
		});
		chronological.forEach((post, index) => {
			const selected = activeTag === 'all' || post.tags.includes(activeTag);
			context.globalAlpha = selected ? 1 : 0.25;
			context.fillStyle = selected ? color('sig') : color('mute');
			context.beginPath();
			context.arc(
				x(post.date),
				y(index + 1),
				activeTag !== 'all' && selected ? 4 : 2.5,
				0,
				Math.PI * 2
			);
			context.fill();
		});
		context.globalAlpha = 1;
	}

	onMount(() => {
		const requestedTag = new URLSearchParams(window.location.search).get('tag');
		if (requestedTag && tags.includes(requestedTag)) activeTag = requestedTag;
		drawChart();
		const resizeObserver = new ResizeObserver(drawChart);
		resizeObserver.observe(chartHost);
		const themeObserver = new MutationObserver(drawChart);
		themeObserver.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-theme']
		});
		return () => {
			resizeObserver.disconnect();
			themeObserver.disconnect();
		};
	});
</script>

<svelte:head>
	<title>Writing · Mateus Brandt</title>
	<meta property="og:type" content="website" />
	<meta property="og:title" content="mateux.dev blog" />
	<meta
		property="og:description"
		content="Posts about software engineering, distributed systems, and developer tooling."
	/>
</svelte:head>

<section class="writing" aria-labelledby="writing-heading">
	<h1 id="writing-heading">Writing</h1>
	<div class="chip-scroll" role="group" aria-label="Filter posts by tag">
		<div class="chips">
			<button class="chip" aria-pressed={activeTag === 'all'} onclick={() => setTag('all')}
				>all</button
			>
			{#each topTags as tag (tag)}
				<button class="chip" aria-pressed={activeTag === tag} onclick={() => setTag(tag)}
					>{tag}</button
				>
			{/each}
			{#if moreTags.length}
				<details class="more-tags">
					<summary class="chip">more</summary>
					<div class="more-list">
						{#each moreTags as tag (tag)}
							<button class="chip" aria-pressed={activeTag === tag} onclick={() => setTag(tag)}
								>{tag}</button
							>
						{/each}
					</div>
				</details>
			{/if}
		</div>
	</div>
	<div class="chart-wrap" bind:this={chartHost}>
		<canvas bind:this={chart} aria-hidden="true"></canvas>
	</div>
	<p class="count" role="status" aria-live="polite">
		{visibleCount}
		{visibleCount === 1 ? 'post' : 'posts'}{activeTag === 'all' ? '' : ` tagged ${activeTag}`}
	</p>
	<ol class="post-list">
		{#each postRows as post (post.slug)}
			<li hidden={!post.visible}>
				<a href={`/blog/posts/${post.slug}`}>
					<span class="row-number">{post.number}</span>
					<time class="row-date" datetime={post.date}>{post.date}</time>
					<span class="row-title">{post.title}</span>
					<span class="row-reading">{post.readingTime} min</span>
				</a>
			</li>
		{/each}
	</ol>
</section>

<style>
	.writing {
		width: 100%;
		max-width: 880px;
		margin: 0;
		padding: 40px 32px 48px;
	}
	h1 {
		margin: 0 0 20px;
		color: var(--ink);
		font: 700 clamp(32px, 6vw, 48px)/1 var(--font-mono);
		letter-spacing: -0.04em;
	}
	.chip-scroll {
		margin: 0 0 20px;
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.chip {
		flex: none;
		padding: 4px 10px;
		border: 1px solid var(--line);
		background: var(--paper);
		color: var(--text);
		font-size: 12px;
		white-space: nowrap;
		cursor: pointer;
	}
	.chip:hover {
		background: var(--hi);
	}
	.chip[aria-pressed='true'] {
		border-color: var(--line);
		background: var(--sig);
		color: var(--on);
		font-weight: 700;
	}
	.more-tags {
		position: relative;
	}
	.more-tags summary {
		list-style: none;
	}
	.more-tags summary::-webkit-details-marker {
		display: none;
	}
	.more-list {
		position: absolute;
		z-index: 3;
		top: calc(100% + 4px);
		right: 0;
		display: grid;
		grid-template-columns: repeat(2, max-content);
		gap: 6px;
		max-height: 50vh;
		overflow: auto;
		padding: 8px;
		border: 1px solid var(--line);
		background: var(--paper);
	}
	.chart-wrap {
		height: 170px;
		margin-bottom: 8px;
	}
	canvas {
		display: block;
		width: 100%;
		height: 100%;
	}
	.count {
		margin: 0 0 8px;
		color: var(--mute);
		font-size: 12px;
	}
	.post-list {
		margin: 0;
		padding: 0;
		border-top: 1px solid var(--line);
		background: var(--paper);
		list-style: none;
	}
	.post-list li[hidden] {
		display: none;
	}
	.post-list a {
		display: grid;
		grid-template-columns: 44px 104px minmax(0, 1fr) 60px;
		gap: 8px;
		padding: 12px 6px;
		border-bottom: 1px solid var(--grid);
	}
	.post-list a:hover {
		background: var(--hi);
	}
	.row-number {
		color: var(--acc);
	}
	.row-date,
	.row-reading {
		color: var(--mute);
		font-variant-numeric: tabular-nums;
	}
	.row-title {
		color: var(--ink);
		font-family: var(--font-mono);
	}
	.row-reading {
		text-align: right;
	}
	@media (max-width: 639px) {
		.writing {
			padding: 28px 16px 40px;
		}
		.chip-scroll {
			overflow-x: auto;
			margin-right: -16px;
			padding: 2px 16px 6px 2px;
			scrollbar-width: none;
		}
		.chip-scroll::-webkit-scrollbar {
			display: none;
		}
		.chips {
			flex-wrap: nowrap;
			width: max-content;
		}
		.chart-wrap {
			height: 120px;
		}
		.post-list a {
			grid-template-columns: auto minmax(0, 1fr) auto;
			grid-template-areas: 'number date reading' 'title title title';
			row-gap: 4px;
		}
		.row-number {
			grid-area: number;
		}
		.row-date {
			grid-area: date;
		}
		.row-title {
			grid-area: title;
		}
		.row-reading {
			grid-area: reading;
		}
	}
</style>
