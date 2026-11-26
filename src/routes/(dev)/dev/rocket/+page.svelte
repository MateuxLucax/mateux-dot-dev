<script lang="ts">
	import Rocket from '#lib/components/rocket/Rocket.svelte';
	import type { RocketMode } from '#lib/components/rocket/engine.ts';

	const modes: RocketMode[] = ['launch', 'exploded', 'tumble'];
</script>

<svelte:head>
	<title>Rocket animation preview</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="preview">
	<h1>Rocket animation engine</h1>
	<div class="previews">
		{#each modes as mode (mode)}
			<section aria-label={`${mode} animation`}>
				<Rocket {mode} />
			</section>
		{/each}
	</div>
</div>

<style>
	.preview {
		padding: 24px;
	}

	:global(main > section) {
		width: min(100%, 1280px);
		max-width: 1280px !important;
	}

	:global(.terminal-body) {
		max-height: none !important;
		overflow: visible !important;
	}

	.preview {
		width: max-content;
		max-width: 100%;
	}

	h1 {
		margin-bottom: 16px;
	}

	.previews {
		display: flex;
		flex-wrap: wrap;
		gap: 16px;
	}

	section {
		width: 360px;
		height: 480px;
		border: 1.5px solid var(--line, #1e66f5);
	}
</style>
