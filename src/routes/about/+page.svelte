<script lang="ts">
	import Icon from '#lib/components/Icon.svelte';
	import Rocket from '#lib/components/rocket/Rocket.svelte';
	let { data } = $props();
	const description = 'About Mateus Brandt, a software engineer in Brazil.';
</script>

<svelte:head>
	<title>About · Mateus Brandt</title>
	<meta name="description" content={description} />
	<link rel="canonical" href="https://mateux.dev/about" />
	<meta property="og:type" content="website" />
	<meta property="og:title" content="About · Mateus Brandt" />
	<meta property="og:description" content={description} />
	<meta property="og:url" content="https://mateux.dev/about" />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="About · Mateus Brandt" />
	<meta name="twitter:description" content={description} />
</svelte:head>

<div class="about">
	<aside class="side">
		<div class="top">
			<h1>About<i>.</i></h1>
			<figure class="photo" aria-hidden="true"><Rocket mode="exploded" /></figure>
		</div>
		<nav class="elsewhere" aria-label="Elsewhere">
			<a href="https://github.com/mateuxlucax" rel="me"
				><span>GitHub</span><small>mateuxlucax</small><Icon name="external" /></a
			>
			<a href="https://www.linkedin.com/in/mateusbrandt" rel="me"
				><span>LinkedIn</span><small>mateusbrandt</small><Icon name="external" /></a
			>
			<a href="/rss"><span>RSS</span><small>/blog/rss.xml</small><Icon name="rss" /></a>
		</nav>
	</aside>
	<div class="content">
		<p class="lede">I’m Mateus Brandt, a software engineer in Brazil.</p>
		<div class="bio">
			<p>
				Most of my day is backend systems. The rest goes into taking things apart to see how they
				work: a coffee scale’s Bluetooth protocol, my ISP’s uptime, the AST of a Flutter app.
			</p>
			<p>
				I write it down here when I get something working, mostly so I remember how. If a post saved
				you an afternoon, <a href="https://www.linkedin.com/in/mateusbrandt">tell me</a>.
			</p>
			<p>The rocket is there because I always wanted to be an aerospace engineer.</p>
		</div>
		<dl class="spec">
			<dt>Based in</dt>
			<dd>Brazil</dd>
			<dt>Day to day</dt>
			<dd>Backend, Kotlin</dd>
			<dt>On the side</dt>
			<dd>Dart, Go, Svelte, Rust</dd>
			<dt>This site</dt>
			<dd>SvelteKit on Cloudflare Pages</dd>
		</dl>
		<h2>WRITES ABOUT</h2>
		<div class="chips">
			{#each data.tags as tag (tag)}<a class="chip" href={`/blog?tag=${tag}`}>{tag}</a>{/each}
		</div>
	</div>
</div>

<style>
	.about {
		display: grid;
		grid-template-columns: 240px minmax(0, 1fr);
		gap: 48px;
		flex: 1;
		width: 100%;
		max-width: 1040px;
		padding: 48px 32px 40px;
	}
	.side {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}
	.top {
		display: flex;
		flex-direction: column;
		gap: 28px;
	}
	h1 {
		color: var(--ink);
		font: 700 clamp(36px, 6vw, 56px)/0.95 var(--font-mono);
		letter-spacing: -0.05em;
	}
	h1 i {
		color: var(--sig);
		font-style: normal;
	}
	.photo {
		position: relative;
		aspect-ratio: 4/5;
		border: 1.5px solid var(--line);
		background: var(--paper);
	}
	.photo :global(canvas) {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}
	.elsewhere {
		border-top: 1px solid var(--line);
		background: var(--paper);
	}
	.elsewhere a {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 6px;
		border-bottom: 1px solid var(--grid);
		color: var(--ink);
		font-size: 13px;
	}
	.elsewhere a span {
		flex: 1;
	}
	.elsewhere small {
		color: var(--mute);
		font-size: 12px;
	}
	.elsewhere a :global(svg) {
		color: var(--line);
		flex: none;
	}
	.elsewhere a:hover,
	.chip:hover {
		background: var(--hi);
	}
	.lede {
		max-width: 44ch;
		margin: 8px 0 16px;
		color: var(--ink);
		font: 19px/1.55 var(--font-sans);
	}
	.bio p {
		max-width: 62ch;
		margin-bottom: 14px;
		color: var(--text);
		font: 17px/1.7 var(--font-sans);
	}
	.bio a {
		color: var(--ink);
		text-decoration: underline;
		text-decoration-color: var(--sig);
		text-decoration-thickness: 1.5px;
		text-underline-offset: 3px;
	}
	.spec {
		display: grid;
		grid-template-columns: 120px 1fr;
		max-width: 62ch;
		margin: 24px 0;
		border-top: 1px solid var(--line);
		background: var(--paper);
	}
	.spec dt,
	.spec dd {
		padding: 8px 6px;
		border-bottom: 1px solid var(--grid);
		font-size: 13px;
	}
	.spec dt {
		color: var(--mute);
	}
	.spec dd {
		color: var(--ink);
	}
	h2 {
		margin: 0 0 10px;
		color: var(--mute);
		font-size: 12px;
		font-weight: 400;
		letter-spacing: 0.08em;
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.chip {
		padding: 4px 10px;
		border: 1px solid var(--line);
		background: var(--paper);
		color: var(--text);
		font-size: 12px;
	}
	@media (max-width: 639px) {
		.about {
			grid-template-columns: minmax(0, 1fr);
			gap: 0;
			padding: 28px 16px 32px;
		}
		.side {
			display: contents;
		}
		.top {
			display: grid;
			grid-template-columns: minmax(0, 1fr) 88px;
			gap: 16px;
			align-items: end;
		}
		.photo {
			width: 88px;
		}
		.lede {
			margin: 16px 0 12px;
			font-size: 17px;
		}
		.bio p {
			font-size: 16px;
		}
		.spec {
			grid-template-columns: 112px 1fr;
		}
		.elsewhere {
			order: 9;
			margin-top: 24px;
		}
	}
</style>
