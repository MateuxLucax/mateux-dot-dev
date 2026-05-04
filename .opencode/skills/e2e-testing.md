# E2E Testing for mateux.dev

## Commands

- `bun run test:e2e` — Run Playwright against local `vite preview`
- `bun run test:e2e:ui` — Debug with Playwright UI
- `bash scripts/run-docker-tests.sh` — Test production Docker artifact

## Patterns

- Load post metadata from `src/lib/posts/*.svx` via `tests/utils/posts.ts` (zero-dependency parser)
- Mermaid wait: `expect(locator).toBeVisible({ timeout: 15000 })`
- Accessibility scan after every page load using `@axe-core/playwright`
- Performance thresholds: FCP < 1.8s, TTFB < 600ms

## Test Coverage

- Homepage: latest 3 posts, terminal commands, contact links
- Blog listing: all posts, RSS link
- Blog posts: parameterized over all posts; SEO tags, Mermaid SVGs, Shiki themes
- TypeTest: timer, word colors, results JSON
- RSS & Sitemap: valid XML with all entries
- Theme: light/dark Shiki visibility, terminal colors
- Performance: Web Vitals via Performance API
