import { test, expect } from '@playwright/test';
import { runA11yScan } from './utils';
import { getAllPosts } from './utils/posts';

const allPosts = getAllPosts();

test.describe('Blog Listing', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/blog', { waitUntil: 'networkidle' });
	});

	test('shows the writing heading, count, newest-first rows and chart', async ({ page }) => {
		await expect(page.getByRole('heading', { name: 'Writing', level: 1 })).toBeVisible();
		await expect(page.getByRole('status')).toContainText(`${allPosts.length} posts`);
		await expect(page.locator('canvas[aria-hidden="true"]')).toBeVisible();
		const rows = page.locator('ol li:visible');
		await expect(rows).toHaveCount(allPosts.length);
		for (const [index, post] of allPosts.entries()) {
			const row = rows.nth(index);
			await expect(row.locator('a')).toHaveAttribute('href', `/blog/posts/${post.slug}`);
			await expect(row).toContainText(post.date);
			await expect(row).toContainText(post.title);
			await expect(row).toContainText(/\d+ min/);
			await expect(row.locator('.row-number')).toHaveText(
				String(allPosts.length - index).padStart(3, '0')
			);
		}
	});

	test('filters by tag and restores the selection from the URL', async ({ page }) => {
		const tag = 'kotlin';
		const chip = page.getByRole('button', { name: tag, exact: true });
		await chip.click();
		await expect(chip).toHaveAttribute('aria-pressed', 'true');
		await expect(page).toHaveURL(/\?tag=kotlin$/);
		const matches = allPosts.filter((post) => post.tags.includes(tag));
		await expect(page.getByRole('status')).toContainText(`${matches.length} posts tagged ${tag}`);
		await expect(page.locator('ol li:visible')).toHaveCount(matches.length);
		await page.reload();
		await expect(page.getByRole('button', { name: tag, exact: true })).toHaveAttribute(
			'aria-pressed',
			'true'
		);
		await page.getByRole('button', { name: 'all', exact: true }).click();
		await expect(page).not.toHaveURL(/\?tag=/);
	});

	test('keeps the mobile chip row scrollable without page overflow', async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		const chipRow = page.locator('.chip-scroll');
		await expect(chipRow).toBeVisible();
		const chipMetrics = await chipRow.evaluate((el) => ({
			client: el.clientWidth,
			scroll: el.scrollWidth
		}));
		expect(chipMetrics.scroll).toBeGreaterThan(chipMetrics.client);
		const pageMetrics = await page.evaluate(() => ({
			client: document.documentElement.clientWidth,
			scroll: document.documentElement.scrollWidth
		}));
		expect(pageMetrics.scroll).toBe(pageMetrics.client);
	});

	test('keeps the RSS link available', async ({ page }) => {
		if ((page.viewportSize()?.width ?? 1280) < 640) {
			await page.getByRole('button', { name: 'Menu' }).click();
		}
		const rssLink = page.getByRole('link', { name: /RSS/ }).last();
		await expect(rssLink).toBeVisible();
		await expect(rssLink).toHaveAttribute('href', '/blog/rss.xml');
		const response = await page.request.get('/blog/rss.xml');
		await expect(response).toBeOK();
		expect(response.headers()['content-type']).toContain('xml');
	});

	test('clicking a post navigates correctly', async ({ page }) => {
		const firstPost = allPosts[0];
		await page.locator(`a[href="/blog/posts/${firstPost.slug}"]`).click();
		await page.waitForURL(/\/blog\/posts/);
		await expect(page.locator('h1')).toContainText(firstPost.title);
	});

	test('accessibility scan passes', async ({ page }) => {
		await runA11yScan(page);
	});
});
