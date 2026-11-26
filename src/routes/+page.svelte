<script lang="ts">
	import Rocket from '#lib/components/rocket/Rocket.svelte';

	let { data } = $props();

	const description =
		'Software engineer in Brazil. I take things apart and write down how they work.';
</script>

<svelte:head>
	<title>Mateus Brandt</title>
	<meta name="description" content={description} />
	<link rel="canonical" href="https://mateux.dev/" />
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Mateus Brandt" />
	<meta property="og:description" content={description} />
	<meta property="og:url" content="https://mateux.dev/" />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="Mateus Brandt" />
	<meta name="twitter:description" content={description} />
</svelte:head>

<div class="home">
	<h1 aria-label="Mateus Brandt.">Mateus<br /> Brandt<i>.</i></h1>
	<p class="lede">{description}</p>
	<ul class="latest" aria-label="Latest writing">
		{#each data.latestPosts as post (post.slug)}
			<li>
				<a href={`/blog/posts/${post.slug}`}>
					<time datetime={post.date}>{post.date}</time>
					<span>{post.title}</span>
				</a>
			</li>
		{/each}
	</ul>
	<div class="cta-wrap">
		<a class="cta" href="/blog">ALL WRITING <span aria-hidden="true">→</span></a>
	</div>
	<figure class="rocket-figure">
		<Rocket mode="launch" />
	</figure>
</div>

<style>
	.home {
		display: grid;
		flex: 1;
		grid-template-columns: minmax(0, 1fr) minmax(0, 0.8fr);
		grid-template-areas: 'n r' 'l r' 'p r' 'c r';
		align-content: center;
		column-gap: 32px;
		padding: 56px 32px 40px;
	}

	h1 {
		grid-area: n;
		color: var(--ink);
		font-family: var(--font-mono);
		font-size: clamp(40px, 7vw, 64px);
		font-weight: 700;
		letter-spacing: -0.05em;
		line-height: 0.95;
	}

	h1 i {
		color: var(--sig);
		font-style: normal;
	}

	.lede {
		grid-area: l;
		max-width: 32ch;
		margin: 16px 0 28px;
		font-family: var(--font-sans);
		font-size: 18px;
		line-height: 1.5;
	}

	.latest {
		grid-area: p;
		border-top: 1px solid var(--line);
		background: var(--paper);
	}

	.latest a {
		display: grid;
		grid-template-columns: 100px minmax(0, 1fr);
		gap: 12px;
		padding: 10px 6px;
		border-bottom: 1px solid var(--grid);
		color: var(--ink);
		font-size: 13px;
	}

	.latest time {
		color: var(--mute);
		font-variant-numeric: tabular-nums;
	}

	.latest a:hover {
		background: var(--hi);
	}

	.cta-wrap {
		grid-area: c;
		margin-top: 28px;
	}

	.cta {
		display: inline-block;
		padding: 12px 18px;
		background: var(--sig);
		box-shadow: 4px 4px 0 var(--shd);
		color: var(--on);
		font-size: 13px;
		font-weight: 700;
		letter-spacing: 0.08em;
		transition:
			transform 0.12s,
			box-shadow 0.12s;
	}

	.cta:hover {
		transform: translate(-2px, -2px);
		box-shadow: 6px 6px 0 var(--shd);
	}

	.cta:active {
		transform: translate(4px, 4px);
		box-shadow: 0 0 0 var(--shd);
	}

	.rocket-figure {
		position: relative;
		grid-area: r;
		min-height: 360px;
	}

	.rocket-figure :global(canvas) {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	@media (max-width: 639px) {
		.home {
			grid-template-columns: minmax(0, 1fr) 96px;
			grid-template-areas: 'n r' 'l r' 'p p' 'c c';
			align-content: start;
			column-gap: 8px;
			padding: 32px 16px;
		}

		.lede {
			margin: 12px 0 24px;
			font-size: 16px;
		}

		.latest a {
			grid-template-columns: minmax(0, 1fr);
			gap: 2px;
		}

		.rocket-figure {
			min-height: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.cta {
			transition: none;
		}
	}
</style>
