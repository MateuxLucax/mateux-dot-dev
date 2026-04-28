import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:4173';

export default defineConfig({
	testDir: './tests',
	fullyParallel: false,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: 1,
	reporter: [['list'], ['html', { open: 'never' }]],
	use: {
		baseURL,
		trace: 'on-first-retry',
		screenshot: 'only-on-failure'
	},
	projects: [
		{
			name: 'chromium-desktop',
			use: {
				...devices['Desktop Chrome'],
				colorScheme: 'light'
			}
		},
		{
			name: 'chromium-desktop-dark',
			use: {
				...devices['Desktop Chrome'],
				colorScheme: 'dark'
			}
		}
	],
	webServer: process.env.PLAYWRIGHT_BASE_URL
		? undefined
		: {
				command: 'bun run preview',
				url: 'http://localhost:4173',
				reuseExistingServer: false
			}
});
