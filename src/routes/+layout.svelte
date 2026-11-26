<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount, tick } from 'svelte';
	import '../app.css';
	import ThemeToggle from '#lib/components/ThemeToggle.svelte';

	let { children } = $props();
	let menuOpen = $state(false);
	let menuButton: HTMLButtonElement;
	let previousOverflow = '';
	const columns = ['1', '2', '3', '4', '5', '6'];
	const rows = ['A', 'B', 'C', 'D'];
	const navigation = [
		{ label: 'Home', short: 'HOME', href: '/' },
		{ label: 'Writing', short: 'WRITING', href: '/blog' },
		// About will be added when the route is introduced in PR 4.
		{ label: 'RSS', short: 'RSS', href: '/blog/rss.xml' }
	];
	function isCurrent(href: string) {
		if (href === '/') return page.url.pathname === '/';
		if (href === '/blog') {
			return (
				page.url.pathname === '/blog' ||
				page.url.pathname === '/blog/' ||
				page.url.pathname.startsWith('/blog/posts/')
			);
		}
		return page.url.pathname.startsWith(href);
	}

	async function setMenu(open: boolean, restoreFocus = false) {
		menuOpen = open;
		if (open) {
			previousOverflow = document.body.style.overflow;
			document.body.style.overflow = 'hidden';
			await tick();
			document.querySelector<HTMLAnchorElement>('#mobile-menu a')?.focus();
		} else {
			document.body.style.overflow = previousOverflow;
			if (restoreFocus) menuButton?.focus();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && menuOpen) {
			event.preventDefault();
			void setMenu(false, true);
		}
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeydown);
		return () => {
			window.removeEventListener('keydown', handleKeydown);
			document.body.style.overflow = previousOverflow;
		};
	});

	afterNavigate(() => {
		if (menuOpen) void setMenu(false);
	});
</script>

