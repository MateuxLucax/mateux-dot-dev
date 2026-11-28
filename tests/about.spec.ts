import { expect, test } from '@playwright/test';
import { runA11yScan } from './utils';
import { getAllPosts } from './utils/posts';

const slugs = [
	'timemore-dot-ble',
	'unifique-speedtest-monitoring',
	'automated-accessibility-flutter-linter'
];
test('shows featured writing and biography', async ({ page }) => {
	await page.goto('/about');
	await expect(page).toHaveTitle('About · Mateus Brandt');
	await expect(page.locator('h1')).toHaveCount(1);
	await expect(page.getByText('I’m Mateus Brandt, a software engineer in Brazil.')).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Things I’ve taken apart' })).toBeVisible();
	const links = page.locator('.posts a');
	await expect(links).toHaveCount(3);
	for (const [i, slug] of slugs.entries()) {
		await expect(links.nth(i)).toHaveAttribute('href', `/blog/posts/${slug}`);
		await expect(links.nth(i)).toContainText(getAllPosts().find((p) => p.slug === slug)!.title);
	}
	await expect(page.getByRole('link', { name: /All writing/ })).toHaveAttribute('href', '/blog');
	await expect(page.locator('body')).not.toContainText(
		/This site|Writes about|aerospace|\/blog\/rss\.xml|\bhe\b|\bhis\b|Mateus writes/i
	);
	await expect(page.locator('canvas')).toBeAttached();
	for (const name of ['GitHub', 'LinkedIn', 'RSS'])
		await expect(
			page.locator('.elsewhere').getByRole('link', { name: new RegExp(name) })
		).toBeVisible();
	await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
		'href',
		'https://mateux.dev/about'
	);
});
for (const width of [320, 390, 1440, 2560])
	test(`fits ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 900 });
		await page.goto('/about');
		expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
		if (width === 390)
			expect(
				await page.locator('.posts').evaluate((el) => el.getBoundingClientRect().bottom)
			).toBeLessThan(await page.locator('.side').evaluate((el) => el.getBoundingClientRect().top));
	});
for (const width of [390, 1440])
	for (const theme of ['light', 'dark'])
		test(`accessible ${width} ${theme}`, async ({ page }) => {
			await page.setViewportSize({ width, height: 900 });
			await page.emulateMedia({ reducedMotion: 'reduce' });
			await page.goto('/about');
			await page.evaluate((value) => (document.documentElement.dataset.theme = value), theme);
			await runA11yScan(page);
		});

test('paints the reduced-motion rocket with clear edges', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/about');
	const canvas = page.locator('.photo canvas');
	await expect
		.poll(() =>
			canvas.evaluate((node) => {
				const el = node as HTMLCanvasElement;
				const pixels = el.getContext('2d')!.getImageData(0, 0, el.width, el.height).data;
				let top = el.height,
					bottom = -1;
				for (let y = 0; y < el.height; y++)
					for (let x = 0; x < el.width; x++)
						if (pixels[(y * el.width + x) * 4 + 3]) {
							top = Math.min(top, y);
							bottom = Math.max(bottom, y);
						}
				return bottom >= 0 && top >= el.height * 0.02 && el.height - bottom - 1 >= el.height * 0.02;
			})
		)
		.toBe(true);
});

test('keeps the exploded rocket inside its frame throughout the loop', async ({ page }) => {
	for (const width of [390, 1440]) {
		await page.setViewportSize({ width, height: 900 });
		await page.goto('/about#debug&t=0');
		const canvas = page.locator('.photo canvas');
		for (const time of [0, 2.8, 3, 3.5, 4, 5, 6, 7, 7.5, 8, 8.5, 9]) {
			await page.evaluate((time) => {
				location.hash = `debug&t=${time}`;
			}, time);
			await expect
				.poll(async () => JSON.parse((await canvas.getAttribute('data-rocket-frame')) ?? '{}').time)
				.toBe(time);
			const bounds = await canvas.evaluate((node) => {
				const el = node as HTMLCanvasElement;
				const { width, height } = el;
				const pixels = el.getContext('2d')!.getImageData(0, 0, width, height).data;
				let top = height,
					bottom = -1,
					left = width,
					right = -1;
				for (let y = 0; y < height; y++)
					for (let x = 0; x < width; x++)
						if (pixels[(y * width + x) * 4 + 3]) {
							top = Math.min(top, y);
							bottom = Math.max(bottom, y);
							left = Math.min(left, x);
							right = Math.max(right, x);
						}
				return {
					top: top / height,
					bottom: bottom / height,
					left: left / width,
					right: right / width
				};
			});
			expect(bounds.top).toBeGreaterThan(0.02);
			expect(bounds.bottom).toBeLessThan(0.98);
			expect(bounds.left).toBeGreaterThan(0.02);
			expect(bounds.right).toBeLessThan(0.98);
			if (time === 5) expect(bounds.bottom - bounds.top).toBeGreaterThan(0.77);
		}
	}
});
