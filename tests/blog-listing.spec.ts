import { test, expect } from '@playwright/test';
import { assertPrompt, runA11yScan } from './utils';
import { getAllPosts } from './utils/posts';

const allPosts = getAllPosts();

test.describe('Blog Listing', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/blog', { waitUntil: 'networkidle' });
	});

	test('has correct title', async ({ page }) => {
		await expect(page).toHaveTitle(/mateux@tars.*Blog/);
	});

	test('lists all posts', async ({ page }) => {
		await assertPrompt(page, '/Blog');

		for (const post of allPosts) {
			const link = page.locator(`a[href="/blog/posts/${post.slug}"]`);
			await expect(link).toBeVisible();
			await expect(link).toContainText(post.title);
		}
	});

	test('each post shows metadata', async ({ page }) => {
		const firstPost = allPosts[0];
		const row = page.locator(`a[href="/blog/posts/${firstPost.slug}"]`).locator('..');
		await expect(row).toContainText(firstPost.description);
	});

	test('RSS link is present and valid', async ({ page }) => {
		const rssLink = page.locator('a[href="/blog/rss.xml"]');
		await expect(rssLink).toBeVisible();

		const response = await page.request.get('/blog/rss.xml');
		await expect(response).toBeOK();
		const contentType = response.headers()['content-type'];
		expect(contentType).toContain('xml');
	});

	test('clicking a post navigates correctly', async ({ page }) => {
		const firstPost = allPosts[0];
		const link = page.locator(`a[href="/blog/posts/${firstPost.slug}"]`).first();
		await link.click();
		await page.waitForURL(/\/blog\/posts/, { timeout: 10000 });
		await expect(page.locator('h1')).toContainText(firstPost.title);
	});

	test('accessibility scan passes', async ({ page }) => {
		await runA11yScan(page);
	});
});
