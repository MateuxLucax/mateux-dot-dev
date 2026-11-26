import { test, expect } from '@playwright/test';

test.describe('Theme', () => {
	test('initializes a document theme', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('html')).toHaveAttribute('data-theme', /^(light|dark)$/);
	});

	test('Shiki syntax blocks exist on post with code', async ({ page }) => {
		await page.goto('/blog/posts/building-a-simple-blog');
		const light = page.locator('.shiki-light');
		const dark = page.locator('.shiki-dark');
		await expect(light.first()).toBeAttached();
		await expect(dark.first()).toBeAttached();
	});
});