<a class="skip-link" href="#main">Skip to content</a>
<div class="mat">
	<div class="sheet">
		<div class="zone-top" aria-hidden="true">
			{#each columns as column (column)}<span>{column}</span>{/each}
		</div>
		<div class="zone-left" aria-hidden="true">
			{#each rows as row (row)}<span>{row}</span>{/each}
		</div>
		<header class="bar">
			<a class="brand" href="/">MATEUX.DEV</a>
			<div class="bar-right">
				<nav class="main-nav" aria-label="Main">
					{#each navigation as item (item.href)}
						<a href={item.href} aria-current={isCurrent(item.href) ? 'page' : undefined}
							>{item.short}</a
						>
					{/each}
				</nav>
				<div class="bar-actions">
					<ThemeToggle />
					<button
						class="menu-button"
						bind:this={menuButton}
						aria-label={menuOpen ? 'Close menu' : 'Menu'}
						aria-expanded={menuOpen}
						aria-controls="mobile-menu"
						onclick={() => void setMenu(!menuOpen)}>{menuOpen ? 'CLOSE' : 'MENU'}</button
					>
				</div>
			</div>
		</header>
		{#if menuOpen}
			<nav class="mobile-menu" id="mobile-menu" aria-label="Menu">
				<div class="mobile-links">
					{#each navigation as item (item.href)}
						<a
							href={item.href}
							aria-current={isCurrent(item.href) ? 'page' : undefined}
							onclick={() => void setMenu(false)}>{item.label}</a
						>
					{/each}
				</div>
				<div class="title-block menu-title-block">
					<div><strong>MATEUX.DEV</strong></div>
				</div>
			</nav>
		{/if}
		<main id="main">{@render children?.()}</main>
		<footer class="title-block">
			<div><strong>MATEUX.DEV</strong></div>
		</footer>
	</div>
</div>

<style>
	:global(*) {
		box-sizing: border-box;
	}

	:global(html),
	:global(body) {
		min-height: 100%;
		margin: 0;
		background: var(--paper);
	}

	:global(body) {
		color: var(--text);
		font-family: var(--font-mono);
		font-size: 14px;
		line-height: 1.5;
		-webkit-font-smoothing: antialiased;
	}

	:global(button),
	:global(a) {
		font: inherit;
	}

	:global(a) {
		color: inherit;
		text-decoration: none;
	}

	:global(:focus-visible) {
		outline: 2px solid var(--line);
		outline-offset: 3px;
	}

	.mat {
		display: flow-root;
		min-height: 100dvh;
		background-color: var(--paper);
		background-image:
			linear-gradient(rgba(30, 102, 245, 0.1) 1px, transparent 1px),
			linear-gradient(90deg, rgba(30, 102, 245, 0.1) 1px, transparent 1px),
			linear-gradient(var(--grid) 1px, transparent 1px),
			linear-gradient(90deg, var(--grid) 1px, transparent 1px);
		background-size:
			80px 80px,
			80px 80px,
			16px 16px,
			16px 16px;
		background-position: center top;
	}

	:global(:root[data-theme='dark']) .mat {
		background-image:
			linear-gradient(rgba(137, 180, 250, 0.1) 1px, transparent 1px),
			linear-gradient(90deg, rgba(137, 180, 250, 0.1) 1px, transparent 1px),
			linear-gradient(var(--grid) 1px, transparent 1px),
			linear-gradient(90deg, var(--grid) 1px, transparent 1px);
	}

	.sheet {
		position: relative;
		display: flex;
		flex-direction: column;
		width: calc(100% - 24px);
		max-width: 2560px;
		min-height: calc(100dvh - 24px);
		margin: 12px auto;
		border: 1.5px solid var(--line);
		background-color: var(--paper);
		background-image:
			linear-gradient(var(--grid) 1px, transparent 1px),
			linear-gradient(90deg, var(--grid) 1px, transparent 1px);
		background-size: 16px 16px;
	}

	.zone-top,
	.zone-left {
		position: absolute;
		z-index: 1;
		display: flex;
		justify-content: space-around;
		color: var(--line);
		font-size: 10px;
		pointer-events: none;
	}

	.zone-top {
		top: -13px;
		left: 0;
		right: 0;
	}

	.zone-left {
		top: 0;
		left: -10px;
		height: min(100%, 100vh);
		flex-direction: column;
	}

	.skip-link {
		position: fixed;
		z-index: 20;
		top: 8px;
		left: 8px;
		transform: translateY(-160%);
		padding: 8px 12px;
		background: var(--paper);
		color: var(--ink);
		border: 1px solid var(--line);
	}

	.skip-link:focus {
		transform: translateY(0);
	}

	.bar {
		position: sticky;
		top: 0;
		z-index: 5;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		padding: 12px 16px;
		border-bottom: 1px solid var(--line);
		background: var(--paper);
		font-size: 12px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.brand {
		color: var(--ink);
		font-weight: 700;
	}

	.bar-right,
	.main-nav,
	.bar-actions {
		display: flex;
		align-items: center;
		gap: 20px;
	}

	.bar-right {
		margin-left: auto;
	}

	.main-nav a {
		padding-bottom: 1px;
		border-bottom: 1.5px solid transparent;
		color: var(--mute);
	}

	.main-nav a:hover {
		border-color: var(--line);
		color: var(--ink);
	}

	.main-nav a[aria-current='page'] {
		border-color: var(--sig);
		color: var(--acc);
	}

	.mobile-links a[aria-current='page'] {
		color: var(--acc);
	}

	.menu-button {
		display: none;
		padding: 5px 10px;
		border: 1px solid var(--line);
		background: transparent;
		color: var(--ink);
		font-size: 12px;
		letter-spacing: 0.08em;
		cursor: pointer;
	}

	.menu-button:hover {
		background: var(--hi);
	}

	.mobile-menu {
		position: fixed;
		z-index: 4;
		top: 68px;
		right: 13.5px;
		bottom: 0;
		left: 13.5px;
		display: flex;
		flex-direction: column;
		padding-top: 8px;
		background-color: var(--paper);
	}

	.mobile-links {
		display: flex;
		flex-direction: column;
	}

	.mobile-links a {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 18px 16px;
		border-bottom: 1px solid var(--grid);
		color: var(--ink);
		font-size: 28px;
		font-weight: 700;
		letter-spacing: -0.03em;
		line-height: 1;
	}

	.mobile-links a::after {
		content: '→';
		color: var(--line);
		font-size: 14px;
		font-weight: 400;
	}

	.mobile-links a:hover {
		background: var(--hi);
	}

	.title-block {
		align-self: flex-end;
		display: flex;
		border-top: 1.5px solid var(--line);
		border-left: 1.5px solid var(--line);
		background: var(--paper);
		color: var(--ink);
		font-size: 11px;
	}

	.title-block > div {
		padding: 6px 10px;
		border-right: 1px solid var(--line);
	}

	.title-block > div:last-child {
		border-right: 0;
	}

	.menu-title-block {
		display: none;
	}

	#main {
		display: flex;
		flex-direction: column;
		flex: 1;
	}

	:global(.shiki-dark) {
		display: none;
	}

	:global(.shiki-light) {
		display: block;
	}

	:global(:root[data-theme='dark'] .shiki-dark) {
		display: block;
	}

	:global(:root[data-theme='dark'] .shiki-light) {
		display: none;
	}

	@media (prefers-color-scheme: dark) {
		:global(:root:not([data-theme]) .shiki-dark) {
			display: block;
		}

		:global(:root:not([data-theme]) .shiki-light) {
			display: none;
		}

		:global(:root:not([data-theme])) .mat {
			background-image:
				linear-gradient(rgba(137, 180, 250, 0.1) 1px, transparent 1px),
				linear-gradient(90deg, rgba(137, 180, 250, 0.1) 1px, transparent 1px),
				linear-gradient(var(--grid) 1px, transparent 1px),
				linear-gradient(90deg, var(--grid) 1px, transparent 1px);
		}
	}

	@media (max-width: 639px) {
		.zone-top,
		.zone-left,
		.main-nav {
			display: none;
		}

		.menu-button {
			display: block;
		}

		.title-block {
			align-self: stretch;
			border-left: 0;
		}

		.title-block > div {
			flex: 1;
		}

		.menu-title-block {
			display: flex;
			margin-top: auto;
		}
	}
</style>
