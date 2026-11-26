import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { runA11yScan } from './utils';
import { getAllPosts } from './utils/posts';

const { version } = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string };
const post = getAllPosts().find((p) => p.slug === 'building-a-simple-blog')!;

const theme = (page: Page) => page.locator('html').getAttribute('data-theme');

/** The bar shows its links inline on wide screens and behind a menu button on phones. */
async function openNav(page: Page, isMobile: boolean) {
	if (!isMobile) return page.getByRole('navigation', { name: 'Main' });
	await page.getByRole('button', { name: 'Menu' }).click();
	return page.getByRole('navigation', { name: 'Menu' });
}

test.describe('Site shell', () => {
	test('wraps every page in the drawing sheet with a title block', async ({ page }) => {
		for (const path of ['/', '/blog', `/blog/posts/${post.slug}`]) {
			await page.goto(path);
			const header = page.getByRole('banner');
			await expect(header.getByRole('link', { name: 'mateux.dev' })).toHaveAttribute('href', '/');
			await expect(page.getByRole('main')).toBeVisible();
			const footer = page.getByRole('contentinfo');
			await expect(footer).toContainText(`REV ${version}`);
		}
	});

	test('matches the desktop sheet inset and right-aligns the navigation', async ({
		page,
		isMobile
	}) => {
		test.skip(isMobile, 'desktop shell geometry');
		await page.setViewportSize({ width: 1440, height: 1000 });
		await page.goto('/');

		const geometry = await page.evaluate(() => {
			const sheet = document.querySelector('.sheet')!.getBoundingClientRect();
			const nav = document.querySelector('.main-nav')!.getBoundingClientRect();
			const theme = document.querySelector('.theme-toggle')!.getBoundingClientRect();
			return {
				sheetX: sheet.x,
				sheetWidth: sheet.width,
				navThemeGap: theme.x - nav.right,
				themeRightInset: sheet.right - theme.right
			};
		});

		expect(geometry.sheetX).toBeCloseTo(12, 0);
		expect(geometry.sheetWidth).toBeCloseTo(1416, 0);
		expect(geometry.navThemeGap).toBeCloseTo(20, 0);
		expect(geometry.themeRightInset).toBeGreaterThanOrEqual(16.5);
		expect(geometry.themeRightInset).toBeLessThanOrEqual(18.5);
	});

	test('keeps the mobile sheet inset and aligns actions after the brand', async ({
		page,
		isMobile
	}) => {
		test.skip(!isMobile, 'mobile shell geometry');
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto('/');

		const geometry = await page.evaluate(() => {
			const rect = (selector: string) => document.querySelector(selector)!.getBoundingClientRect();
			const sheet = rect('.sheet');
			const brand = rect('.brand');
			const theme = rect('.theme-toggle');
			const menu = rect('.menu-button');
			const actions = rect('.bar-actions');
			return {
				sheetX: sheet.x,
				sheetWidth: sheet.width,
				themeAfterBrand: theme.x > brand.right,
				menuAfterTheme: menu.x > theme.right,
				actionsRightInset: sheet.right - actions.right
			};
		});

		expect(geometry.sheetX).toBeCloseTo(12, 0);
		expect(geometry.sheetWidth).toBeCloseTo(366, 0);
		expect(geometry.themeAfterBrand).toBe(true);
		expect(geometry.menuAfterTheme).toBe(true);
		expect(geometry.actionsRightInset).toBeGreaterThanOrEqual(16.5);
		expect(geometry.actionsRightInset).toBeLessThanOrEqual(18.5);
	});

	test('marks the current section in the navigation', async ({ page, isMobile }) => {
		const cases: [string, string][] = [
			['/', 'Home'],
			['/blog', 'Writing'],
			[`/blog/posts/${post.slug}`, 'Writing']
		];
		for (const [path, current] of cases) {
			await page.goto(path);
			const nav = await openNav(page, isMobile);
			await expect(nav.getByRole('link', { name: current })).toHaveAttribute(
				'aria-current',
				'page'
			);
			await expect(nav.locator('[aria-current]')).toHaveCount(1);
			await expect(nav.getByRole('link', { name: 'RSS' })).toHaveAttribute('href', '/blog/rss.xml');
		}
	});

	test('mobile menu opens, closes with Escape and returns focus', async ({ page, isMobile }) => {
		test.skip(!isMobile, 'menu button only exists on narrow screens');
		await page.goto('/');
		await expect(page.getByRole('navigation', { name: 'Main' })).toBeHidden();

		const button = page.getByRole('button', { name: 'Menu' });
		await expect(button).toHaveAttribute('aria-expanded', 'false');
		await button.click();
		await expect(button).toHaveAttribute('aria-expanded', 'true');

		const panel = page.getByRole('navigation', { name: 'Menu' });
		await expect(panel).toBeVisible();
		await expect(panel.getByRole('link', { name: 'Home' })).toBeFocused();

		await page.keyboard.press('Escape');
		await expect(panel).toBeHidden();
		await expect(button).toBeFocused();

		await button.click();
		await panel.getByRole('link', { name: 'Writing' }).click();
		await expect(page).toHaveURL(/\/blog\/?$/);
		await expect(panel).toBeHidden();
	});

	test('a11y scan passes with the menu open', async ({ page, isMobile }) => {
		test.skip(!isMobile, 'menu button only exists on narrow screens');
		await page.goto('/');
		await page.getByRole('button', { name: 'Menu' }).click();
		await runA11yScan(page);
	});
});

