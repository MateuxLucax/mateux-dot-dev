import { test, expect } from '@playwright/test';
import {
	assertMetaTags,
	assertShikiBlocks,
	assertPeleDiagrams,
	assertPeleTheme,
	runA11yScan
} from './utils';
import { getAllPosts } from './utils/posts';

const allPosts = getAllPosts();

test.describe('Blog Posts', () => {
	for (const post of allPosts) {
		test.describe(post.slug, () => {
			test.beforeEach(async ({ page }) => {
				await page.goto(`/blog/posts/${post.slug}`);
			});

			test('has correct title and SEO tags', async ({ page }) => {
				await assertMetaTags(page, {
					title: post.title,
					description: post.description,
					canonical: `https://mateux.dev/blog/posts/${post.slug}`,
					ogUrl: `https://mateux.dev/blog/posts/${post.slug}`,
					ogType: 'article'
				});
			});

			test('has h1 matching post title', async ({ page }) => {
				await expect(page.locator('h1')).toContainText(post.title);
			});

			test('displays date and reading time', async ({ page }) => {
				await expect(page.locator('.post-meta')).toContainText(post.date);
				await expect(page.locator('.post-meta')).toContainText(/\d+ min/);
				await expect(page.locator('.lede')).toContainText(post.description);
			});

			test('shows only the essential post metadata', async ({ page }) => {
				await expect(page.locator('.post-header dl')).toHaveCount(0);
				await expect(page.locator('.post-navigation')).not.toContainText(/\d+ posts/);
				await expect(page.getByRole('link', { name: '← All writing', exact: true })).toHaveCount(1);
			});

			test('displays tags', async ({ page }) => {
				for (const tag of post.tags) {
					await expect(page.locator('.post-tags a[href="/blog?tag=' + tag + '"]')).toContainText(
						tag
					);
				}
			});

			test('prose content is not empty', async ({ page }) => {
				const prose = page.locator('.prose');
				await expect(prose).toBeVisible();
				const text = await prose.textContent();
				expect(text?.trim().length).toBeGreaterThan(0);
			});

			if (post.slug === 'timemore-dot-ble') {
				test('inline code has no decorative backticks', async ({ page }) => {
					const inlineCode = page.locator('.prose code:not(pre code)').first();
					await expect(inlineCode).toBeVisible();
					const pseudoContent = await inlineCode.evaluate((element) => ({
						before: getComputedStyle(element, '::before').content,
						after: getComputedStyle(element, '::after').content
					}));
					expect(pseudoContent).toEqual({ before: 'none', after: 'none' });
					await expect(inlineCode).toHaveCSS('font-weight', '400');
				});

				test('sequence diagram scales uniformly inside wide figure tracks', async ({ page }) => {
					const figure = page.locator('.pele-sequence-diagram');
					const svg = figure.locator('.pele-sequence');
					for (const width of [1280, 2560, 3840]) {
						await page.setViewportSize({ width, height: 2160 });
						const metrics = await svg.evaluate((element) => {
							const {
								width: renderedWidth,
								height: renderedHeight,
								x
							} = element.getBoundingClientRect();
							const viewBox = element.getAttribute('viewBox')!.split(/[ ,]+/).map(Number);
							const parent = element.parentElement!.getBoundingClientRect();
							return {
								renderedRatio: renderedWidth / renderedHeight,
								viewBoxRatio: viewBox[2] / viewBox[3],
								width: renderedWidth,
								centerOffset: Math.abs(x + renderedWidth / 2 - (parent.x + parent.width / 2)),
								preserveAspectRatio: element.getAttribute('preserveAspectRatio')
							};
						});
						expect(Math.abs(metrics.renderedRatio / metrics.viewBoxRatio - 1)).toBeLessThan(0.02);
						expect(metrics.centerOffset).toBeLessThan(1);
						expect(metrics.preserveAspectRatio).toBeNull();
						if (width >= 1440) {
							const figureBox = await figure.boundingBox();
							expect(figureBox?.width).toBeGreaterThan(760);
							if (width === 3840) expect(figureBox?.width).toBeCloseTo(1832, 0);
							expect(metrics.width).toBeCloseTo(470, 0);
						}
					}
				});
			}

			test('has back link to blog', async ({ page }) => {
				const backLink = page.getByRole('link', { name: /All writing|Back to posts/ }).first();
				await expect(backLink).toBeVisible();
				await expect(backLink).toHaveAttribute('href', '/blog');
			});

			test('has valid previous and next navigation', async ({ page }) => {
				const links = await page
					.locator('.post-navigation a')
					.evaluateAll((items) =>
						items.map((item) => (item as HTMLAnchorElement).getAttribute('href'))
					);
				const knownPosts = new Set(allPosts.map((item) => `/blog/posts/${item.slug}`));
				for (const href of links) {
					expect(href === '/blog' || knownPosts.has(href ?? '')).toBe(true);
				}
			});

			test('shows a heading-matched TOC on wide screens only', async ({ page }) => {
				await page.setViewportSize({ width: 1920, height: 1080 });
				const toc = page.getByRole('navigation', { name: 'Contents' });
				await expect(toc).toBeVisible();
				const headings = await page.locator('.prose h2').allTextContents();
				for (const heading of headings) await expect(toc).toContainText(heading.trim());
				const tocLinks = toc.locator('a[href^="#"]');
				if ((await tocLinks.count()) > 1) {
					const targetIndex = Math.max(1, Math.floor((await tocLinks.count()) / 2));
					const targetLink = tocLinks.nth(targetIndex);
					const targetHref = await targetLink.getAttribute('href');
					await page.evaluate((href) => {
						const heading = document.querySelector<HTMLElement>(href ?? '');
						if (heading)
							window.scrollTo(0, heading.getBoundingClientRect().top + window.scrollY - 150);
					}, targetHref);
					await expect(targetLink).toHaveAttribute('aria-current', 'location');
				}
				await page.setViewportSize({ width: 1440, height: 1000 });
				await expect(toc).toBeVisible();
				await expect
					.poll(() =>
						page
							.locator('.prose p')
							.first()
							.evaluate((element) => element.getBoundingClientRect().width)
					)
					.toBeCloseTo(760, 0);
				await page.setViewportSize({ width: 1280, height: 800 });
				await expect(toc).toBeHidden();
			});

			test('shows the progress bar and fits narrow screens', async ({ page }) => {
				await page.setViewportSize({ width: 360, height: 800 });
				await expect(page.locator('h1')).toHaveCSS('font-size', '28px');
				const progressFill = page.locator('.mobile-progress span');
				await expect(page.locator('.mobile-progress')).toBeVisible();
				await page.evaluate(() =>
					window.scrollTo(0, (document.documentElement.scrollHeight - window.innerHeight) * 0.3)
				);
				await expect
					.poll(() => progressFill.evaluate((element) => element.getBoundingClientRect().width))
					.toBeGreaterThan(0);
				const widths = await page.evaluate(() => ({
					page: document.documentElement.scrollWidth,
					viewport: document.documentElement.clientWidth
				}));
				expect(widths.page).toBe(widths.viewport);
				const code = page.locator('.shiki-light pre').first();
				if (await code.count()) {
					const codeBox = await code.evaluate((el) => ({
						left: el.getBoundingClientRect().left,
						right: el.getBoundingClientRect().right
					}));
					expect(codeBox.left).toBeGreaterThanOrEqual(0);
					expect(codeBox.right).toBeLessThanOrEqual(360);
				}
			});

			test('does not enable smooth scrolling for reduced motion', async ({ page }) => {
				await page.emulateMedia({ reducedMotion: 'reduce' });
				await expect(page.locator('html')).toHaveCSS('scroll-behavior', 'auto');
			});

			test('has JSON-LD structured data', async ({ page }) => {
				const script = page.locator('script[type="application/ld+json"]');
				await expect(script).toHaveCount(1);
				const jsonText = await script.textContent();
				const data = JSON.parse(jsonText || '{}');
				expect(data['@type']).toBe('BlogPosting');
				expect(data.headline).toBe(post.title);
			});

			if (post.diagramCount > 0) {
				test('Pele diagrams are prerendered as SVG', async ({ page, request }) => {
					const response = await request.get(`/blog/posts/${post.slug}`);
					expect((await response.text()).match(/class="pele /g)).toHaveLength(post.diagramCount);
					const figures = page.locator('figure.pele-diagram');
					await expect(figures).toHaveCount(post.diagramCount);
					const figureBox = await figures.first().boundingBox();
					const captionBox = await figures.first().locator('figcaption').boundingBox();
					expect(captionBox?.y).toBeLessThanOrEqual((figureBox?.y ?? 0) + 1);
					const captionLabel = await figures
						.first()
						.locator('figcaption')
						.evaluate((caption) => getComputedStyle(caption, '::before').content);
					expect(captionLabel).toBe('"FIG. " counter(figure)');
					await expect(figures.first().locator('figcaption')).toHaveText('');
					await assertPeleDiagrams(page, post.diagramCount);
				});

				test('Pele diagrams follow the selected theme', async ({ page }) => {
					for (const theme of ['light', 'dark'] as const) {
						await page.locator('html').evaluate((root, value) => {
							root.dataset.theme = value;
						}, theme);
						await assertPeleTheme(page, theme);
					}
				});
			}

			test('Shiki syntax highlighting blocks exist', async ({ page }) => {
				// Only check if post likely has code blocks
				const light = page.locator('.shiki-light');
				const lightCount = await light.count();

				if (lightCount > 0) {
					await assertShikiBlocks(page);
				}
			});

			test('copy buttons appear on code blocks', async ({ page }) => {
				const blocks = page.locator('.shiki-light, .shiki-dark');
				const count = await blocks.count();
				if (count > 0) {
					// Copy buttons are dynamically injected; verify at least one exists in DOM
					const btn = page.locator('button[aria-label="Copy code to clipboard"]:visible');
					await expect(btn.first()).toBeAttached();
					await page.evaluate(() => {
						Object.defineProperty(navigator, 'clipboard', {
							configurable: true,
							value: { writeText: () => Promise.resolve() }
						});
					});
					await btn.first().click();
					await expect(btn.first()).toHaveText('COPIED');
					await expect(btn.first()).toHaveText('COPY', { timeout: 3000 });
				}
			});

			test('accessibility scan passes', async ({ page }) => {
				await runA11yScan(page);
			});
		});
	}

	test('caps and centres the wide post sheet without overlapping named columns', async ({
		page
	}) => {
		await page.goto('/blog/posts/search-and-tokenize-portuguese-text-with-rslp');
		for (const width of [2560, 3840]) {
			await page.setViewportSize({ width, height: 2160 });
			const sheet = page.locator('.sheet');
			const box = await sheet.boundingBox();
			expect(box?.width).toBeLessThanOrEqual(2560);
			if (width === 3840) expect(Math.abs((box?.x ?? 0) - 640)).toBeLessThan(2);
			for (const column of ['.toc-column', '.prose-column']) {
				await expect(page.locator(column)).toBeVisible();
			}
			const boxes = await Promise.all(
				['.toc-column', '.prose p:first-of-type'].map((selector) =>
					page.locator(selector).boundingBox()
				)
			);
			const firstFigure = page.locator('.pele-diagram').first();
			const figure = await firstFigure.boundingBox();
			const diagram = await firstFigure.locator('.pele-diagram-art').boundingBox();
			const caption = await firstFigure.locator('figcaption').boundingBox();
			expect(boxes[0]!.x + boxes[0]!.width).toBeLessThanOrEqual(boxes[1]!.x);
			expect(boxes[1]!.width).toBeCloseTo(760, 0);
			expect(figure?.width).toBeCloseTo(1832, 0);
			expect(caption?.y).toBeGreaterThanOrEqual((diagram?.y ?? 0) + (diagram?.height ?? 0));
		}
	});
});
