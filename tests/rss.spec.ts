import { test, expect } from './fixtures';
import { getAllPosts } from './utils/posts';

const allPosts = getAllPosts();

test.describe('RSS Feed', () => {
	test('returns valid Atom XML with all posts', async ({ request }) => {
		const response = await request.get('/blog/rss.xml');
		await expect(response).toBeOK();

		const contentType = response.headers()['content-type'];
		expect(contentType).toMatch(/atom\+xml|text\/xml/);

		const body = await response.text();
		expect(body).toContain('<?xml version="1.0"');
		expect(body).toContain('<feed xmlns="http://www.w3.org/2005/Atom">');
		expect(body).toContain('<title>mateux.dev blog</title>');

		for (const post of allPosts) {
			expect(body).toContain(post.title);
			expect(body).toContain(`/blog/posts/${post.slug}`);
			// RSS XML-escapes descriptions, so we check the escaped version
			const escapedDesc = post.description
				.replace(/&/g, '&amp;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;')
				.replace(/"/g, '&quot;')
				.replace(/'/g, '&apos;');
			expect(body).toContain(escapedDesc);
		}

		// Count entries
		const entryMatches = body.match(/<entry>/g);
		expect(entryMatches?.length).toBe(allPosts.length);
	});
});
