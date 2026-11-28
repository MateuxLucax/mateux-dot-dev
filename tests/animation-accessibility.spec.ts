import { expect, test } from '@playwright/test';

async function paintedCanvas(canvas: import('@playwright/test').Locator) {
	return canvas.evaluate((node) => {
		const element = node as HTMLCanvasElement;
		const pixels = element.getContext('2d')!.getImageData(0, 0, element.width, element.height).data;
		return pixels.some((value, index) => index % 4 === 3 && value > 0) ? element.toDataURL() : '';
	});
}

for (const url of ['/', '/about', '/missing-page']) {
	test(`animation can be paused, resumed, and remembered on ${url}`, async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'no-preference' });
		await page.goto(url);
		const pause = page.getByRole('button', { name: 'Pause animation' });
		await expect(pause).toHaveAttribute('aria-pressed', 'false');
		const box = await pause.boundingBox();
		expect(box!.width).toBeGreaterThanOrEqual(24);
		expect(box!.height).toBeGreaterThanOrEqual(24);
		await pause.focus();
		await page.keyboard.press('Space');
		const play = page.getByRole('button', { name: 'Play animation' });
		await expect(play).toHaveAttribute('aria-pressed', 'true');
		const canvas = page.locator('canvas').first();
		await expect.poll(() => paintedCanvas(canvas)).not.toBe('');
		const frame = await paintedCanvas(canvas);
		await page.waitForTimeout(300);
		expect(await paintedCanvas(canvas)).toBe(frame);
		await page.reload();
		await expect(play).toHaveAttribute('aria-pressed', 'true');
		await play.focus();
		await page.keyboard.press('Enter');
		await expect(pause).toHaveAttribute('aria-pressed', 'false');
	});

	test(`reduced motion keeps ${url} still and hides the control`, async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await page.goto(url);
		await expect(page.getByRole('button', { name: /(?:Pause|Play) animation/ })).toBeHidden();
		const canvas = page.locator('canvas').first();
		await expect.poll(() => paintedCanvas(canvas)).not.toBe('');
		const frame = await paintedCanvas(canvas);
		await page.waitForTimeout(300);
		expect(await paintedCanvas(canvas)).toBe(frame);
	});
}
