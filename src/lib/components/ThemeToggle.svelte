<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '#lib/components/Icon.svelte';

	let isDark = $state(false);

	onMount(() => {
		isDark = document.documentElement.dataset.theme === 'dark';
	});

	function toggleTheme() {
		const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
		const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		document.documentElement.dataset.theme = nextTheme;
		isDark = nextTheme === 'dark';

		try {
			if ((nextTheme === 'dark') === systemDark) localStorage.removeItem('theme');
			else localStorage.setItem('theme', nextTheme);
		} catch {
			// The current page still follows the selected theme if storage is unavailable.
		}
	}
</script>

<button class="theme-toggle" aria-label="Dark theme" aria-pressed={isDark} onclick={toggleTheme}>
	<Icon name={isDark ? 'sun' : 'moon'} size={16} />
</button>

<style>
	.theme-toggle {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 4px;
		border: 0;
		background: transparent;
		color: var(--mute);
		cursor: pointer;
	}

	.theme-toggle:hover {
		color: var(--ink);
	}
</style>
