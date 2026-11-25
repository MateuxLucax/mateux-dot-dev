import { expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export async function assertPrompt(page: Page, path = '') {
	const promptText = `mateux@tars ~${path}>`;
	const prompt = page.locator('text=' + promptText).first();
	await expect(prompt).toBeVisible();
}

export async function assertMetaTags(
	page: Page,
	opts: {
		title: string;
		description: string;
		canonical?: string;
		ogUrl?: string;
		ogType?: string;
	}
) {
	await expect(page).toHaveTitle(opts.title);

	const desc = page.locator('meta[name="description"]').last();
	await expect(desc).toHaveAttribute('content', opts.description);

	if (opts.canonical) {
		const canonical = page.locator('link[rel="canonical"]');
		await expect(canonical).toHaveAttribute('href', opts.canonical);
	}

	const ogTitle = page.locator('meta[property="og:title"]');
	await expect(ogTitle).toHaveAttribute('content', opts.title);

	const ogDesc = page.locator('meta[property="og:description"]');
	await expect(ogDesc).toHaveAttribute('content', opts.description);

	if (opts.ogUrl) {
		const ogUrl = page.locator('meta[property="og:url"]');
		await expect(ogUrl).toHaveAttribute('content', opts.ogUrl);
	}

	if (opts.ogType) {
		const ogType = page.locator('meta[property="og:type"]');
		await expect(ogType).toHaveAttribute('content', opts.ogType);
	}

	const twitterTitle = page.locator('meta[name="twitter:title"]');
	await expect(twitterTitle).toHaveAttribute('content', opts.title);

	const twitterDesc = page.locator('meta[name="twitter:description"]');
	await expect(twitterDesc).toHaveAttribute('content', opts.description);
}

export async function assertShikiBlocks(page: Page) {
	const light = page.locator('.shiki-light');
	const dark = page.locator('.shiki-dark');
	// At least one of each theme block must exist in the DOM
	// (visibility depends on color scheme, handled by CSS)
	await expect(light.first()).toBeAttached();
	await expect(dark.first()).toBeAttached();
}

export async function assertPeleDiagrams(page: Page, count: number) {
	// Diagrams are rendered to SVG at build time, so they must be in the prerendered HTML
	// (no client-side Mermaid runtime) and visible immediately.
	const svgs = page.locator('.pele-diagram svg.pele');
	await expect(svgs).toHaveCount(count);
	for (const svg of await svgs.all()) {
		await expect(svg).toBeVisible();
	}
	await expect(page.locator('.mermaid')).toHaveCount(0);
}

export async function assertPeleTheme(page: Page, scheme: 'light' | 'dark') {
	const fg = await page
		.locator('.pele-diagram svg.pele')
		.first()
		.evaluate((el) => getComputedStyle(el).getPropertyValue('--pele-fg').trim().toLowerCase());
	// Catppuccin Latte / Mocha text colors, matching the Shiki themes.
	expect(fg).toBe(scheme === 'dark' ? '#cdd6f4' : '#4c4f69');
}

export async function runA11yScan(page: Page) {
	const results = await new AxeBuilder({ page }).disableRules(['color-contrast']).analyze();
	expect(results.violations).toEqual([]);
}
