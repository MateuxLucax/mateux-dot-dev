import { test, expect } from './fixtures';
import { assertMetaTags, assertShikiBlocks, waitForMermaidSVGs, runA11yScan } from './utils';
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
				await expect(page.locator('article')).toContainText('Published at');
				await expect(page.locator('article')).toContainText('min read');
			});

			test('displays tags', async ({ page }) => {
				for (const tag of post.tags) {
					await expect(page.locator('article')).toContainText(tag);
				}
			});

			test('prose content is not empty', async ({ page }) => {
				const prose = page.locator('.prose');
				await expect(prose).toBeVisible();
				const text = await prose.textContent();
				expect(text?.trim().length).toBeGreaterThan(0);
			});

			test('has back link to blog', async ({ page }) => {
				const backLink = page.locator('a[href="/blog"]');
				await expect(backLink).toBeVisible();
				await expect(backLink).toContainText('Back to posts');
			});

			test('has JSON-LD structured data', async ({ page }) => {
				const script = page.locator('script[type="application/ld+json"]');
				await expect(script).toHaveCount(1);
				const jsonText = await script.textContent();
				const data = JSON.parse(jsonText || '{}');
				expect(data['@type']).toBe('BlogPosting');
				expect(data.headline).toBe(post.title);
			});

			if (post.mermaidCount > 0) {
				test('Mermaid diagrams render as SVG', async ({ page }) => {
					await waitForMermaidSVGs(page, post.mermaidCount);
				});
			}

			test('Shiki syntax highlighting blocks exist', async ({ page }) => {
				// Only check if post likely has code blocks
				const light = page.locator('.shiki-light');
				const dark = page.locator('.shiki-dark');
				const lightCount = await light.count();
				const darkCount = await dark.count();

				if (lightCount > 0) {
					await assertShikiBlocks(page);
				}
			});

			test('copy buttons appear on code blocks', async ({ page }) => {
				const blocks = page.locator('.shiki-light, .shiki-dark');
				const count = await blocks.count();
				if (count > 0) {
					// Copy buttons are dynamically injected; verify at least one exists in DOM
					const btn = page.locator('button[aria-label="Copy code to clipboard"]');
					await expect(btn.first()).toBeAttached();
				}
			});

			test('accessibility scan passes', async ({ page }) => {
				await runA11yScan(page);
			});
		});
	}
});
