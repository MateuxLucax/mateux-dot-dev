import { test, expect } from './fixtures';
import { getAllPosts } from './utils/posts';

const allPosts = getAllPosts();

test.describe('Sitemap', () => {
	test('returns valid XML with all routes', async ({ request }) => {
		const response = await request.get('/sitemap.xml');
		await expect(response).toBeOK();

		const contentType = response.headers()['content-type'];
		expect(contentType).toContain('xml');

		const body = await response.text();
		expect(body).toContain('<?xml version="1.0"');
		expect(body).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');

		// Static routes
		expect(body).toContain('https://mateux.dev</loc>');
		expect(body).toContain('https://mateux.dev/blog</loc>');
		expect(body).toContain('https://mateux.dev/typetest</loc>');

		// All posts
		for (const post of allPosts) {
			expect(body).toContain(`https://mateux.dev/blog/posts/${post.slug}`);
		}
	});
});
