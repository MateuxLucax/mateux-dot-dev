import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { runA11yScan } from './utils';
import { getAllPosts } from './utils/posts';

const posts = getAllPosts();
const tagCounts = new Map<string, number>();
for (const post of posts)
	for (const tag of post.tags) tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
const popularTags = [...tagCounts]
	.sort((a, b) => b[1] - a[1])
	.slice(0, 7)
	.map(([tag]) => tag);
const newestFirst = [...posts].sort((a, b) => b.date.localeCompare(a.date));

async function expectCanvasPainted(page: import('@playwright/test').Page) {
	const canvas = page.locator('canvas').first();
	await expect
		.poll(() =>
			canvas.evaluate((node) => {
				const element = node as HTMLCanvasElement;
				const context = element.getContext('2d');
				if (!context) return 0;
				const pixels = context.getImageData(0, 0, element.width, element.height).data;
				let painted = 0;
				for (let index = 3; index < pixels.length; index += 4) if (pixels[index]) painted++;
				return painted;
			})
		)
		.toBeGreaterThan(0);
}

async function expectCanvasEdgesClear(canvas: import('@playwright/test').Locator) {
	await expect
		.poll(() =>
			canvas.evaluate((node) => {
				const element = node as HTMLCanvasElement;
				const pixels = element
					.getContext('2d')!
					.getImageData(0, 0, element.width, element.height).data;
				let top = element.height;
				let bottom = -1;
				for (let y = 0; y < element.height; y++) {
					for (let x = 0; x < element.width; x++) {
						if (pixels[(y * element.width + x) * 4 + 3]) {
							top = Math.min(top, y);
							bottom = Math.max(bottom, y);
						}
					}
				}
				const margin = element.height * 0.05;
				return bottom >= 0 && top >= margin && element.height - bottom - 1 >= margin;
			})
		)
		.toBe(true);
}

test.describe('About', () => {
	test('shows the drafted biography, spec, social links and real popular tags', async ({
		page
	}) => {
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await page.goto('/about');
		await expect(page).toHaveTitle('About · Mateus Brandt');
		await expect(page.getByRole('heading', { name: 'About.' })).toBeVisible();
		await expect(page.getByText('I’m Mateus Brandt, a software engineer in Brazil.')).toBeVisible();
		await expect(page.getByText(/Most of my day is backend systems/)).toBeVisible();
		await expect(page.getByText(/I write it down here when I get something working/)).toBeVisible();
		await expect(page.getByText(/The rocket is there because/)).toBeVisible();
		for (const [term, value] of [
			['Based in', 'Brazil'],
			['Day to day', 'Backend, Kotlin'],
			['On the side', 'Dart, Go, Svelte, Rust'],
			['This site', 'SvelteKit on Cloudflare Pages']
		]) {
			const row = page.locator('dl').locator('xpath=..');
			await expect(row).toContainText(term);
			await expect(row).toContainText(value);
		}
		await expect(page.getByRole('link', { name: /GitHub mateuxlucax/ })).toHaveAttribute(
			'href',
			'https://github.com/mateuxlucax'
		);
		await expect(page.getByRole('link', { name: /GitHub mateuxlucax/ })).toHaveAttribute(
			'rel',
			'me'
		);
		await expect(page.getByRole('link', { name: /LinkedIn mateusbrandt/ })).toHaveAttribute(
			'href',
			'https://www.linkedin.com/in/mateusbrandt'
		);
		await expect(page.getByRole('link', { name: /LinkedIn mateusbrandt/ })).toHaveAttribute(
			'rel',
			'me'
		);
		await expect(page.getByRole('link', { name: /RSS \/blog\/rss.xml/ })).toHaveAttribute(
			'href',
			'/rss'
		);
		await expect(page.getByRole('link', { name: 'tell me' })).toHaveAttribute(
			'href',
			'https://www.linkedin.com/in/mateusbrandt'
		);
		const chips = page.locator('.chip');
		await expect(chips).toHaveCount(popularTags.length);
		for (const [index, tag] of popularTags.entries()) {
			await expect(chips.nth(index)).toHaveText(tag);
			await expect(chips.nth(index)).toHaveAttribute('href', `/blog?tag=${tag}`);
			expect(posts.some((post) => post.tags.includes(tag))).toBe(true);
		}
		await expectCanvasPainted(page);
		await expectCanvasEdgesClear(page.locator('.photo canvas'));
	});

	test('uses canonical metadata, stays in the viewport and puts links after chips on phones', async ({
		page
	}) => {
		await page.setViewportSize({ width: 360, height: 780 });
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await page.goto('/about');
		await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
			'href',
			'https://mateux.dev/about'
		);
		await expectCanvasPainted(page);
		await expectCanvasEdgesClear(page.locator('.photo canvas'));
		expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(360);
		const order = await page.evaluate(() => {
			const chips = document.querySelector('.chips')!.getBoundingClientRect().top;
			const links = document.querySelector('.elsewhere')!.getBoundingClientRect().top;
			return { chips, links };
		});
		expect(order.links).toBeGreaterThan(order.chips);
	});

	test('keeps the exploded rocket still with reduced motion and passes axe in both themes', async ({
		page
	}) => {
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await page.goto('/about');
		await expectCanvasPainted(page);
		for (const theme of ['light', 'dark']) {
			await page.evaluate((value) => (document.documentElement.dataset.theme = value), theme);
			await runA11yScan(page);
		}
	});
});

