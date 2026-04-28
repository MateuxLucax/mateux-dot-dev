import { test, expect } from './fixtures';
import { runA11yScan } from './utils';

test.describe('TypeTest', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/typetest', { waitUntil: 'networkidle' });
	});

	test('loads with correct title', async ({ page }) => {
		await expect(page).toHaveTitle(/TypeTest/);
	});

	test('duration buttons switch correctly', async ({ page }) => {
		const btn15 = page.locator('button', { hasText: '15s' });
		const btn30 = page.locator('button', { hasText: '30s' });
		const btn60 = page.locator('button', { hasText: '60s' });

		await expect(btn30).toHaveClass(/underline/);

		await btn15.click();
		await expect(btn15).toHaveClass(/underline/);

		await btn60.click();
		await expect(btn60).toHaveClass(/underline/);
	});

	test('typing starts the timer and changes word colors', async ({ page }) => {
		test.slow();
		const input = page.locator('input[aria-label="Typing test input"]');

		// Get the first word
		const firstWord = (
			await page.locator('.flex-wrap.gap-x-2 > span').first().textContent()
		)?.trim();
		if (!firstWord) throw new Error('No words found');

		// Ensure input is focused and type the word character by character
		await input.scrollIntoViewIfNeeded();
		await input.focus();
		await page.waitForTimeout(500);
		await page.keyboard.type(firstWord + ' ');
		await page.waitForTimeout(1000);

		// Timer should be running (look for the teal countdown, not the word "time")
		await expect(page.locator('span.text-teal-600').filter({ hasText: /\ds/ })).toBeVisible();

		// First word should turn green (correct)
		const wordEl = page.locator('.flex-wrap.gap-x-2 > span').first();
		const coloredSpan = wordEl.locator('span.text-green-600, span.dark\\:text-green-400').first();
		await expect(coloredSpan).toBeAttached();
		await expect(coloredSpan).toHaveText(firstWord);
	});

	test('completing test shows results JSON', async ({ page }) => {
		// Use shortest duration
		await page.locator('button', { hasText: '15s' }).click();

		const input = page.locator('input[aria-label="Typing test input"]');
		const words = await page.locator('.flex-wrap.gap-x-2 > span').allTextContents();

		await input.focus();
		await page.keyboard.type(
			words
				.slice(0, 3)
				.map((w) => w.trim())
				.join(' ') + ' '
		);

		// Wait for the 15-second timer to complete
		await page.waitForTimeout(16000);

		await expect(page.locator('text=results.json')).toBeVisible();
		const resultsPre = page.locator('pre');
		await expect(resultsPre).toContainText('wpm');
		await expect(resultsPre).toContainText('accuracy');
		await expect(resultsPre).toContainText('raw_wpm');
		await expect(resultsPre).toContainText('correct');
		await expect(resultsPre).toContainText('incorrect');
		await expect(resultsPre).toContainText('total');
		await expect(resultsPre).toContainText('duration');
		await expect(resultsPre).toContainText('keystrokes');
	});

	test('restart button resets the test', async ({ page }) => {
		await page.locator('button', { hasText: '15s' }).click();

		const input = page.locator('input[aria-label="Typing test input"]');
		const words = await page.locator('.flex-wrap.gap-x-2 > span').allTextContents();

		await input.focus();
		await page.keyboard.type(words[0].trim() + ' ');

		await page.waitForTimeout(16000);

		await expect(page.locator('text=results.json')).toBeVisible();

		await page.locator('button', { hasText: './restart' }).click();
		await expect(page.locator('text=results.json')).toHaveCount(0);
		await expect(input).toBeVisible();
	});

	test('cd ~ navigates to homepage', async ({ page }) => {
		await page.locator('button', { hasText: 'cd ~' }).click();
		await expect(page).toHaveURL('/');
	});

	test('accessibility scan passes', async ({ page }) => {
		await runA11yScan(page);
	});
});
