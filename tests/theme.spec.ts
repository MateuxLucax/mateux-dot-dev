import { test, expect } from './fixtures';

test.describe('Terminal Theme', () => {
	test('global font is monospace class', async ({ page }) => {
		await page.goto('/');
		const main = page.locator('main.font-mono');
		await expect(main).toBeVisible();
	});

	test('Shiki syntax blocks exist on post with code', async ({ page }) => {
		await page.goto('/blog/posts/building-a-simple-blog');
		const light = page.locator('.shiki-light');
		const dark = page.locator('.shiki-dark');
		await expect(light.first()).toBeAttached();
		await expect(dark.first()).toBeAttached();
	});

	test('prompt colors use terminal classes', async ({ page }) => {
		await page.goto('/');
		await expect(
			page.locator('span.text-teal-600, span.dark\\:text-teal-300').first()
		).toBeVisible();
		await expect(
			page.locator('span.text-blue-500, span.dark\\:text-blue-300').first()
		).toBeVisible();
		await expect(
			page.locator('span.text-yellow-500, span.dark\\:text-yellow-300').first()
		).toBeVisible();
		await expect(
			page.locator('span.text-pink-400, span.dark\\:text-pink-300').first()
		).toBeVisible();
	});
});
