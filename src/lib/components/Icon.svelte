<script lang="ts">
	type IconName =
		| 'anchor'
		| 'arrow-left'
		| 'arrow-right'
		| 'arrow-up'
		| 'calendar'
		| 'check'
		| 'chevron'
		| 'clock'
		| 'close'
		| 'code'
		| 'copy'
		| 'external'
		| 'mail'
		| 'menu'
		| 'moon'
		| 'pause'
		| 'play'
		| 'rocket'
		| 'rss'
		| 'search'
		| 'sun'
		| 'tag';

	let { name, size = 16, label }: { name: IconName; size?: number; label?: string } = $props();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="1.5"
	stroke-linecap="square"
	stroke-linejoin="miter"
	aria-hidden={label ? undefined : 'true'}
	role={label ? 'img' : undefined}
	aria-label={label}
>
	{#if name === 'anchor'}
		<path d="M10 4 8 20M16 4l-2 16M5 9h15M4 15h15" />
	{:else if name === 'arrow-left'}
		<path d="M20 12H5M11 6l-6 6 6 6" />
	{:else if name === 'arrow-right'}
		<path d="M4 12h15M13 6l6 6-6 6" />
	{:else if name === 'arrow-up'}
		<path d="M12 20V5M6 11l6-6 6 6" />
	{:else if name === 'calendar'}
		<path d="M4 6h16v14H4zM4 10h16M8 3v5M16 3v5" />
	{:else if name === 'check'}
		<path d="m5 12.5 4.5 4.5L19 7" />
	{:else if name === 'chevron'}
		<path d="m6 9 6 6 6-6" />
	{:else if name === 'clock'}
		<circle cx="12" cy="12" r="8" /><path d="M12 7v5l3 2" />
	{:else if name === 'close'}
		<path d="m6 6 12 12M18 6 6 18" />
	{:else if name === 'code'}
		<path d="m8 7-5 5 5 5M16 7l5 5-5 5M13.5 4l-3 16" />
	{:else if name === 'copy'}
		<path d="M8 8h12v12H8zM16 8V4H4v12h4" />
	{:else if name === 'external'}
		<path d="M13 4h7v7M20 4l-9 9M17 14v6H4V7h6" />
	{:else if name === 'mail'}
		<path d="M3 5h18v14H3zM3 6l9 7 9-7" />
	{:else if name === 'menu'}
		<path d="M4 7h16M4 12h16M4 17h16" />
	{:else if name === 'moon'}
		<path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z" />
	{:else if name === 'pause'}
		<path d="M8 5v14M16 5v14" />
	{:else if name === 'play'}
		<path d="M7 4l12 8-12 8z" />
	{:else if name === 'rocket'}
		<path
			d="M12 2.5c2.8 2.2 4 5.2 4 8.5V18H8v-7c0-3.3 1.2-6.3 4-8.5zM8 13l-3 3v4l3-2M16 13l3 3v4l-3-2M10 21h4"
		/>
		<path d="M8 11h8" stroke="var(--sig)" />
	{:else if name === 'rss'}
		<path d="M5 11a8 8 0 0 1 8 8M5 4a15 15 0 0 1 15 15" />
		<rect x="4" y="17" width="3" height="3" fill="var(--sig)" stroke="none" />
	{:else if name === 'search'}
		<circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 4.5 4.5" />
	{:else if name === 'sun'}
		<circle cx="12" cy="12" r="4" />
		<path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" />
	{:else if name === 'tag'}
		<path d="M4 4h8l8 8-8 8-8-8z" />
		<rect x="7" y="7" width="2.5" height="2.5" fill="var(--sig)" stroke="none" />
	{/if}
</svg>
