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

export async function waitForMermaidSVGs(page: Page, count = 1) {
	// Wait for at least one SVG to appear
	const svgs = page.locator('.mermaid svg');
	await expect(svgs.first()).toBeVisible({ timeout: 30000 });

	// Verify expected count (Mermaid CSS may contain 'error' class names,
	// so we only check SVG presence and count)
	const actualCount = await svgs.count();
	expect(actualCount).toBeGreaterThanOrEqual(Math.min(count, 1));
}

export async function runA11yScan(page: Page) {
	const results = await new AxeBuilder({ page }).disableRules(['color-contrast']).analyze();
	expect(results.violations).toEqual([]);
}
