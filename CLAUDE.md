# playwright-ultimate

The ultimate scaffold for **Playwright test automation** and the **`.claude` knowledge** behind it. Every capability ships in two halves: working framework code, plus the Claude-side knowledge (skills, dashboards, research) that explains how to use and extend it.

## Map
| Path | Purpose |
|---|---|
| `src/tests/` | Playwright specs (TypeScript); config in `playwright.config.ts` |
| `.claude/dashboards/` | Research dashboards. Start with `ecosystem/` and read its `README.md` |
| `.claude/skills/` | Project skills (`one-shot-508`, `one-shot-utils` are empty stubs for now) |
| `.claude/contracts/` | One contract per capability/stage; frontmatter follows `.claude/templates/contracts.md` |
| `.claude/dashboards/the-ark/` | Contract graph; `data.js` is generated, never hand-edited |
| `.claude/tools/` | Repo scripts (`contracts.mjs` validates contracts and builds the-ark) |
| `.claude/okf/TODO/TODO.md` | Open work, the backlog for this scaffold |
| `.claude/analysis/` | Reserved, still empty |

## Commands
- `npx playwright test` runs all specs (chromium, firefox, webkit). `npx playwright show-report` opens the report.
- `node .claude/dashboards/ecosystem/refresh.mjs` refreshes the dashboard's GitHub and npm metrics.
- `npm run contracts` validates `.claude/contracts/*.md` and regenerates `the-ark/data.js`; `npm run contracts:check` validates only (exit 1 on errors).

## Contracts
- Lifecycle: ready-for-refinement → ready-for-testing → ready-for-playwright → ready-for-white-glove (each an `orchestrator` contract); everything else is a `capability` owned by one stage.
- A contract can only be `minted` once every `depends_on` entry is minted; minting freezes `provides`. Breaking a minted `provides` means a major version bump.
- Never add a `consumers` field; it is derived from `depends_on`.

## Conventions
- Native first: reach for Playwright fixtures, `request`, `route`, ARIA snapshots, and `toHaveScreenshot` before adding a dependency. The dashboard's "Build it yourself" sections hold the patterns.
- Research lives in data, not markup: update `dashboards/<name>/data.js`, never hand-edit numbers in HTML.
- HTML/UI output: vanilla HTML/CSS/JS. No cream or off-white backgrounds, no italic accent words in headlines, no numbered "01/02/03" section labels, no monospace labels, no pill-shaped buttons.
