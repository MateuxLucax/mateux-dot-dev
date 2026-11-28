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
	<h1>About<i>.</i></h1>
	<p class="lede">I’m Mateus Brandt, a software engineer in Brazil.</p>
	<div class="columns">
		<section>
			<h2>Things I’ve taken apart</h2>
			<p class="intro">
				I write it down here when I get something working, mostly so I remember how.
			</p>
			<div class="posts">
				{#each data.featured as post (post.slug)}
					<a href={`/blog/posts/${post.slug}`}
						><span class="tags">{post.tags.slice(0, 2).join(' · ')}</span><strong
							>{post.title}</strong
						><Icon name="external" /></a
					>
				{/each}
			</div>
			<a class="all" href="/blog">All writing →</a>
		</section>
		<aside class="side">
			<figure class="photo" aria-hidden="true"><Rocket mode="exploded" /></figure>
			<p>
				Most of my day is backend systems, mostly Kotlin. On the side: Dart, Go, Svelte and Rust.
			</p>
			<p>The rest goes into taking things apart to see how they work.</p>
			<nav class="elsewhere" aria-label="Elsewhere">
				<a href="https://github.com/mateuxlucax" rel="me">GitHub <Icon name="external" /></a>
				<a href="https://www.linkedin.com/in/mateusbrandt" rel="me"
					>LinkedIn <Icon name="external" /></a
				>
				<a href="/rss">RSS <Icon name="rss" /></a>
			</nav>
		</aside>
	</div>
</div>

<style>
	.about {
		flex: 1;
		width: 100%;
		max-width: 1100px;
		padding: 64px 32px 80px;
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
	.lede {
		max-width: 28ch;
		margin: 36px 0;
		color: var(--ink);
		font: 400 clamp(24px, 3vw, 36px)/1.3 var(--font-sans);
	}
	.columns {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 240px;
		gap: 64px;
	}
	h2 {
		color: var(--ink);
		font: 700 18px var(--font-mono);
	}
	.intro,
	.side p {
		margin: 20px 0;
		color: var(--text);
		font: 16px/1.7 var(--font-sans);
	}
	.posts {
		margin-top: 32px;
		border-top: 1px solid var(--line);
	}
	.posts a {
		display: grid;
		grid-template-columns: 130px minmax(0, 1fr) auto;
		gap: 18px;
		align-items: start;
		padding: 22px 6px;
		border-bottom: 1px solid var(--grid);
		color: var(--ink);
	}
	.posts a:hover,
	.elsewhere a:hover {
		background: var(--hi);
	}
	.tags {
		color: var(--mute);
		font: 12px/1.5 var(--font-mono);
		overflow-wrap: anywhere;
	}
	.posts strong {
		font: 700 17px/1.5 var(--font-sans);
	}
	.posts a :global(svg) {
		color: var(--line);
	}
	.all {
		display: inline-block;
		margin-top: 24px;
		color: var(--ink);
		text-decoration: underline;
		text-underline-offset: 4px;
	}
	.photo {
		position: relative;
		height: 220px;
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
		display: flex;
		flex-wrap: wrap;
		gap: 16px;
	}
	.elsewhere a {
		display: inline-flex;
		gap: 4px;
		align-items: center;
		color: var(--ink);
		font: 13px var(--font-mono);
		text-decoration: underline;
		text-underline-offset: 4px;
	}
	@media (max-width: 700px) {
		.about {
			padding: 36px 16px 48px;
		}
		.columns {
			grid-template-columns: minmax(0, 1fr);
			gap: 42px;
		}
		.posts a {
			grid-template-columns: minmax(0, 1fr) auto;
		}
		.tags {
			grid-column: 1 / -1;
		}
	}
</style>
