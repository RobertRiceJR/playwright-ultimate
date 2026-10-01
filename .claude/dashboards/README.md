# .claude/dashboards

Self-contained HTML dashboards that hold this repo's research. Each one is a folder you can open straight from disk (`file://`): no build step, no server, vanilla HTML/CSS/JS.

| Dashboard | Open | What it answers |
|---|---|---|
| Playwright Ecosystem Guide | `ecosystem/index.html` | For each testing discipline: the top 5 GitHub repos, top 3 npm packages, and 3 build-it-yourself techniques |

Open it on Windows with `start .claude/dashboards/ecosystem/index.html`. Press `/` to search, and use `#a11y`, `#performance`, and similar URL fragments to deep-link a discipline.

## Ecosystem guide

### Files
| File | Role | Edit it? |
|---|---|---|
| `ecosystem/data.js` | The single source of truth: `window.ECOSYSTEM = { …strict JSON… }` | Yes. All content changes go here |
| `ecosystem/index.html` | Renderer: layout, search, theme, star waterfall | Only for UI changes |
| `ecosystem/refresh.mjs` | Re-pulls stars, last push, and weekly downloads into `data.js` | Rarely |

`data.js` is a script, not a `.json` file, because browsers block `fetch()` on `file://`. Keep everything after `=` valid JSON (double quotes, no trailing commas, no comments); `refresh.mjs` parses it with `JSON.parse`.

### Refresh the numbers
```bash
node .claude/dashboards/ecosystem/refresh.mjs            # rewrite data.js
node .claude/dashboards/ecosystem/refresh.mjs --dry-run  # report only
```
It uses `GITHUB_TOKEN`, then `gh auth token`, then anonymous access (60 requests per hour is enough for 45 repos). It updates `stars`, `pushed`, `weekly`, `asOf`, and `playwrightVersion`, re-sorts npm packages by downloads, and warns about archived, renamed, or stale (>365 days) repos. It never changes which tools are picked; that stays a human or Claude decision.

### Schema (per discipline in `categories[]`)
```jsonc
{
  "id": "a11y",                  // URL fragment, unique
  "name": "Accessibility (Section 508)", "short": "Accessibility (508)",  // heading / rail label
  "lede": "One or two sentences on what the discipline covers and the default approach.",
  "repos": [{ "repo": "owner/name", "stars": 0, "pushed": "YYYY-MM-DD", "desc": "", "why": "" }],  // exactly 5, curated order
  "npm":   [{ "name": "pkg", "weekly": 0, "why": "", "install": "npm i -D pkg" }],                  // exactly 3
  "diy":   [{ "title": "", "summary": "", "snippet": "code", "source": "https://docs" }],            // 3 techniques
  "learn": [{ "title": "", "url": "" }],
  "notes": "Paragraphs separated by a blank line (\n\n): selection logic, caveats, what to avoid."
}
```
`diy[0]` is shown on the overview as the technique to try first, so put the strongest one first. Snippet language is inferred: a snippet starting with `#`, `npx`, `npm`, or `claude` is shell, `{` is JSON, `---` is Markdown, and everything else is TypeScript.

### Selection rules (keep these when you edit)
1. **Repos:** relevant to a Playwright/TypeScript framework, pushed within 12 months, not archived. Relevance beats stars.
2. **npm:** what a Playwright user would actually install for that discipline, ranked by weekly downloads. Mostly-transitive packages (ajv in utils, uuid) get a mention in `notes`, not a slot.
3. **No duplicates across disciplines.** Each tool sits where it fits best and is cross-referenced in `notes`.
4. **Build it yourself:** native Playwright APIs only (plus at most one small dependency), and every API must exist in the installed version. Check with `grep` in `node_modules/playwright-core/types/types.d.ts` and `node_modules/playwright/types/test.d.ts` before adding a snippet.

### Add a discipline
Append an object to `categories` (the rail and overview update automatically), then run `refresh.mjs` to fill real numbers. Candidate disciplines are listed in `.claude/okf/TODO/TODO.md`.

### Provenance
v1 was researched on 2026-10-01 by five parallel research agents against @playwright/test 1.63.0. Every metric came from the GitHub and npm APIs (no estimates), and each 1.56–1.63 API claim was confirmed against the installed type definitions and CLI help. The Claude Code hook fields (`if`, `asyncRewake`) were confirmed against code.claude.com/docs/en/hooks.

## Conventions for any dashboard here
- One folder per dashboard, containing `index.html` and `data.js` (content separated from markup). Add a refresh script if the data goes stale.
- Design tokens are CSS custom properties on `:root`, with dark mode set by `prefers-color-scheme` and overridden by `[data-theme]`. Fonts: Archivo (display), Atkinson Hyperlegible Next and Mono (body, code). Offline, the page falls back to system fonts.
- Follow the repo's UI guardrails in `CLAUDE.md`: no cream backgrounds, italic accent words, 01/02/03 labels, monospace labels, or pill buttons.
- Quality floor: keyboard focus visible, `prefers-reduced-motion` respected, no horizontal scroll at 390px wide. To verify, screenshot with Playwright at 1440px and 390px and check that `document.documentElement.scrollWidth === innerWidth`.
