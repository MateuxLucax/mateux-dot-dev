# AGENTS.md — mateux.dev

Agent-facing instructions for working on this SvelteKit static blog.

---

## Project Overview

A personal terminal-themed website and blog built with **SvelteKit**, **Tailwind CSS**, and **Bun**. The entire site is statically generated and deployed as static HTML via `adapter-static`. The blog uses **MDsveX** to render `.svx` Markdown files with embedded Svelte components (notably Mermaid diagrams).

### Key URLs

- Site: `https://mateux.dev`
- Blog index: `/blog`
- Blog posts: `/blog/posts/{slug}`
- RSS feed: `/blog/rss.xml`

---

## Technology Stack

| Layer               | Tool                                         |
| ------------------- | -------------------------------------------- |
| Framework           | SvelteKit 2.x with Svelte 5 (runes)          |
| Language            | TypeScript                                   |
| Styling             | Tailwind CSS 4.x + `@tailwindcss/typography` |
| Runtime             | Bun                                          |
| Markdown            | MDsveX (`*.svx` files)                       |
| Diagrams            | Mermaid.js                                   |
| Syntax Highlighting | Shiki (catppuccin-mocha / catppuccin-latte)  |
| Adapter             | `@sveltejs/adapter-static` (static site)     |

---

## Directory Structure

```
src/
├── app.html                    # HTML template (has Google Analytics)
├── app.css                     # Tailwind entrypoint
├── app.d.ts                    # App-level types
├── lib/
│   ├── components/             # Reusable Svelte components
│   │   ├── Mermaid.svelte      # Mermaid diagram renderer
│   │   ├── Prompt.svelte       # Terminal prompt (mateux@tars)
│   │   ├── Row.svelte          # Terminal row wrapper
│   │   ├── TerminalHeader.svelte
│   │   ├── ActivityBar.svelte
│   │   ├── ForestBackground.svelte
│   │   ├── Cursor.svelte
│   │   ├── Image.svelte
│   │   ├── quotes.js           # Random quote array
│   │   └── commands/           # Terminal command components
│   ├── posts/                  # Blog post source files (*.svx)
│   ├── server/
│   │   └── posts.ts            # Build-time post loading + reading time
│   └── utils.ts                # formatDate, isDarkMode, calculateReadingTime, stripFrontmatter
└── routes/
    ├── +layout.svelte          # Root layout (terminal chrome)
    ├── +page.svelte            # Homepage
    ├── typetest/+page.svelte   # Typing speed test game
    └── blog/
        ├── +layout.svelte      # Blog layout
        ├── +page.svelte        # Blog listing
        ├── +page.server.ts     # Build-time post loading for listing
        ├── rss.xml/+server.ts  # RSS/Atom feed endpoint
        ├── api/
        │   ├── posts/+server.ts
        │   └── post/[slug]/+server.ts
        └── posts/
            ├── [slug]/
            │   ├── +page.svelte    # Post render page
            │   ├── +page.ts        # Post loader (dynamic import)
            │   ├── +page.server.ts # Prerender entries
            │   └── +layout.ts
            ├── +layout.ts
            └── type.ts             # Post TypeScript type
```

---

## Component & Coding Patterns

### Svelte 5 Runes (Mandatory)

- Use `$props()` for component props — **never** `export let`.
- Use `$state()` for local mutable state.
- Use `$derived()` for computed values.
- Always add `<script lang="ts">`.

### Terminal Theme

The entire UI should feel like a terminal:

- Font: `font-mono` everywhere.
- Prompt: `mateux@tars ~/Path>` rendered via `Prompt.svelte`.
- Rows: wrapped in `Row.svelte`.
- Semantic colors:
  - Links: `text-blue-500` / `dark:text-blue-300`
  - Paths: `text-yellow-500` / `dark:text-yellow-300`
  - Prompt user: `text-teal-600` / `dark:text-teal-300`
  - Prompt host: `text-blue-500` / `dark:text-blue-300`
  - Commands: `text-pink-400` / `dark:text-pink-300`
- Avoid rounded cards, shadows, or non-terminal UI outside the `prose` article section.

### Static Site Constraints

- This is **fully static**. No server at runtime.
- All dynamic data must be resolved at **build time**.
- Server endpoints (`+server.ts`) must export `prerender = true`.
- Page data loaders (`+page.server.ts`, `+page.ts`) can use `import()` for posts.
- Client-side `fetch()` to internal APIs is acceptable but discouraged when build-time loading is possible.

---

