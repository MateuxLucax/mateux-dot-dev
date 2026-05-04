import { test, expect } from '@playwright/test';
import { assertPrompt, runA11yScan } from './utils';
import { getAllPosts } from './utils/posts';

const latestPosts = getAllPosts().slice(0, 3);

test.describe('Homepage', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('has correct title and terminal header', async ({ page }) => {
		await expect(page).toHaveTitle(/mateux@tars/);

		const terminalHeader = page.locator('header', { hasText: 'mateux@tars' });
		await expect(terminalHeader).toBeVisible();

		// Terminal dots
		await expect(terminalHeader.locator('span.bg-red-400')).toBeVisible();
		await expect(terminalHeader.locator('span.bg-yellow-400')).toBeVisible();
		await expect(terminalHeader.locator('span.bg-green-400')).toBeVisible();
	});

	test('displays About section', async ({ page }) => {
		await assertPrompt(page, '/About');
		await expect(page.locator("text=Hi there, I'm Mateus Lucas")).toBeVisible();
	});

	test('displays Contacts with valid links', async ({ page }) => {
		await assertPrompt(page, '/Contacts');

		const linkedin = page.locator('a[href="https://www.linkedin.com/in/mateusbrandt"]');
		await expect(linkedin).toBeVisible();
		await expect(linkedin).toHaveAttribute('target', '_blank');

		const github = page.locator('a[href="https://github.com/mateuxlucax"]');
		await expect(github).toBeVisible();
		await expect(github).toHaveAttribute('target', '_blank');
	});

	test('has navigation link to blog', async ({ page }) => {
		const blogLink = page.locator('a[href="/blog"]').first();
		await expect(blogLink).toBeVisible();
	});

	test('displays the 3 latest blog posts', async ({ page }) => {
		await assertPrompt(page, '/Blog');

		for (const post of latestPosts) {
			const link = page.locator(`a[href="/blog/posts/${post.slug}"]`);
			await expect(link).toBeVisible();
			await expect(link).toContainText(post.title);
		}
	});

	test('terminal input is present', async ({ page }) => {
		const input = page.locator('input[aria-label="Type a command"]');
		await expect(input).toBeVisible();
	});

	test('accessibility scan passes', async ({ page }) => {
		await runA11yScan(page);
	});
});
