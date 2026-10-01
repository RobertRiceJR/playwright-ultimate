# TODO

_Last triage: 2026-10-01_

## Next
- [ ] Fill the empty skill stubs from the dashboard research: `skills/one-shot-508` (axe fixture + ARIA snapshot + keyboard focus) and `skills/one-shot-utils` (env option fixtures, expect.poll, custom matchers)
- [ ] Add a `playwright-conventions` skill (template in the dashboard, AI and Claude Code section)
- [ ] Replace `src/tests/example.spec.ts` with a fixtures module (`test.extend`), set `baseURL`, and add an a11y smoke test
- [ ] Add npm scripts: `test`, `report`, `dashboard:refresh`
- [ ] Add `eslint-plugin-playwright` with `@typescript-eslint/no-floating-promises`

## Later
- [ ] Upgrade Node 22.14 to 22.22 or later (testcontainers v12 needs it; lighthouse v13 needs 22.19+)
- [ ] Run `npx playwright init-agents --loop=claude` (it overwrites `.mcp.json`, so run it before any `claude mcp add`)
- [ ] Pin `@playwright/test` to an exact version before adopting Docker visual baselines
- [ ] Decide what `.claude/analysis/` and `.claude/contracts/` hold
- [ ] New dashboard disciplines: security (ZAP), mobile and devices, CI/CD sharding, test data management

## Recurring
- [ ] Monthly: `node .claude/dashboards/ecosystem/refresh.mjs` and act on its warnings
- [ ] Quarterly: re-check the picks against new Playwright release notes

## Done
- [x] 2026-10-01: Ecosystem dashboard v1 (9 disciplines, 45 repos, 27 packages, 27 techniques), plus README and refresh script