test.describe('Theme', () => {
	test('follows the system colour scheme on first visit', async ({ page }) => {
		await page.goto('/');
		const system = await page.evaluate(() =>
			matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
		);
		expect(await theme(page)).toBe(system);
	});

	test('toggle switches theme, persists across reloads and swaps code themes', async ({ page }) => {
		await page.goto(`/blog/posts/${post.slug}`);
		const before = await theme(page);
		const after = before === 'dark' ? 'light' : 'dark';

		const toggle = page.getByRole('button', { name: 'Dark theme' });
		await expect(toggle).toHaveAttribute('aria-pressed', String(before === 'dark'));
		await toggle.click();
		expect(await theme(page)).toBe(after);
		await expect(toggle).toHaveAttribute('aria-pressed', String(after === 'dark'));

		await expect(page.locator(`.shiki-${after}`).first()).toBeVisible();
		await expect(page.locator(`.shiki-${before}`).first()).toBeHidden();

		await page.reload();
		expect(await theme(page)).toBe(after);
		await expect(page.locator(`.shiki-${after}`).first()).toBeVisible();
	});

	test('dark tokens apply when the dark theme is chosen', async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => localStorage.setItem('theme', 'dark'));
		await page.reload();
		const paper = await page.evaluate(() =>
			getComputedStyle(document.documentElement).getPropertyValue('--paper').trim().toLowerCase()
		);
		expect(paper).toBe('#1e1e2e');
		await runA11yScan(page);
	});
});

test.describe('Brand assets', () => {
	test('serves the SVG favicon and PNG fallbacks', async ({ page, request }) => {
		await page.goto('/');
		for (const sel of [
			'link[rel="icon"][type="image/svg+xml"]',
			'link[rel="icon"][type="image/png"]',
			'link[rel="apple-touch-icon"]'
		]) {
			const href = await page.locator(sel).getAttribute('href');
			expect(href, sel).toBeTruthy();
			const res = await request.get(href!);
			expect(res.status(), href!).toBe(200);
		}
	});

	test('loads self-hosted IBM Plex Sans and Mono', async ({ page }) => {
		const fontRequests: string[] = [];
		page.on('request', (r) => {
			if (r.resourceType() === 'font') fontRequests.push(new URL(r.url()).pathname);
		});
		await page.goto(`/blog/posts/${post.slug}`);
		const loaded = await page.evaluate(async () => {
			await document.fonts.ready;
			return {
				sans: document.fonts.check('400 16px "IBM Plex Sans"'),
				mono: document.fonts.check('400 16px "IBM Plex Mono"'),
				body: getComputedStyle(document.body).fontFamily
			};
		});
		expect(loaded.sans).toBe(true);
		expect(loaded.mono).toBe(true);
		expect(loaded.body).toContain('IBM Plex');
		expect(fontRequests.length).toBeGreaterThan(0);
		for (const path of fontRequests) expect(path).toMatch(/^\/fonts\/plex-.+\.woff2$/);
	});
});
