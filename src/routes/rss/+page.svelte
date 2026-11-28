<script lang="ts">
	import Icon from '#lib/components/Icon.svelte';
	let { data } = $props();
	let copied = $state(false);
	let reset: ReturnType<typeof setTimeout>;
	const description = 'New posts as they come out. Paste this address into any feed reader.';
	const feedUrl = 'https://mateux.dev/blog/rss.xml';

	async function copyFeedUrl() {
		if (!navigator.clipboard?.writeText) return;
		try {
			await navigator.clipboard.writeText(feedUrl);
			copied = true;
			clearTimeout(reset);
			reset = setTimeout(() => (copied = false), 2000);
		} catch {
			copied = false;
		}
	}
</script>

<svelte:head>
	<title>Feed · Mateus Brandt</title>
	<meta name="description" content={description} />
	<link rel="canonical" href="https://mateux.dev/rss" />
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Feed · Mateus Brandt" />
	<meta property="og:description" content={description} />
	<meta property="og:url" content="https://mateux.dev/rss" />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="Feed · Mateus Brandt" />
	<meta name="twitter:description" content={description} />
</svelte:head>

<div class="feed-page">
	<h1><Icon name="rss" size={40} />Feed</h1>
	<p class="lede">{description}</p>
	<div class="url-box">
		<code>{feedUrl}</code>
		<button class:ok={copied} onclick={copyFeedUrl}>
			<Icon name={copied ? 'check' : 'copy'} /><span>{copied ? 'Copied' : 'Copy'}</span>
		</button>
	</div>
	<p class="live" aria-live="polite" aria-atomic="true">
		{copied ? 'Copied feed address to clipboard.' : ''}
	</p>
	<p class="note">Updated {data.updated}</p>
	<ol class="feed-list">
		{#each data.latestPosts as post (post.slug)}
			<li>
				<a href={`/blog/posts/${post.slug}`}>
					<time datetime={post.date}>{post.date}</time>
					<strong>{post.title}</strong>
					<Icon name="arrow-right" />
					<p>{post.description}</p>
				</a>
			</li>
		{/each}
	</ol>
	<a class="more" href="/blog">ALL WRITING <Icon name="arrow-right" size={14} /></a>
</div>

<style>
	.feed-page {
		flex: 1;
		width: 100%;
		max-width: 880px;
		padding: 48px 32px 40px;
	}
	h1 {
		display: flex;
		align-items: center;
		gap: 14px;
		color: var(--ink);
		font: 700 clamp(36px, 6vw, 56px)/0.95 var(--font-mono);
		letter-spacing: -0.05em;
	}
	h1 :global(svg) {
		width: 0.7em;
		height: 0.7em;
		color: var(--line);
	}
	.lede {
		max-width: 52ch;
		margin: 18px 0 20px;
		color: var(--text);
		font: 17px/1.6 var(--font-sans);
	}
	.url-box {
		display: flex;
		max-width: 620px;
		border: 1.5px solid var(--line);
		background: var(--paper);
	}
	.url-box code {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		padding: 12px 14px;
		color: var(--ink);
		font: 14px var(--font-mono);
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.url-box button {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 0 16px;
		border: 0;
		background: var(--sig);
		color: var(--on);
		font-size: 12px;
		font-weight: 700;
		letter-spacing: 0.08em;
		cursor: pointer;
	}
	.url-box button:hover {
		background: color-mix(in srgb, var(--sig), var(--ink) 12%);
	}
	.url-box button.ok {
		background: var(--ok);
	}
	.url-box button :global(svg) {
		flex: none;
	}
	.live {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
	.note {
		margin: 10px 0 40px;
		color: var(--mute);
		font-size: 12px;
	}
	.feed-list {
		border-top: 1px solid var(--line);
		background: var(--paper);
		list-style: none;
	}
	.feed-list a {
		display: grid;
		grid-template-columns: 104px minmax(0, 1fr) 16px;
		gap: 4px 16px;
		padding: 16px 6px;
		border-bottom: 1px solid var(--grid);
	}
	.feed-list a:hover {
		background: var(--hi);
	}
	.feed-list time {
		padding-top: 2px;
		color: var(--mute);
		font-size: 13px;
		font-variant-numeric: tabular-nums;
	}
	.feed-list strong {
		color: var(--ink);
		font: 700 17px/1.35 var(--font-sans);
	}
	.feed-list p {
		grid-column: 2;
		max-width: 60ch;
		color: var(--mute);
		font: 15px/1.55 var(--font-sans);
	}
	.feed-list a > :global(svg) {
		margin-top: 4px;
		color: var(--line);
	}
	.more {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		margin-top: 20px;
		padding-bottom: 2px;
		border-bottom: 1.5px solid var(--sig);
		color: var(--acc);
		font-size: 12px;
		letter-spacing: 0.08em;
	}
	@media (max-width: 639px) {
		.feed-page {
			padding: 28px 16px 32px;
		}
		.lede {
			font-size: 16px;
		}
		.url-box {
			flex-direction: column;
		}
		.url-box code {
			overflow-wrap: anywhere;
			white-space: normal;
		}
		.url-box button {
			justify-content: center;
			padding: 12px;
		}
		.feed-list a {
			grid-template-columns: minmax(0, 1fr) 16px;
		}
		.feed-list time,
		.feed-list strong {
			grid-column: 1;
		}
		.feed-list p {
			grid-column: 1/-1;
			font-size: 14px;
		}
		.feed-list a > :global(svg) {
			grid-column: 2;
			grid-row: 1;
		}
	}
</style>
