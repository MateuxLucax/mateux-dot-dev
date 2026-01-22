# Project Rules

## Tech Stack
- **Framework**: SvelteKit
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Runtime**: Bun

## Coding Guidelines

### SvelteKit
- Use Svelte 5 runes syntax if applicable (check `package.json` version first, defaulting to standard if unsure, but assuming modern).
- Use `+page.svelte`, `+layout.svelte`, etc. for routing.
- Prefer `load` functions in `+page.server.ts` or `+page.ts` for data fetching.

### TypeScript
- Use strictly typed interfaces/types.
- Avoid `any` where possible.

### Styling
- Use Tailwind utility classes.
- Keep custom CSS in `app.css` or `index.css` only when utilities are insufficient.

## Artifacts
- Maintain `task.md` for tracking progress.
- Use `implementation_plan.md` for planning complex features.

## Blog Guidelines
### Tone and Voice
- **Personal & Authentic**: Write in the first person ("I").
- **Casual but Professional**: Sound like a knowledgeable peer, not a corporate entity.
- **Engagement**: Use Mermaid diagrams to illustrate complex concepts.
- **Format**: Use `.svx` (Mdsvex) for blog posts.
