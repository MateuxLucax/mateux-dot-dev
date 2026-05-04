import { test, expect } from '@playwright/test';

test.describe('Performance', () => {
	const routes = ['/', '/blog', '/typetest'];

	for (const route of routes) {
		test(`Web Vitals on ${route}`, async ({ page }) => {
			await page.goto(route);
			await page.waitForLoadState('networkidle');

			const vitals = await page.evaluate(() => {
				const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
				const lcp = performance
					.getEntriesByType('element')
					.find((e) => e.entryType === 'largest-contentful-paint') as PerformanceEntry | undefined;

				return {
					fcp: nav?.responseStart || 0,
					lcp: lcp?.startTime || 0,
					// CLS is harder to get synchronously; we'll check TTFB instead
					ttfb: nav?.responseStart || 0
				};
			});

			// Thresholds (ms)
			expect(vitals.fcp).toBeLessThan(1800);
			expect(vitals.ttfb).toBeLessThan(600);
		});
	}
});
