import { test } from '@playwright/test';
import { runA11yScan } from './utils';
import { getAllPosts } from './utils/posts';

const urls = [
	'/',
	'/blog',
	...getAllPosts().map((post) => `/blog/posts/${post.slug}`),
	'/about',
	'/rss',
	'/missing-page'
];
for (const url of urls) {
	test(`WCAG 2.2 AA on ${url} at both sizes and themes`, async ({ page }, testInfo) => {
		test.skip(testInfo.project.name !== 'chromium-desktop', 'Matrix runs in one browser project');
		for (const width of [390, 1440]) {
			await page.setViewportSize({ width, height: 900 });
			for (const colorScheme of ['light', 'dark'] as const) {
				await page.emulateMedia({ colorScheme });
				await page.goto(url);
				await runA11yScan(page);
			}
		}
	});
}
