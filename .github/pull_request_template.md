## Summary

<!-- One or two sentences describing the change -->

## Changes

<!-- Bullet points of what changed -->

## TDD Cycle

<!-- Confirm you followed the branch-based TDD workflow -->

- [ ] Created feature branch from `main`
- [ ] Wrote tests first (confirmed they fail / red)
- [ ] Implemented until tests pass (green)
- [ ] Ran full quality checks (see below)

## Test Coverage

<!-- What routes or behaviors are covered by new or updated tests? -->

## Quality Checks

```bash
bun run build    # static build must succeed
bun run check    # TypeScript + Svelte checks
bun run format   # Prettier formatting
bun run test:e2e # all tests must pass
```

- [ ] `bun run build` passes
- [ ] `bun run check` passes
- [ ] `bun run format` passes
- [ ] `bun run test:e2e` passes (or new tests added for changed routes)

## Screenshots / Evidence

<!-- If UI changed, attach before/after screenshots -->

## Checklist

- [ ] Changes are minimal and focused
- [ ] No secrets or credentials committed
- [ ] `AGENTS.md` updated if conventions changed
- [ ] CI will pass (`.github/workflows/test.yml`)
