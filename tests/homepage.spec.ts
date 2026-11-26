import { expect, test, type Page } from '@playwright/test';
import { runA11yScan } from './utils';
import { getAllPosts } from './utils/posts';

const lede = 'Software engineer in Brazil. I take things apart and write down how they work.';
const latestPosts = getAllPosts().slice(0, 3);

async function canvasPixels(page: Page) {
	return page.locator('canvas').evaluate((canvas) => {
		const element = canvas as HTMLCanvasElement;
		const context = element.getContext('2d');
		if (!context) throw new Error('Canvas 2D context is unavailable');
		const pixels = context.getImageData(0, 0, element.width, element.height).data;
		let visible = 0;
		let hash = 2166136261;
		for (let i = 0; i < pixels.length; i += 4) {
			if (pixels[i + 3]) visible++;
			for (let channel = 0; channel < 4; channel++) {
				hash = Math.imul(hash ^ pixels[i + channel], 16777619);
			}
		}
		return { visible, hash: hash >>> 0 };
	});
}

async function assertNoRocketOverlap(page: Page) {
	const bounds = await page.evaluate(() => {
		const rect = (selector: string) => {
			const { x, y, width, height } = document.querySelector(selector)!.getBoundingClientRect();
			return { left: x, top: y, right: x + width, bottom: y + height };
		};
		return {
			heading: rect('main h1'),
			lede: rect('.lede'),
			list: rect('.latest'),
			rocket: rect('.rocket-figure')
		};
	});
	for (const key of ['heading', 'lede', 'list'] as const) {
		const box = bounds[key];
		const rocket = bounds.rocket;
		expect(
			box.right <= rocket.left ||
				box.left >= rocket.right ||
				box.bottom <= rocket.top ||
				box.top >= rocket.bottom,
			`${key} intersects the rocket figure`
		).toBe(true);
	}
}

test.describe('Homepage', () => {
	test('shows the new identity, latest writing and launch canvas', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mateus Brandt.');
		await expect(page.getByText(lede)).toBeVisible();

		const posts = page.getByRole('list', { name: 'Latest writing' }).getByRole('listitem');
		await expect(posts).toHaveCount(3);
		for (const [index, post] of latestPosts.entries()) {
			const item = posts.nth(index);
			await expect(item.getByRole('link')).toHaveAttribute('href', `/blog/posts/${post.slug}`);
			await expect(item.getByRole('link')).toContainText(post.title);
			await expect(item).toContainText(post.date);
		}

		const canvas = page.locator('canvas[role="img"]');
		await expect(canvas).toHaveAttribute('aria-label', /rocket launching/i);
		await expect.poll(async () => (await canvasPixels(page)).visible).toBeGreaterThan(0);
		await expect(page.getByRole('link', { name: 'ALL WRITING' })).toHaveAttribute('href', '/blog');
	});

	test('sets the homepage title and social metadata', async ({ page }) => {
		await page.goto('/');
		await expect(page).toHaveTitle('Mateus Brandt');
		await expect(page.locator('meta[name="description"]').last()).toHaveAttribute('content', lede);
		await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
			'href',
			'https://mateux.dev/'
		);
		for (const [selector, content] of [
			['meta[property="og:title"]', 'Mateus Brandt'],
			['meta[property="og:description"]', lede],
			['meta[property="og:url"]', 'https://mateux.dev/'],
			['meta[name="twitter:title"]', 'Mateus Brandt'],
			['meta[name="twitter:description"]', lede]
		]) {
			await expect(page.locator(selector)).toHaveAttribute('content', content);
		}
	});

	test('has no horizontal overflow at 360px', async ({ page }) => {
		await page.setViewportSize({ width: 360, height: 800 });
		await page.goto('/');
		const sizes = await page.evaluate(() => ({
			viewport: document.documentElement.clientWidth,
			content: document.documentElement.scrollWidth
		}));
		expect(sizes.content).toBe(sizes.viewport);
	});

	for (const viewport of [
		{ label: 'desktop', width: 1280, height: 800 },
		{ label: 'phone', width: 390, height: 844 }
	]) {
		test(`keeps text clear of the rocket on ${viewport.label}`, async ({ page }) => {
			await page.setViewportSize({ width: viewport.width, height: viewport.height });
			await page.goto('/');
			await assertNoRocketOverlap(page);
		});
	}

	test('passes accessibility scans in light and dark themes', async ({ page }) => {
		await page.goto('/');
		for (const theme of ['light', 'dark']) {
			await page.evaluate((value) => (document.documentElement.dataset.theme = value), theme);
			await runA11yScan(page);
		}
	});
});
