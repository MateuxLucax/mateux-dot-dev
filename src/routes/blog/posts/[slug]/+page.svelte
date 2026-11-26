<script lang="ts">
	import { onMount } from 'svelte';
	import CodeBlockWrapper from '#lib/components/CodeBlockWrapper.svelte';

	type Heading = { id: string; title: string };
	type Neighbor = { title: string; slug: string } | null;
	type Props = {
		data: {
			content: import('svelte').Component;
			meta: {
				slug: string;
				title: string;
				description: string;
				date: string;
				tags: string[];
				readingTime: number;
			};
			words: number;
			headings: Heading[];
			previous: Neighbor;
			next: Neighbor;
			postCount: number;
			related?: Array<{ title: string; slug: string; date: string }>;
		};
	};
	let { data }: Props = $props();
	let activeHeading = $state('');
	let progress = $state(0);

	const canonicalUrl = $derived(`https://mateux.dev/blog/posts/${data.meta.slug}`);
	const jsonLd = $derived({
		'@context': 'https://schema.org',
		'@type': 'BlogPosting',
		headline: data.meta.title,
		description: data.meta.description,
		author: { '@type': 'Person', name: 'Mateus Brandt' },
		datePublished: data.meta.date,
		url: canonicalUrl
	});
	const jsonLdScript = $derived(
		`<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/&/g, '\\u0026').replace(/</g, '\\u003c').replace(/>/g, '\\u003e')}</${'script'}>`
	);

	function updateProgress() {
		const distance = document.documentElement.scrollHeight - window.innerHeight;
		progress = distance > 0 ? Math.min(1, window.scrollY / distance) : 0;
	}

	onMount(() => {
		const headings = [...document.querySelectorAll<HTMLElement>('.prose h2')];
		headings.forEach((heading, index) => {
			heading.id = data.headings[index]?.id ?? `section-${index + 1}`;
		});
		activeHeading = headings[0]?.id ?? '';
		const observer = new IntersectionObserver(
			(entries) => {
				const current = [...headings]
					.filter((heading) => heading.getBoundingClientRect().top <= window.innerHeight * 0.35)
					.at(-1);
				const visible = entries.find((entry) => entry.isIntersecting);
				if (current) activeHeading = current.id;
				else if (visible) activeHeading = (visible.target as HTMLElement).id;
			},
			{ rootMargin: '0px 0px -65% 0px', threshold: 0 }
		);
		headings.forEach((heading) => observer.observe(heading));
		window.addEventListener('scroll', updateProgress, { passive: true });
		window.addEventListener('resize', updateProgress);
		updateProgress();
		return () => {
			observer.disconnect();
			window.removeEventListener('scroll', updateProgress);
			window.removeEventListener('resize', updateProgress);
		};
	});
</script>

<svelte:head>
	<title>{data.meta.title}</title>
	<meta name="description" content={data.meta.description} />
	<link rel="canonical" href={canonicalUrl} />
	<meta property="og:type" content="article" />
	<meta property="og:title" content={data.meta.title} />
	<meta property="og:description" content={data.meta.description} />
	<meta property="og:url" content={canonicalUrl} />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={data.meta.title} />
	<meta name="twitter:description" content={data.meta.description} />
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- JSON-LD, escaped above -->
	{@html jsonLdScript}
</svelte:head>

<div class="mobile-progress" aria-hidden="true">
	<span style={`transform: scaleX(${progress})`}></span>