## Blog Post Authoring

### File Location

All posts live in `src/lib/posts/` as `.svx` files.

### Filename Convention

The filename (without `.svx`) must match the `slug` in frontmatter.

Example: `search-and-tokenize-portuguese-text-with-rslp.svx` → slug `search-and-tokenize-portuguese-text-with-rslp`.

### Frontmatter Schema

```yaml
---
title: 'Sentence-case title: capitalize first word and proper nouns only'
slug: 'kebab-case-slug-matching-filename'
date: 'YYYY-MM-DD'
tags: [kebab-case-tag, another-tag]
description: 'One to two sentences summarizing the post.'
---
```

**Rules:**

- `title`: Sentence case. Do NOT title-case every word.
- `slug`: Required. Must match filename.
- `date`: ISO format, quoted.
- `tags`: Kebab-case only (e.g., `ci-cd`, `grafana-k6`). No spaces.
- `description`: Required. Used for SEO meta tags and RSS.
- `categories`: **Not implemented.** Do not use.
- `readingTime`: **Auto-computed at build time.** Do not add manually.

### Embedded Components

Posts can embed Svelte components directly:

```svelte
<script>
	import Mermaid from '$lib/components/Mermaid.svelte';
</script>
```

Use `<Mermaid diagram={\`...\`} />` for diagrams.

### Code Blocks

- Use fenced code blocks with language tags.
- Ensure the language exists in `svelte.config.js` `langs` array.
- Supported: `javascript`, `typescript`, `java`, `python`, `bash`, `html`, `css`, `json`, `php`, `sql`, `yaml`, `markdown`, `svelte`, `kotlin`, `go`, `mermaid`, `dart`, `tsx`, `vue`, `dockerfile`.
- If you need a new language, add it to `svelte.config.js` and rebuild.

---

## Styling Rules

### Tailwind CSS

- Utility-first. No custom CSS files outside component `<style>` blocks.
- Dark mode uses `prefers-color-scheme: dark` via `dark:` prefixes.
- The `prose` class (from `@tailwindcss/typography`) styles article content.
- Custom prose variables are set in `+page.svelte` `<style>` for post pages.

### Syntax Highlighting Theme Switching

Light/dark Shiki themes toggle via CSS in `src/routes/+layout.svelte`:

- `.shiki-light` visible in light mode
- `.shiki-dark` visible in dark mode

Do not break this mechanism when adding new code block styles.

---

## SEO & Metadata

### Per Post (`+page.svelte`)

Each post page sets:

- `<title>`
- `<meta name="description">`
- `<link rel="canonical">`
- Open Graph (`og:type=article`, `og:title`, `og:description`, `og:url`)
- Twitter Cards (`twitter:card=summary`, `twitter:title`, `twitter:description`)
- JSON-LD structured data (`BlogPosting` schema)

### Blog Listing (`/blog`)

Sets basic Open Graph metadata for the listing page.

### RSS Feed (`/blog/rss.xml`)

Atom-format RSS with all posts. Keep `prerender = true`.

### Sitemap (`/sitemap.xml`)

Should list all static routes and blog posts. Keep `prerender = true`.

---

## Build & Quality Checks

### Required Commands (run before finishing)

```bash
bun run build    # Must pass without errors
bun run check    # Must pass
bun run format   # Must pass
```

### Known Issues to Ignore

- `src/routes/typetest/+page.svelte` has 3 pre-existing TypeScript type comparison errors. Do not try to fix them unless explicitly asked.

---

## Common Pitfalls

1. **Adding `categories` to posts or templates** — not implemented. Will cause runtime errors.
2. **Forgetting `prerender = true`** on new server endpoints — static adapter will fail.
3. **Using `export let`** instead of `$props()` — Svelte 5 runes are enforced.
4. **Title-casing post titles** — use sentence case only.
5. **Adding spaces in tags** — always kebab-case.
6. **Changing the `shiki-light` / `shiki-dark` CSS** in `+layout.svelte` — will break syntax theme switching.
7. **Using runtime Node APIs** (`fs`, `path`, `process`) in client code — static site has no Node runtime.

---

## Agent Checklist (Before Finishing)

- [ ] Changes are minimal and focused.
- [ ] `bun run build` succeeds.
- [ ] `bun run check` shows no new errors in blog-related files.
- [ ] `bun run format` passes.
- [ ] No secrets or credentials committed.
- [ ] No git mutations (commit/push) unless explicitly requested.
- [ ] `AGENTS.md` updated if any conventions changed.
