import { expect, test } from '@playwright/test';
import { getLaunchPose } from '../src/lib/components/rocket/engine';

async function snapshot(page: import('@playwright/test').Page, selector: string) {
	return page.locator(selector).evaluate((canvas) => {
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
		const canvas = page.locator('.rocket-ground-canvas');
		await expect(canvas).toHaveAttribute('role', 'img');
		await expect(canvas).toHaveAttribute('aria-label', /rocket launching/i);
		await expect
			.poll(async () => (await snapshot(page, '.rocket-ground-canvas')).visiblePixels)
			.toBeGreaterThan(0);
		await expect.poll(() => errors).toEqual([]);
	});

	test('reduced motion holds a representative frame steady', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await page.goto('/');
		const before = await snapshot(page, '.rocket-ground-canvas');
		await page.waitForTimeout(500);
		expect(await snapshot(page, '.rocket-ground-canvas')).toEqual(before);
	});

	test('animates when reduced motion is not requested', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'no-preference' });
		await page.goto('/');
		const before = await snapshot(page, '.rocket-ground-canvas');
		await page.waitForTimeout(500);
		expect(await snapshot(page, '.rocket-ground-canvas')).not.toEqual(before);
	});

	test('freezes at the time in the URL hash', async ({ page }) => {
		await page.goto('/#t=5');
		const before = await snapshot(page, '.rocket-flight-canvas');
		await page.waitForTimeout(500);
		expect(await snapshot(page, '.rocket-flight-canvas')).toEqual(before);
	});

	test('keeps the body aligned with the flight velocity and plume on the nozzle', () => {
		for (let index = 0; index < 20; index++) {
			const time = 4.25 + index * 0.25;
			const pose = getLaunchPose(time);
			const velocityAngle = Math.atan2(pose.vx, pose.vy);
			const angleError = Math.atan2(
				Math.sin(pose.bodyAngle - velocityAngle),
				Math.cos(pose.bodyAngle - velocityAngle)
			);
			expect(Math.abs(angleError), `body angle at t=${time}`).toBeLessThan((2 * Math.PI) / 180);
		}
	});

	test('keeps the plume origin on the nozzle exit', async ({ page }) => {
		await page.setViewportSize({ width: 1440, height: 900 });
		await page.goto('/#debug&t=6.5');
		const points = await page.locator('.rocket-flight-canvas').evaluate((canvas) => {
			const frame = JSON.parse((canvas as HTMLCanvasElement).dataset.rocketFrame ?? 'null');
			return { nozzle: frame?.nozzle, plumeOrigin: frame?.plumeOrigin };
		});
		expect(points.nozzle).toBeDefined();
		expect(points.plumeOrigin).toBeDefined();
		expect(
			Math.hypot(points.nozzle.x - points.plumeOrigin.x, points.nozzle.y - points.plumeOrigin.y)
		).toBeLessThanOrEqual(1);
	});

	test('draws flight pixels beyond the former figure box but inside the sheet', async ({
		page
	}) => {
		await page.setViewportSize({ width: 1440, height: 900 });
		await page.goto('/#debug&t=6.5');
		const result = await page.locator('.rocket-flight-canvas').evaluate((canvas) => {
			const element = canvas as HTMLCanvasElement;
			const canvasRect = element.getBoundingClientRect();
			const figureRect = document.querySelector('.rocket-figure')!.getBoundingClientRect();
			const sheet = document.querySelector('.sheet')!.getBoundingClientRect();
			const pixels = element
				.getContext('2d')!
				.getImageData(0, 0, element.width, element.height).data;
			const scaleX = element.width / canvasRect.width;
			const scaleY = element.height / canvasRect.height;
			const left = Math.max(0, Math.floor((figureRect.left - canvasRect.left) * scaleX));
			const right = Math.min(
				element.width,
				Math.ceil((figureRect.right - canvasRect.left) * scaleX)
			);
			const top = Math.max(0, Math.floor((figureRect.top - canvasRect.top) * scaleY));
			const bottom = Math.min(
				element.height,
				Math.ceil((figureRect.bottom - canvasRect.top) * scaleY)
			);
			let outsideFigurePixels = 0;
			for (let y = 0; y < element.height; y++) {
				for (let x = 0; x < element.width; x++) {
					if (x >= left && x < right && y >= top && y < bottom) continue;
					if (pixels[(y * element.width + x) * 4 + 3]) outsideFigurePixels++;
				}
			}
			return {
				outsideFigurePixels,
				canvasInsideSheet:
					canvasRect.left >= sheet.left + 1 &&
					canvasRect.top >= sheet.top + 1 &&
					canvasRect.right <= sheet.right - 1 &&
					canvasRect.bottom <= sheet.bottom - 1,
				clipsOverflow: getComputedStyle(element.parentElement!).overflow === 'hidden'
			};
		});
		expect(result.outsideFigurePixels).toBeGreaterThan(0);
		expect(result.canvasInsideSheet).toBe(true);
		expect(result.clipsOverflow).toBe(true);
	});
});
