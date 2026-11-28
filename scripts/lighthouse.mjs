import { readdir, mkdir, writeFile } from 'node:fs/promises';
import lighthouse, { desktopConfig } from 'lighthouse';
import puppeteer from 'puppeteer-core';
import path from 'node:path';

const output = process.argv[2] ?? '/tmp/mateux-perf/final';
const runs = Number(process.env.LIGHTHOUSE_RUNS ?? 3);
if (runs !== 1 && runs !== 3) throw new Error('LIGHTHOUSE_RUNS must be 1 or 3');
const base = process.env.LIGHTHOUSE_BASE_URL ?? 'http://127.0.0.1:4173';
const urls = process.env.LIGHTHOUSE_URLS
	? JSON.parse(process.env.LIGHTHOUSE_URLS)
	: [
			'/',
			'/blog',
			...(await readdir('src/lib/posts'))
				.filter((f) => f.endsWith('.svx'))
				.map((f) => `/blog/posts/${f.slice(0, -4)}`),
			'/about',
			'/rss',
			'/lighthouse-missing-page'
		];
const categories = ['performance', 'accessibility', 'best-practices', 'seo'];
const metrics = [
	'first-contentful-paint',
	'largest-contentful-paint',
	'total-blocking-time',
	'cumulative-layout-shift'
];
const median = (values) => values.sort((a, b) => a - b)[Math.floor(values.length / 2)];
await mkdir(output, { recursive: true });
let failed = false;
let table =
	'| URL | Preset | Theme | Performance | Accessibility | Best practices | SEO | FCP ms | LCP ms | TBT ms | CLS |\n|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|\n';
for (const url of urls)
	for (const preset of ['mobile', 'desktop'])
		for (const theme of ['light', 'dark']) {
			const reports = [];
			for (let run = 1; run <= runs; run++) {
				const name = `${url === '/' ? 'home' : url.slice(1).replaceAll('/', '_')}-${preset}-${theme}-${run}.json`;
				const file = path.join(output, name);
				console.log(name);
				const browser = await puppeteer.launch({
					executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome',
					headless: true,
					args: ['--no-sandbox']
				});
				try {
					const page = await browser.newPage();
					await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: theme }]);
					const actual = await page.evaluate(
						() => matchMedia('(prefers-color-scheme: dark)').matches
					);
					if (actual !== (theme === 'dark')) throw new Error(`Failed to emulate ${theme}`);
					const result = await lighthouse(
						base + url,
						{
							logLevel: 'error',
							output: 'json',
							ignoreStatusCode: url === '/lighthouse-missing-page'
						},
						preset === 'desktop' ? desktopConfig : undefined,
						page
					);
					if (!result) throw new Error(`Lighthouse returned no result for ${name}`);
					if (
						(await page.evaluate(() => matchMedia('(prefers-color-scheme: dark)').matches)) !==
						actual
					)
						throw new Error(`Lighthouse changed the ${theme} emulation`);
					await writeFile(file, JSON.stringify(result.lhr));
					reports.push(result.lhr);
				} finally {
					await browser.close();
				}
			}
			const scores = categories.map((key) => median(reports.map((r) => r.categories[key].score)));
			const values = metrics.map((key) => median(reports.map((r) => r.audits[key].numericValue)));
			if (
				scores.some((score, i) => (url !== '/lighthouse-missing-page' || i < 2) && score !== 1) ||
				values[2] !== 0 ||
				values[3] !== 0
			)
				failed = true;
			table += `| ${url} | ${preset} | ${theme} | ${scores.join(' | ')} | ${values.map((n) => Number(n.toFixed(3))).join(' | ')} |\n`;
			await writeFile(path.join(output, 'summary.md'), table);
		}
if (process.argv.includes('--assert') && failed) process.exitCode = 1;
