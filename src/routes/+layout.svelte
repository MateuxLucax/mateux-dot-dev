<script lang="ts">
	import './styles.css';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="app">
	<main>
		{@render children?.()}
	</main>

	<footer>
		<p>
			Made with ❤️ by <a href="https://github.com/MateuxLucax" target="_blank">MateuxLucax</a> using
			<a href="https://svelte.dev">SvelteKit</a>
		</p>
	</footer>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 2.4rem;
		width: 100%;
		max-width: 76.8rem;
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		text-align: center;
	}

	footer a {
		font-weight: bold;
	}
</style>
