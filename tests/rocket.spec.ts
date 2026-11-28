import { expect, test } from '@playwright/test';
import {
	AMBIENT_LAUNCH_PERIOD_SECONDS,
	AMBIENT_SCROLL_CYCLE,
	getAmbientLaunchState,
	getRocketGeometry
} from '../src/lib/components/rocket/engine';

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

// Largest change allowed between two frames 1/60 s apart. Roll and scroll wrap by exact
// multiples (a full turn, a full scroll cycle) at the period boundary, so they are compared
// modulo that wrap.
const stepLimits = {
	x: 0.0013,
	y: 0.0009,
	bodyAngle: 0.0002,
	roll: 0.0045,
	plumeStrength: 0.0075,
	scroll: 0.021
} as const;
const wraps: Partial<Record<keyof typeof stepLimits, number>> = {
	roll: Math.PI * 2,
	scroll: AMBIENT_SCROLL_CYCLE
};

function wrappedDelta(delta: number, wrap?: number) {
	if (!wrap) return Math.abs(delta);
	const value = ((delta % wrap) + wrap) % wrap;
	return Math.min(value, wrap - value);
}

function assertContinuousSamples(times: number[]) {
	let previous: ReturnType<typeof getAmbientLaunchState> | undefined;
	for (const time of times) {
		const state = getAmbientLaunchState(time);
		expect(state.plumeStrength).toBeGreaterThan(0.85);
		expect(Math.abs(state.bodyAngle - 0.2)).toBeLessThanOrEqual(0.03);
		if (previous) {
			for (const key of Object.keys(stepLimits) as Array<keyof typeof stepLimits>) {
				expect(
					wrappedDelta(state[key] - previous[key], wraps[key]),
					`${key} jumped between t=${time - 1 / 60} and t=${time}`
				).toBeLessThanOrEqual(stepLimits[key]);
			}
		}
		previous = state;
	}
}