</div>
<div class="post-layout">
	<aside class="progress-rail" aria-hidden="true">
		<div class="rail-track">
			<span class="rail-fill" style={`transform: scaleY(${progress})`}></span>
			{#each data.headings as heading, index (heading.id)}
				<span
					class="rail-tick"
					class:active={activeHeading === heading.id}
					style={`top: ${data.headings.length > 1 ? (index / (data.headings.length - 1)) * 100 : 0}%`}
				></span>
			{/each}
		</div>
	</aside>

	<article class="post-article">
		<a class="compact-back" href="/blog">← All writing</a>
		<header class="r post-header">
			<div class="header-copy">
				<p class="post-meta">
					<time datetime={data.meta.date}>{data.meta.date}</time><span
						>{data.meta.readingTime} min read</span
					>
				</p>
				<h1>{data.meta.title}</h1>
				<p class="lede">{data.meta.description}</p>
				<ul class="post-tags">
					{#each data.meta.tags as tag (tag)}<li>
							<a href={`/blog?tag=${encodeURIComponent(tag)}`}>{tag}</a>
						</li>{/each}
				</ul>
			</div>
			<dl class="post-facts notes-column">
				<div>
					<dt>Published</dt>
					<dd>{data.meta.date}</dd>
				</div>
				<div>
					<dt>Reading</dt>
					<dd>{data.meta.readingTime} min</dd>
				</div>
				<div>
					<dt>Words</dt>
					<dd>{data.words.toLocaleString('en-US')}</dd>
				</div>
			</dl>
		</header>

		<nav class="toc-column contents" aria-label="Contents">
			<p>CONTENTS</p>
			<div class="toc-progress" aria-hidden="true">
				<span style={`transform: scaleY(${progress})`}></span>
			</div>
			<ol>
				{#each data.headings as heading (heading.id)}
					<li>
						<a
							href={`#${heading.id}`}
							onclick={() => (activeHeading = heading.id)}
							aria-current={activeHeading === heading.id ? 'location' : undefined}
							>{heading.title}</a
						>
					</li>
				{/each}
			</ol>
			<a class="toc-back" href="/blog">← All writing</a>
		</nav>

		<section class="r prose prose-column" aria-label="Post content">
			<CodeBlockWrapper><data.content /></CodeBlockWrapper>
		</section>

		<nav class="post-navigation" aria-label="Post navigation">
			{#if data.previous}
				<a href={`/blog/posts/${data.previous.slug}`}
					><small>← PREVIOUS</small><span>{data.previous.title}</span></a
				>
			{:else}
				<a href="/blog"><small>← PREVIOUS</small><span>All writing</span></a>
			{/if}
			{#if data.next}
				<a href={`/blog/posts/${data.next.slug}`}
					><small>NEXT →</small><span>{data.next.title}</span></a
				>
			{:else}
				<a href="/blog"><small>ALL WRITING →</small><span>{data.postCount} posts</span></a>
			{/if}
		</nav>
		{#if data.related?.length}
			<footer class="related-posts">
				<h2>Related posts</h2>
				<ul>
					{#each data.related as related (related.slug)}<li>
							<a href={`/blog/posts/${related.slug}`}>{related.title}</a>
						</li>{/each}
				</ul>
			</footer>
		{/if}
	</article>
</div>

<style>
	.mobile-progress {
		display: none;
		position: sticky;
		top: 58px;
		z-index: 4;
		height: 2px;
		background: transparent;
	}
	.mobile-progress span {
		display: block;
		width: 100%;
		height: 100%;
		background: var(--sig);
		transform-origin: left;
	}
	.post-layout {
		display: grid;
		grid-template-columns: 56px minmax(0, 1fr);
		flex: 1;
		counter-reset: figure;
	}
	.progress-rail {
		border-right: 1px solid var(--line);
	}
	.rail-track {
		position: sticky;
		top: 76px;
		width: 4px;
		height: calc(100vh - 140px);
		margin: 20px auto;
		background: var(--grid);
	}
	.rail-fill {
		position: absolute;
		inset: 0;
		background: var(--sig);
		transform-origin: top;
	}
	.rail-tick {
		position: absolute;
		left: -6px;
		width: 16px;
		height: 1px;
		background: var(--line);
	}
	.rail-tick.active {
		height: 2px;
		background: var(--sig);
	}
	.post-article {
		min-width: 0;
		width: 100%;
		max-width: calc(68ch + 64px);
		padding: 40px 32px 56px;
	}
	.compact-back {
		display: inline-block;
		margin-bottom: 18px;
		color: var(--mute);
		font-size: 12px;
	}
	.post-header {
		margin-bottom: 40px;
	}
	.post-meta {
		display: flex;
		gap: 16px;
		margin: 0 0 14px;
		color: var(--mute);
		font-size: 12px;
		font-variant-numeric: tabular-nums;
	}
	h1 {
		margin: 0;
		color: var(--ink);
		font: 700 clamp(28px, 5vw, 40px)/1.15 var(--font-sans);
		letter-spacing: -0.02em;
		text-wrap: balance;
	}
	.lede {
		margin: 14px 0 18px;
		color: var(--mute);
		font: 19px/1.55 var(--font-sans);
	}
	.post-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.post-tags a {
		display: block;
		padding: 2px 8px;
		border: 1px solid var(--line);
		color: var(--text);
		font-size: 12px;
	}
	.post-tags a:hover {
		background: var(--hi);
	}
	.post-facts {
		display: none;
	}
	.contents {
		display: none;
	}
	.prose {
		max-width: 100%;
		color: var(--text);
		font: 17px/1.7 var(--font-sans);
	}
	.prose :global(> *) {
		margin-block: 0 16px;
	}
	.prose :global(h2) {
		margin: 40px 0 10px;
		padding-top: 1px;
		color: var(--ink);
		font: 700 24px/1.25 var(--font-sans);
	}
	.prose :global(h2::before) {
		display: block;
		height: 1.5px;
		margin: 0 0 14px;
		background: linear-gradient(90deg, var(--sig) 20px, var(--line) 20px);
		content: '';
	}
	.prose :global(p) {
		margin-bottom: 16px;
	}
	.prose :global(a) {
		color: var(--ink);
		text-decoration: underline;
		text-decoration-color: var(--sig);
		text-decoration-thickness: 1.5px;
		text-underline-offset: 3px;
	}
	.prose :global(a:hover) {
		background: var(--hi);
	}
	.prose :global(code:not(pre code)) {
		padding: 1px 4px;
		background: var(--mantle);
		color: var(--ink);
		font-family: var(--font-mono);
		font-size: 0.85em;
	}
	.prose :global(blockquote) {
		margin: 20px 0;
		padding: 6px 12px;
		border-left: 2px solid var(--sig);
		color: var(--mute);
	}
	.prose :global(blockquote p:last-child) {
		margin-bottom: 0;
	}
	.prose :global(ul),
	.prose :global(ol) {
		margin: 0 0 16px;
		padding-left: 1.5em;
	}
	.prose :global(li) {
		padding-left: 0.25em;
	}
	.prose :global(table) {
		width: 100%;
		max-width: 100%;
		table-layout: fixed;
		border-collapse: collapse;
	}
	.prose :global(th),
	.prose :global(td) {
		padding: 4px 8px;
		border: 1px solid var(--line);
		overflow-wrap: anywhere;
	}
	.prose :global(hr) {
		display: none;
	}
	.prose :global(.pele-diagram) {
		position: relative;
		display: block;
		margin: 24px 0;
		padding: 22px 16px 12px;
		border: 1px dashed var(--line);
		counter-increment: figure;
	}
	.prose :global(.pele-diagram figcaption) {
		position: absolute;
		top: -8px;
		left: 12px;
		margin: 0;
		padding: 0 6px;
		background: var(--paper);
		color: var(--line);
		font: 11px/1.2 var(--font-mono);
		letter-spacing: 0.08em;
	}
	.prose :global(.pele-diagram-art) {
		display: flex;
		width: 100%;
		align-items: center;
		justify-content: center;
	}
	.prose :global(.pele-diagram-art .pele) {
		max-width: 100%;
		height: auto;
	}
	.prose :global(.pele-diagram figcaption::before) {
		content: 'FIG. ' counter(figure) ' · ';
	}
	.prose :global(.pele-diagram .pele) {
		--pele-bg: var(--paper);
		--pele-fg: var(--text);
		--pele-fg-on-light: var(--text);
		--pele-fg-on-dark: var(--paper);
		--pele-muted: var(--mute);
		--pele-line: var(--text);
		--pele-surface: var(--mantle);
		--pele-surface-alt: var(--grid);
		--pele-border: var(--line);
		--pele-accent: var(--line);
		--pele-critical: var(--red);
	}
	:global(:root[data-theme='dark'] .pele-diagram .pele) {
		--pele-fg: var(--ink);
		--pele-fg-on-light: var(--paper);
		--pele-fg-on-dark: var(--ink);
		--pele-line: var(--ink);
		--pele-surface-alt: var(--mantle);
	}
	@media (prefers-color-scheme: dark) {
		:global(:root:not([data-theme]) .pele-diagram .pele) {
			--pele-fg: var(--ink);
			--pele-fg-on-light: var(--paper);
			--pele-fg-on-dark: var(--ink);
			--pele-line: var(--ink);
			--pele-surface-alt: var(--mantle);
		}
	}
	.prose :global(.shiki-light),
	.prose :global(.shiki-dark) {
		position: relative;
		margin: 24px 0;
		min-width: 0;
		overflow-x: auto;
	}
	.prose :global(.shiki-light pre),
	.prose :global(.shiki-dark pre) {
		max-width: 100%;
		overflow-x: auto;
		padding: 16px;
		border-left: 2px solid var(--line);
		background: var(--mantle) !important;
		font: 13px/1.6 var(--font-mono);
	}
	.prose :global(.shiki-light pre code),
	.prose :global(.shiki-dark pre code) {
		background: transparent;
		font: inherit;
	}
	.prose :global(.shiki-light),
	.prose :global(.shiki-dark) {
		outline: 1px solid transparent;
	}
	.prose :global(.shiki-light)::after,
	.prose :global(.shiki-dark)::after {
		position: absolute;
		inset: 0;
		pointer-events: none;
		border: 1px solid var(--line);
		clip-path: polygon(
			0 0,
			10px 0,
			10px 1px,
			1px 1px,
			1px 10px,
			0 10px,
			0 0,
			100% 0,
			calc(100% - 10px) 0,
			calc(100% - 10px) 1px,
			calc(100% - 1px) 1px,
			calc(100% - 1px) 10px,
			100% 10px,
			100% 0,
			100% 100%,
			calc(100% - 10px) 100%,
			calc(100% - 10px) calc(100% - 1px),
			calc(100% - 1px) calc(100% - 1px),
			calc(100% - 1px) calc(100% - 10px),
			100% calc(100% - 10px),
			100% 100%,
			0 100%,
			10px 100%,
			10px calc(100% - 1px),
			1px calc(100% - 1px),
			1px calc(100% - 10px),
			0 calc(100% - 10px),
			0 100%
		);
		content: '';
	}
	.prose :global(.copy-btn) {
		position: absolute;
		z-index: 1;
		top: 8px;
		right: 8px;
		display: block;
		padding: 3px 8px;
		border: 1px solid var(--line);
		background: var(--paper);
		color: var(--text);
		font: 11px var(--font-mono);
		letter-spacing: 0.08em;
	}
	.prose :global(.copy-btn:hover) {
		background: var(--hi);
		border-color: var(--sig);
	}
	.prose :global(.copy-btn.done) {
		background: var(--ok);
		border-color: var(--ok);
		color: var(--on);
	}
	.prose :global(.footnotes) {
		border-left: 2px solid var(--sig);
		padding: 6px 12px;
		font-size: 13px;
	}
	.post-navigation {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
		margin-top: 48px;
		padding-top: 16px;
		border-top: 1px solid var(--line);
	}
	.post-navigation a {
		min-width: 0;
		padding: 12px;
		border: 1px solid var(--grid);
		color: var(--ink);
		font: 15px/1.35 var(--font-sans);
	}
	.post-navigation a:last-child {
		text-align: right;
	}
	.post-navigation a:hover {
		border-color: var(--line);
		background: var(--hi);
	}
	.post-navigation small {
		display: block;
		margin-bottom: 4px;
		color: var(--mute);
		font: 11px var(--font-mono);
		letter-spacing: 0.08em;
	}
	.post-navigation span {
		overflow-wrap: anywhere;
	}
	.related-posts {
		margin-top: 32px;
		padding-top: 16px;
		border-top: 1px solid var(--grid);
		font-family: var(--font-sans);
	}
	.related-posts h2 {
		color: var(--ink);
		font-size: 18px;
	}
	.related-posts ul {
		margin: 8px 0 0;
		padding-left: 20px;
	}
	.related-posts a {
		color: var(--ink);
		text-decoration: underline;
		text-decoration-color: var(--sig);
	}
	@media (max-width: 639px) {
		.mobile-progress {
			display: block;
		}
		.post-layout {
			grid-template-columns: minmax(0, 1fr);
		}
		.progress-rail {
			display: none;
		}
		.post-article {
			padding: 28px 16px 40px;
		}
		.post-meta {
			margin-bottom: 12px;
		}
		.lede {
			font-size: 17px;
		}
		.prose {
			font-size: 16px;
			overflow-x: clip;
		}
		.post-navigation {
			grid-template-columns: 1fr;
		}
		.post-navigation a:last-child {
			text-align: left;
		}
	}
	@media (min-width: 640px) and (max-width: 1439px) {
		.compact-back {
			display: inline-block;
		}
	}
	@media (min-width: 1440px) {
		.mobile-progress {
			display: none;
		}
		.post-layout {
			grid-template-columns:
				[full-start] minmax(48px, 1fr)
				[toc-start] 248px [toc-end] 72px [wide-start] minmax(0, 200px) [prose-start] minmax(
					0,
					760px
				)
				[prose-end] minmax(0, 200px) [wide-end] 72px [notes-start] 280px [notes-end] minmax(
					48px,
					1fr
				)
				[full-end];
			padding: 72px 0 120px;
		}
		.progress-rail {
			display: none;
		}
		.post-article {
			display: contents;
		}
		.compact-back {
			display: none;
		}
		.r {
			grid-column: full;
			display: grid;
			grid-template-columns: subgrid;
		}
		.post-header {
			grid-row: 1;
			margin: 0;
			padding: 0;
			border: 0;
		}
		.header-copy {
			grid-column: wide-start / wide-end;
			margin-bottom: 48px;
			padding-bottom: 40px;
			border-bottom: 1px solid var(--line);
		}
		h1 {
			font-size: 60px;
			line-height: 1.1;
			max-width: min(22ch, 755px);
		}
		.lede {
			max-width: 56ch;
			font-size: 22px;
		}
		.post-facts {
			grid-column: notes-start;
			align-self: end;
			display: block;
			margin: 0 0 48px;
			border: 1.5px solid var(--line);
			background: var(--paper);
			font-size: 13px;
		}
		.post-facts div {
			display: flex;
			justify-content: space-between;
			gap: 12px;
			padding: 8px 12px;
			border-bottom: 1px solid var(--grid);
		}
		.post-facts div:last-child {
			border-bottom: 0;
		}
		.post-facts dt {
			color: var(--mute);
		}
		.post-facts dd {
			margin: 0;
			color: var(--ink);
			font-variant-numeric: tabular-nums;
		}
		.contents {
			position: sticky;
			top: 24px;
			align-self: start;
			grid-column: toc-start;
			grid-row: 2;
			display: grid;
			grid-template-columns: 2px minmax(0, 1fr);
			gap: 0 18px;
			font-size: 13px;
		}
		.contents > p {
			grid-column: 1 / -1;
			margin: 0 0 12px;
			color: var(--mute);
			font-size: 11px;
			letter-spacing: 0.08em;
		}
		.toc-progress {
			position: relative;
			grid-column: 1;
			grid-row: 2;
			min-height: 100%;
			background: var(--grid);
		}
		.toc-progress span {
			position: absolute;
			inset: 0;
			background: var(--sig);
			transform-origin: top;
		}
		.contents ol {
			grid-column: 2;
			grid-row: 2;
			margin: 0;
			padding: 0;
			list-style: none;
		}
		.contents li {
			padding: 7px 0;
		}
		.contents a {
			color: var(--mute);
		}
		.contents a[aria-current='location'] {
			color: var(--acc);
		}
		.toc-back {
			grid-column: 1 / -1;
			margin-top: 28px;
			color: var(--ink) !important;
		}
		.prose {
			grid-column: full;
			grid-row: 2;
			display: grid;
			grid-template-columns: subgrid;
			max-width: none;
			font-size: 20px;
		}
		.prose > :global(.contents) {
			display: contents;
		}
		.prose :global(.contents > *) {
			grid-column: prose-start / prose-end;
		}
		.prose :global(.shiki-light),
		.prose :global(.shiki-dark) {
			grid-column: wide-start / wide-end;
			width: auto;
			margin-left: 0;
			max-width: none;
		}
		.prose :global(.pele-diagram) {
			grid-column: toc-start / notes-end;
			width: auto;
			margin-left: 0;
			max-width: none;
		}
		.prose :global(.pele-diagram figcaption) {
			position: static;
			margin-top: 10px;
			padding: 0;
			background: transparent;
			font-size: 12px;
			line-height: 1.5;
		}
		.prose :global(.footnotes) {
			grid-column: notes-start / notes-end;
			margin: 0;
			width: auto;
		}
		.prose :global(h2) {
			font-size: 32px;
		}
		.post-navigation,
		.related-posts {
			grid-column: prose-start;
		}
	}
	@media (min-width: 1440px) and (max-width: 1953px) {
		.post-layout {
			grid-template-columns:
				[full-start] minmax(0, 1fr)
				[toc-start] 248px [toc-end] minmax(0, 1fr)
				[wide-start] minmax(0, 1fr) [prose-start] minmax(0, 760px) [prose-end]
				minmax(0, 1fr) [wide-end] minmax(0, 1fr)
				[notes-start] 280px [notes-end] minmax(0, 1fr)
				[full-end];
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.mobile-progress span,
		.rail-fill,
		.toc-progress span {
			transition: none;
			scroll-behavior: auto;
		}
	}
</style>