test.describe('Feed page', () => {
	test('shows the feed address, build-time count, newest posts and valid Atom endpoint', async ({
		page,
		request
	}) => {
		await page.goto('/rss');
		await expect(page).toHaveTitle('Feed · Mateus Brandt');
		await expect(page.getByRole('heading', { name: /Feed/ })).toBeVisible();
		await expect(page.locator('.url-box code')).toHaveText('https://mateux.dev/blog/rss.xml');
		await expect(page.locator('.note')).toHaveText(
			`Atom · ${posts.length} posts · updated ${newestFirst[0].date}`
		);
		const items = page.locator('.feed-list > li');
		await expect(items).toHaveCount(4);
		for (const [index, post] of newestFirst.slice(0, 4).entries()) {
			await expect(items.nth(index).getByRole('link')).toHaveAttribute(
				'href',
				`/blog/posts/${post.slug}`
			);
			await expect(items.nth(index)).toContainText(post.title);
			await expect(items.nth(index)).toContainText(post.description);
		}
		await expect(page.getByRole('link', { name: /ALL WRITING/ })).toHaveAttribute('href', '/blog');
		const atom = await request.get('/blog/rss.xml');
		expect(atom.status()).toBe(200);
		expect(atom.headers()['content-type']).toMatch(/(?:application\/atom\+xml|text\/xml)/);
		expect(await atom.text()).toContain('<feed');
	});

	test('copies the address and announces the temporary copied state', async ({ page, context }) => {
		await context.grantPermissions(['clipboard-read', 'clipboard-write']);
		await page.goto('/rss');
		const button = page.getByRole('button', { name: 'COPY' });
		await button.click();
		await expect(page.getByRole('button', { name: 'COPIED' })).toBeVisible();
		expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
			'https://mateux.dev/blog/rss.xml'
		);
		await expect(page.locator('[aria-live="polite"]')).toContainText('Copied');
		await expect(page.getByRole('button', { name: 'COPY' })).toBeVisible({ timeout: 3000 });
	});

	test('marks RSS current and passes axe in light and dark themes', async ({ page, isMobile }) => {
		await page.goto('/rss');
		if (isMobile) {
			await page.getByRole('button', { name: 'Menu' }).click();
			await expect(
				page.getByRole('navigation', { name: 'Menu' }).getByRole('link', { name: 'RSS' })
			).toHaveAttribute('aria-current', 'page');
		} else {
			await expect(
				page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'RSS' })
			).toHaveAttribute('aria-current', 'page');
		}
		for (const theme of ['light', 'dark']) {
			await page.evaluate((value) => (document.documentElement.dataset.theme = value), theme);
			await runA11yScan(page);
		}
	});
});

test.describe('404 page', () => {
	test('returns status 404 with the requested path, navigation and tumbling rocket', async ({
		page
	}) => {
		const response = await page.goto('/does-not-exist');
		expect(response?.status()).toBe(404);
		await expect(page).toHaveTitle('Not found · Mateus Brandt');
		await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
		await expect(page.getByText('/does-not-exist')).toBeVisible();
		await expect(page.locator('.buttons').getByRole('link', { name: 'HOME' })).toHaveAttribute(
			'href',
			'/'
		);
		await expect(page.locator('.buttons').getByRole('link', { name: 'WRITING' })).toHaveAttribute(
			'href',
			'/blog'
		);
		await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
		await expect(page.getByRole('contentinfo')).toHaveCount(0);
		await expectCanvasPainted(page);
	});

	test('puts the rocket before text on phones and passes axe in both themes', async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto('/does-not-exist');
		const order = await page.evaluate(() => ({
			rocket: document.querySelector('.rocket-box')!.getBoundingClientRect().top,
			text: document.querySelector('.error-copy')!.getBoundingClientRect().top
		}));
		expect(order.rocket).toBeLessThan(order.text);
		for (const theme of ['light', 'dark']) {
			await page.evaluate((value) => (document.documentElement.dataset.theme = value), theme);
			await runA11yScan(page);
		}
	});
});

test('Cloudflare Pages redirect is present in the built output', () => {
	const redirects = readFileSync('.svelte-kit/cloudflare/_redirects', 'utf8');
	expect(redirects).toContain('/typetest / 301');
	expect(redirects).toContain('/typetest/ / 301');
});