test.describe('Home launch animation', () => {
	test('renders a labelled, non-blank canvas without console errors', async ({ page }) => {
		const errors: string[] = [];
		page.on('pageerror', (error) => errors.push(error.message));
		page.on('console', (message) => {
			if (message.type() === 'error') errors.push(message.text());
		});

		await page.goto('/');
		const canvas = page.locator('.rocket-launch-canvas');
		await expect(canvas).toHaveAttribute('role', 'img');
		await expect(canvas).toHaveAttribute('aria-label', /rocket ascending/i);
		await expect
			.poll(async () => (await snapshot(page, '.rocket-launch-canvas')).visiblePixels)
			.toBeGreaterThan(0);
		await expect.poll(() => errors).toEqual([]);
	});

	test('reduced motion renders a steady, lit still frame', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await page.goto('/');
		const before = await snapshot(page, '.rocket-launch-canvas');
		expect(before.visiblePixels).toBeGreaterThan(0);
		await page.waitForTimeout(500);
		expect(await snapshot(page, '.rocket-launch-canvas')).toEqual(before);
	});

	test('animates when reduced motion is not requested', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'no-preference' });
		await page.goto('/');
		const before = await snapshot(page, '.rocket-launch-canvas');
		await page.waitForTimeout(500);
		expect(await snapshot(page, '.rocket-launch-canvas')).not.toEqual(before);
	});

	test('freezes at the time in the URL hash', async ({ page }) => {
		await page.goto('/#debug&t=5');
		const canvas = page.locator('.rocket-launch-canvas');
		await expect
			.poll(
				async () => JSON.parse((await canvas.getAttribute('data-rocket-frame')) ?? 'null')?.time
			)
			.toBe(5);
		const before = await snapshot(page, '.rocket-launch-canvas');
		await page.waitForTimeout(500);
		expect(await snapshot(page, '.rocket-launch-canvas')).toEqual(before);
	});

	test('keeps attitude, roll and scroll continuous over a minute and across the period boundary', () => {
		const minute = Array.from({ length: 3601 }, (_, index) => index / 60);
		assertContinuousSamples(minute);
		assertContinuousSamples([
			AMBIENT_LAUNCH_PERIOD_SECONDS - 1 / 60,
			AMBIENT_LAUNCH_PERIOD_SECONDS,
			AMBIENT_LAUNCH_PERIOD_SECONDS + 1 / 60
		]);
	});

	test('closes the nose with a payload fairing and its seam', () => {
		const fairing = getRocketGeometry().filter((segment) => segment.part === 'n');
		const points = fairing.flatMap((segment) => [segment.a, segment.b]);
		const tipY = Math.max(...points.map((point) => point[1]));
		const tip = points.filter((point) => point[1] === tipY);
		// Every meridian meets at one point on the axis, so the tip is closed.
		for (const point of tip) {
			expect(Math.hypot(point[0], point[2])).toBeLessThan(1e-9);
		}
		expect(tip.length).toBeGreaterThanOrEqual(8);
		// The fairing is wider than the upper stage it sits on.
		const upperRadius = Math.max(
			...getRocketGeometry()
				.filter((segment) => segment.part === 'u')
				.map((segment) => segment.radius)
		);
		expect(Math.max(...fairing.map((segment) => segment.radius))).toBeGreaterThan(upperRadius);
		// Two accent seams run from the cylinder to the tip.
		const seam = fairing.filter((segment) => segment.accent);
		expect(seam.length).toBeGreaterThan(10);
		expect(Math.max(...seam.flatMap((segment) => [segment.a[1], segment.b[1]]))).toBe(tipY);
	});

	test('renders the same pixels one period later', async ({ page }) => {
		await page.setViewportSize({ width: 1440, height: 900 });
		const canvas = page.locator('.rocket-launch-canvas');
		await page.goto('/#debug&t=7.5');
		await expect
			.poll(
				async () => JSON.parse((await canvas.getAttribute('data-rocket-frame')) ?? 'null')?.time
			)
			.toBe(7.5);
		const firstFrame = await snapshot(page, '.rocket-launch-canvas');

		const nextPeriod = 7.5 + AMBIENT_LAUNCH_PERIOD_SECONDS;
		await page.evaluate((time) => (window.location.hash = `#debug&t=${time}`), nextPeriod);
		await expect
			.poll(
				async () => JSON.parse((await canvas.getAttribute('data-rocket-frame')) ?? 'null')?.time
			)
			.toBe(nextPeriod);
		expect(await snapshot(page, '.rocket-launch-canvas')).toEqual(firstFrame);
	});

	test('pauses in a hidden tab and resumes without a time jump', async ({ page }) => {
		await page.goto('/#debug');
		const canvas = page.locator('.rocket-launch-canvas');
		const readTime = () =>
			canvas
				.getAttribute('data-rocket-frame')
				.then((raw) => JSON.parse(raw ?? 'null')?.time as number);
		await expect.poll(readTime).toBeGreaterThan(0);

		await page.evaluate(() => {
			Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
			document.dispatchEvent(new Event('visibilitychange'));
		});
		const pausedAt = await readTime();
		await page.waitForTimeout(300);
		expect(await readTime()).toBe(pausedAt);

		await page.evaluate(() => {
			Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
			document.dispatchEvent(new Event('visibilitychange'));
		});
		await expect.poll(readTime).toBeGreaterThan(pausedAt);
		// The tab was hidden for 300 ms; a jump would add at least that much.
		expect((await readTime()) - pausedAt).toBeLessThan(0.25);
	});

	test('keeps the rocket in its clipped slot without a sheet-wide flight layer', async ({
		page
	}) => {
		await page.setViewportSize({ width: 1440, height: 900 });
		await page.goto('/#debug&t=6.5');
		await expect(page.locator('.rocket-flight-canvas')).toHaveCount(0);
		const result = await page.locator('.rocket-launch-canvas').evaluate((canvas) => {
			const canvasRect = canvas.getBoundingClientRect();
			const figure = document.querySelector('.rocket-figure')!;
			const figureRect = figure.getBoundingClientRect();
			return {
				insideFigure:
					canvasRect.left >= figureRect.left &&
					canvasRect.top >= figureRect.top &&
					canvasRect.right <= figureRect.right &&
					canvasRect.bottom <= figureRect.bottom,
				clips: getComputedStyle(figure).overflow === 'hidden'
			};
		});
		expect(result.insideFigure).toBe(true);
		expect(result.clips).toBe(true);
	});
});
