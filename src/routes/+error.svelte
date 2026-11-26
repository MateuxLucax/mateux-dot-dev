<script lang="ts">
	import { page } from '$app/state';
	import Rocket from '#lib/components/rocket/Rocket.svelte';
	const missing = $derived(page.status === 404);
</script>

<svelte:head>
	<title>Not found · Mateus Brandt</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="lost">
	<div class="error-copy">
		<h1>{page.status}</h1>
		{#if missing}
			<h2>Nothing here.</h2>
			<p>The page may have moved, or the link has a typo.</p>
		{:else}
			<h2>Something went wrong.</h2>
			<p>The page could not be loaded. Please try again later.</p>
		{/if}
		<div class="path">{page.url.pathname}</div>
		<div class="buttons">
			<a class="button primary" href="/">HOME</a><a class="button" href="/blog">WRITING</a>
		</div>
	</div>
	{#if missing}<figure class="rocket-box" aria-hidden="true"><Rocket mode="tumble" /></figure>{/if}
</div>

<style>
	.lost {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 0.8fr);
		gap: 24px;
		align-items: center;
		flex: 1;
		padding: 40px 32px;
	}
	.lost h1 {
		color: var(--sig);
		font: 700 clamp(56px, 12vw, 96px)/1 var(--font-mono);
		letter-spacing: -0.05em;
	}
	.lost h2 {
		margin: 8px 0 6px;
		color: var(--ink);
		font: 700 22px/1.2 var(--font-sans);
	}
	.lost p {
		margin-bottom: 16px;
		color: var(--mute);
		font: 17px/1.5 var(--font-sans);
	}
	.path {
		margin-bottom: 20px;
		padding: 6px 0;
		overflow-wrap: anywhere;
		border-top: 1px solid var(--line);
		border-bottom: 1px solid var(--grid);
		color: var(--mute);
		font-size: 12px;
	}
	.buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}
	.button {
		padding: 10px 14px;
		border: 1.5px solid var(--sig);
		color: var(--acc);
		font-size: 12px;
		font-weight: 700;
		letter-spacing: 0.08em;
	}
	.button:hover {
		background: var(--hi);
	}
	.button.primary {
		background: var(--sig);
		color: var(--on);
	}
	.rocket-box {
		position: relative;
		height: 320px;
	}
	.rocket-box :global(canvas) {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}
	@media (max-width: 639px) {
		.lost {
			grid-template-columns: 1fr;
			padding: 24px 16px;
		}
		.rocket-box {
			order: -1;
			height: 200px;
		}
	}
</style>
