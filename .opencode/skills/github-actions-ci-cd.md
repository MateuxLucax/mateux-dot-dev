# GitHub Actions CI/CD Skill

## Workflow Design Patterns

### Gate Production Builds on Tests
Never push production artifacts without passing tests first. Use `workflow_run` triggers:

```yaml
# .github/workflows/build.yml
on:
  workflow_run:
    workflows: ['Test']
    types: [completed]
    branches: [main]

jobs:
  build-and-push:
    if: github.event_name == 'workflow_dispatch' || github.event.workflow_run.conclusion == 'success'
```

**Why**: This prevents broken builds from reaching the registry. The `workflow_dispatch` fallback allows manual builds for hotfixes.

### Separate Jobs for Build and Test
Split CI into logical stages with explicit dependencies:

```yaml
jobs:
  check-and-build:
    # Runs first: lint, type-check, build
    steps:
      - run: bun run check
      - run: bun run build
      - uses: actions/upload-artifact@v4
        with:
          name: build
          path: build/
          retention-days: 1

  e2e-bun:
    needs: check-and-build
    # Downloads artifact, runs tests against preview

  e2e-docker:
    needs: check-and-build
    # Builds Docker image, runs tests against container
```

**Key rules**:
- `needs` ensures sequential execution
- Artifacts with `retention-days: 1` keep storage low
- Download artifacts in downstream jobs instead of rebuilding

### Parallel Test Environments
Test against both the dev build and production artifact simultaneously:

| Job | Purpose | URL |
|-----|---------|-----|
| `e2e-bun` | Tests dev build | `http://localhost:4173` |
| `e2e-docker` | Tests production nginx | `http://localhost:8080` |

Use `PLAYWRIGHT_BASE_URL` env var to switch targets without duplicating tests.

### Docker Testing in CI
Always test the exact Docker artifact before pushing:

```yaml
- name: Build and start Docker container
  run: |
    docker compose -f docker-compose.test.yml up -d --build site
    for i in {1..30}; do
      if curl -sf http://localhost:8080/ > /dev/null 2>&1; then
        echo "Docker site is up!"
        exit 0
      fi
      sleep 1
    done
    echo "Docker site failed to start"
    docker compose -f docker-compose.test.yml logs site
    exit 1

- name: Run Playwright tests against Docker
  run: PLAYWRIGHT_BASE_URL=http://localhost:8080 bunx playwright test

- name: Cleanup Docker
  if: always()
  run: docker compose -f docker-compose.test.yml down
```

**Critical**: Always `docker compose down` in `if: always()` to prevent orphaned containers.

### Playwright in CI
Install browsers with system dependencies:

```yaml
- name: Install Playwright browsers
  run: bunx playwright install --with-deps chromium
```

Upload reports on failure only:

```yaml
- name: Upload Playwright report
  uses: actions/upload-artifact@v4
  if: failure()
  with:
    name: playwright-report-bun
    path: playwright-report/
    retention-days: 7
```

### Bun in GitHub Actions
Use the official setup action:

```yaml
- name: Setup Bun
  uses: oven-sh/setup-bun@v2
  with:
    bun-version: latest
```

Always use `--frozen-lockfile` for reproducible installs:

```yaml
- run: bun install --frozen-lockfile
```

## Common Pitfalls

| Issue | Solution |
|-------|----------|
| Orphaned containers | `docker compose down` in `if: always()` |
| Preview server not ready | Wait loop with `curl` before tests |
| Nginx 301 redirects | Use `try_files $uri $uri/index.html $uri.html =404` |
| Playwright timeouts in CI | Use `retries: 2` and longer timeouts for Mermaid |
| Artifact bloat | `retention-days: 1` for build artifacts, `7` for reports |
| Missing build output | Upload artifact after `bun run build`, download in test jobs |

## PR Template Integration

Require quality check confirmations:

```markdown
## Quality Checks

- [ ] `bun run build` passes
- [ ] `bun run check` passes
- [ ] `bun run format` passes
- [ ] `bun run test:e2e` passes
```

## TDD Workflow in CI

The ideal CI cycle:
1. **Branch created** → `test.yml` runs on push
2. **Tests fail** (red) → PR blocked
3. **Implementation** → push commits
4. **Tests pass** (green) → PR approved
5. **Merge to main** → `test.yml` runs again
6. **Tests pass on main** → `build.yml` triggers automatically
7. **Docker image pushed** to registry
