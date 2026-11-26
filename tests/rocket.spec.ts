import { expect, test } from '@playwright/test';

async function snapshot(page: import('@playwright/test').Page) {
	return page.locator('canvas').evaluate((canvas) => {
		const element = canvas as HTMLCanvasElement;
		const pixels = element.getContext('2d')!.getImageData(0, 0, element.width, element.height).data;
		let hash = 2166136261;
		let visiblePixels = 0;
		for (let i = 0; i < pixels.length; i += 4) {
			if (pixels[i + 3]) visiblePixels++;
			for (let channel = 0; channel < 4; channel++) {
				hash = Math.imul(hash ^ pixels[i + channel], 16777619);
			}
		}
		return { hash: hash >>> 0, visiblePixels };
	});
}

test.describe('Home launch animation', () => {
	test('renders a labelled, non-blank canvas without console errors', async ({ page }) => {
		const errors: string[] = [];
		page.on('pageerror', (error) => errors.push(error.message));
		page.on('console', (message) => {
			if (message.type() === 'error') errors.push(message.text());
		});

		await page.goto('/');
		const canvas = page.locator('canvas');
		await expect(canvas).toHaveAttribute('role', 'img');
		await expect(canvas).toHaveAttribute('aria-label', /rocket launching/i);
		await expect.poll(async () => (await snapshot(page)).visiblePixels).toBeGreaterThan(0);
		await expect.poll(() => errors).toEqual([]);
	});

	test('reduced motion holds a representative frame steady', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await page.goto('/');
		const before = await snapshot(page);
		await page.waitForTimeout(500);
		expect(await snapshot(page)).toEqual(before);
	});

	test('animates when reduced motion is not requested', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'no-preference' });
		await page.goto('/');
		const before = await snapshot(page);
		await page.waitForTimeout(500);
		expect(await snapshot(page)).not.toEqual(before);
	});

	test('freezes at the time in the URL hash', async ({ page }) => {
		await page.goto('/#t=5');
		const before = await snapshot(page);
		await page.waitForTimeout(500);
		expect(await snapshot(page)).toEqual(before);
	});
});
