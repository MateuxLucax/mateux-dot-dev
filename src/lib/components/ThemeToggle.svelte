<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '#lib/components/Icon.svelte';

	let isDark = $state(false);

	onMount(() => {
		const root = document.documentElement;
		const hasStoredTheme = () => {
			try {
				const stored = localStorage.getItem('theme');
				return stored === 'light' || stored === 'dark';
			} catch {
				return false;
			}
		};
		const updateThemeColor = () => {
			document
				.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
				?.setAttribute('content', root.dataset.theme === 'dark' ? '#1e1e2e' : '#eff1f5');
		};
		const sync = () => {
			isDark = root.dataset.theme === 'dark';
			updateThemeColor();
		};
		const observer = new MutationObserver(sync);
		observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
		const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
		const followSystem = () => {
			if (hasStoredTheme()) return;
			root.dataset.theme = systemTheme.matches ? 'dark' : 'light';
			sync();
		};
		systemTheme.addEventListener('change', followSystem);
		sync();

		return () => {
			observer.disconnect();
			systemTheme.removeEventListener('change', followSystem);
		};
	});

	function toggleTheme() {
		const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
		const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		document.documentElement.dataset.theme = nextTheme;
		isDark = nextTheme === 'dark';
		document
			.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
			?.setAttribute('content', nextTheme === 'dark' ? '#1e1e2e' : '#eff1f5');

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
