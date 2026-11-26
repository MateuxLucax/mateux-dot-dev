import { expect, test } from '@playwright/test';
import { runA11yScan } from './utils';

async function pixels(page: import('@playwright/test').Page, index = 0) {
	return page
		.locator('canvas')
		.nth(index)
		.evaluate((canvas) => {
			const element = canvas as HTMLCanvasElement;
			const context = element.getContext('2d');
			if (!context) throw new Error('Canvas 2D context is unavailable');
			const data = context.getImageData(0, 0, element.width, element.height).data;
			let hash = 2166136261;
			let visiblePixels = 0;
			for (let i = 0; i < data.length; i += 4) {
				if (data[i + 3]) visiblePixels++;
				for (let channel = 0; channel < 4; channel++) {
					hash = Math.imul(hash ^ data[i + channel], 16777619);
				}
			}
			return { hash: hash >>> 0, visiblePixels };
		});
}

test.describe('Rocket animation preview', () => {
	test('renders accessible, non-blank canvases without console errors', async ({ page }) => {
		const errors: string[] = [];
		page.on('pageerror', (error) => errors.push(error.message));
		page.on('console', (message) => {
			if (message.type() === 'error') errors.push(message.text());
		});

		await page.goto('/dev/rocket');
		const canvases = page.locator('canvas[role="img"]');
		await expect(canvases).toHaveCount(3);
		await expect(canvases.nth(0)).toHaveAttribute(
			'aria-label',
			'Wireframe drawing of a two-stage rocket launching'
		);
		await expect(canvases.nth(1)).toHaveAttribute(
			'aria-label',
			'Wireframe drawing of an exploded two-stage rocket'
		);
		await expect(canvases.nth(2)).toHaveAttribute(
			'aria-label',
			'Wireframe drawing of a rocket tumbling in space'
		);

		for (let i = 0; i < 3; i++) {
			await expect.poll(async () => (await pixels(page, i)).visiblePixels).toBeGreaterThan(0);
		}
		await expect.poll(() => errors).toEqual([]);
	});

	test('reduced motion holds a representative frame steady', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await page.goto('/dev/rocket');
		await expect(page.locator('canvas[role="img"]')).toHaveCount(3);
		const before = await pixels(page, 0);
		await page.waitForTimeout(500);
		expect(await pixels(page, 0)).toEqual(before);
	});

	test('animates when reduced motion is not requested', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'no-preference' });
		await page.goto('/dev/rocket');
		await expect(page.locator('canvas[role="img"]')).toHaveCount(3);
		const before = await pixels(page, 0);
		await page.waitForTimeout(500);
		expect(await pixels(page, 0)).not.toEqual(before);
	});

	test('freezes at the time in the URL hash', async ({ page }) => {
		await page.goto('/dev/rocket#t=5');
		await expect(page.locator('canvas[role="img"]')).toHaveCount(3);
		const before = await pixels(page, 0);
		await page.waitForTimeout(500);
		expect(await pixels(page, 0)).toEqual(before);
	});

	test('passes accessibility checks', async ({ page }) => {
		await page.goto('/dev/rocket');
		await runA11yScan(page);
	});
});
