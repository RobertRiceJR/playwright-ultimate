// Single source of truth for the Playwright Ecosystem Guide (index.html).
// Edit content freely; keep it strict JSON after the "=" so refresh.mjs can parse it.
// Live numbers (stars, pushed, weekly, asOf) are rewritten by refresh.mjs.
window.ECOSYSTEM = {
  "title": "Playwright Ecosystem Guide",
  "asOf": "2026-10-01",
  "playwrightVersion": "1.63",
  "summary": "Nine testing disciplines, each with five vetted GitHub repositories, the three npm packages worth installing, and three techniques you can build with native Playwright. Every repository was checked for recent activity, and every Playwright API shown exists in 1.63.",
  "method": {
    "rules": [
      "Repositories: relevant to a Playwright/TypeScript framework, pushed within the last 12 months, not archived. Relevance outranks raw stars, so a tool nobody else replaces (for example eslint-plugin-playwright) can beat a bigger generic one.",
      "npm packages: the supporting packages a Playwright user would actually install for that discipline, ranked by last-week downloads. Packages that are mostly transitive dependencies are noted, not ranked.",
      "No duplicates across disciplines: each tool appears where it fits best, with cross-references in the field notes.",
      "Build it yourself: native Playwright APIs or a few lines of in-house code, checked against the installed @playwright/test type definitions and the official docs.",
      "Metrics: stars and last push from the GitHub API; downloads from api.npmjs.org for the last full week. Re-run refresh.mjs to update them; curated picks never change automatically."
    ]
  },
  "categories": [
    {
      "id": "a11y",
      "name": "Accessibility (Section 508)",
      "short": "Accessibility (508)",
      "lede": "Section 508 incorporates WCAG 2.0 Level A and AA, so the automatable gate is axe with the wcag2a and wcag2aa tags. Rule engines catch about half of real issues; ARIA snapshots, keyboard tests, and screen-reader passes cover the rest.",
      "repos": [
        {
          "repo": "dequelabs/axe-core",
          "stars": 7582,
          "pushed": "2026-09-30",
          "desc": "Accessibility engine for automated web UI testing",
          "why": "The rule engine behind @axe-core/playwright, pa11y, and Lighthouse. Its tags (wcag2a, wcag2aa, wcag22aa, TTv5, EN-301-549) are how you scope a 508 or WCAG gate."
        },
        {
          "repo": "pa11y/pa11y",
          "stars": 4565,
          "pushed": "2026-09-28",
          "desc": "Automated accessibility testing (axe and HTML_CodeSniffer runners)",
          "why": "A good companion for URL-list or sitemap sweeps in CI via pa11y-ci. It drives Puppeteer, so run it alongside your suite rather than inside it."
        },
        {
          "repo": "IBMa/equal-access",
          "stars": 779,
          "pushed": "2026-09-28",
          "desc": "IBM Equal Access Accessibility Checker",
          "why": "A second, independent rule engine whose getCompliance() accepts a Playwright page. Its rules map to WCAG 2.x and Section 508, useful for cross-checking axe on federal work."
        },
        {
          "repo": "dequelabs/axe-core-npm",
          "stars": 726,
          "pushed": "2026-10-01",
          "desc": "Official axe integrations, including @axe-core/playwright",
          "why": "Home of AxeBuilder, the integration the Playwright docs recommend. It releases on the same cadence as axe-core."
        },
        {
          "repo": "guidepup/guidepup",
          "stars": 568,
          "pushed": "2026-10-01",
          "desc": "Screen reader automation (real VoiceOver and NVDA) with @guidepup/playwright",
          "why": "Covers what rule engines cannot: it asserts what a real screen reader announces, inside @playwright/test."
        }
      ],
      "npm": [
        {
          "name": "axe-core",
          "weekly": 84753450,
          "why": "The engine itself. Install it directly to pin the rules version or inject it with page.addScriptTag; most downloads are transitive.",
          "install": "npm i -D axe-core"
        },
        {
          "name": "@axe-core/playwright",
          "weekly": 13507914,
          "why": "Deque's official AxeBuilder for Playwright (withTags, include, exclude, disableRules, analyze). The default choice.",
          "install": "npm i -D @axe-core/playwright"
        },
        {
          "name": "axe-playwright",
          "weekly": 742393,
          "why": "Community checkA11y() and injectAxe() helpers with HTML and JUnit reporters. Last release was September 2025, so prefer @axe-core/playwright for new work.",
          "install": "npm i -D axe-playwright"
        }
      ],
      "diy": [
        {
          "title": "Axe fixture scoped to WCAG A/AA, results attached to the report",
          "summary": "Extend test with an a11y() fixture that runs AxeBuilder with the WCAG 2.0 A/AA tags (the Section 508 baseline) plus 2.1 and 2.2 AA. It attaches the full violation JSON to the HTML report and fails with a readable list of rule IDs.",
          "snippet": "import { test as base, expect } from '@playwright/test';\nimport AxeBuilder from '@axe-core/playwright';\nconst TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];\n\nexport const test = base.extend<{ a11y: () => Promise<void> }>({\n  a11y: async ({ page }, use, testInfo) => {\n    await use(async () => {\n      const r = await new AxeBuilder({ page }).withTags(TAGS).analyze();\n      await testInfo.attach('axe-violations', { body: JSON.stringify(r.violations, null, 2), contentType: 'application/json' });\n      expect(r.violations.map(v => `${v.id}: ${v.nodes.length} node(s)`)).toEqual([]);\n    });\n  },\n});",
          "source": "https://playwright.dev/docs/accessibility-testing#using-a-test-fixture-for-common-axe-configuration"
        },
        {
          "title": "ARIA snapshots and role-first locators as a structural contract",
          "summary": "toMatchAriaSnapshot asserts the accessibility tree: roles, accessible names, and states such as [expanded]. With getByRole and toHaveAccessibleName it catches unlabeled controls and broken semantics that pixel or DOM tests miss. Keep larger trees in .aria.yml files and refresh them with -u.",
          "snippet": "import { test, expect } from '@playwright/test';\n\ntest('main nav exposes a stable accessible structure', async ({ page }) => {\n  await page.goto('/');\n  const nav = page.getByRole('navigation', { name: 'Main' });\n  await expect(nav).toMatchAriaSnapshot(`\n    - navigation \"Main\":\n      - link \"Home\"\n      - link \"Pricing\"\n      - button \"Account\" [expanded=false]\n  `);\n  await expect(page.getByRole('searchbox')).toHaveAccessibleName('Search products');\n});",
          "source": "https://playwright.dev/docs/aria-snapshots"
        },
        {
          "title": "Keyboard-only focus order under forced colors and reduced motion",
          "summary": "Walk the page with Tab and assert toBeFocused() on each expected stop (WCAG 2.1.1, 2.4.3, 2.4.7) while emulating Windows High Contrast and prefers-reduced-motion. Run it on Chromium or Firefox, because WebKit on macOS skips links by default.",
          "snippet": "import { test, expect } from '@playwright/test';\ntest.use({ forcedColors: 'active', reducedMotion: 'reduce' });\n\ntest('checkout is keyboard-operable in a logical order', async ({ page }) => {\n  await page.goto('/checkout');\n  const order = [page.getByRole('link', { name: 'Skip to main content' }),\n    page.getByLabel('Email'), page.getByRole('button', { name: 'Pay now' })];\n  for (const el of order) {\n    await page.keyboard.press('Tab');\n    await expect(el).toBeFocused();\n  }\n});",
          "source": "https://playwright.dev/docs/api/class-testoptions#test-options-forced-colors"
        }
      ],
      "learn": [
        {
          "title": "Section508.gov: Test for accessibility (ICT Testing Baseline, Trusted Tester v5)",
          "url": "https://www.section508.gov/test/"
        },
        {
          "title": "W3C: How to Meet WCAG 2.2 quick reference (filter by level and version)",
          "url": "https://www.w3.org/WAI/WCAG22/quickref/"
        },
        {
          "title": "Playwright docs: Accessibility testing",
          "url": "https://playwright.dev/docs/accessibility-testing"
        }
      ],
      "notes": "Section 508 to WCAG: the 2017 Revised 508 Standards incorporate WCAG 2.0 Level A and AA by reference, for web content and, through WCAG2ICT, for documents and software. 508 also adds non-WCAG requirements for hardware, software interoperability with assistive technology, and support docs. Moving 508 to WCAG 2.1 or 2.2 needs new Access Board rulemaking, which was not final as of October 2026.\n\nGotcha: axe's 'section508' tag maps to the old pre-2017 rules. Do not use it as your 508 gate. Use wcag2a and wcag2aa, or TTv5 for DHS Trusted Tester alignment.\n\nOther regimes: WCAG 2.1 AA is the DOJ ADA Title II standard (deadlines moved to April 2027 and April 2028). WCAG 2.2 AA and EN 301 549 apply under the European Accessibility Act, enforced since June 2025.\n\nAutomation covers only part of WCAG: Deque's own estimate is about 57% of issues by volume. Keep manual Trusted Tester and screen-reader passes. axe scans only what is rendered, so open menus and modals before analyze().\n\nPlaywright native timeline: toHaveAccessibleName and toHaveRole (1.44), toMatchAriaSnapshot (1.49), .aria.yml files (1.50), page.accessibility removed (1.57), page-level ARIA snapshots (1.60), ariaSnapshotJSON() and the Display Aria trace view (1.63).\n\nAvoid: dequelabs/axe-cli (use @axe-core/cli), axe-html-reporter (no publish since September 2024). axe-playwright was last pushed September 2025, so treat it as a maintenance risk. Also worth knowing: Lighthouse's a11y category (a Chromium-only subset of axe) and Accessibility Insights for assisted manual assessment."
    },
    {
      "id": "performance",
      "name": "Performance testing",
      "short": "Performance",
      "lede": "Two different jobs: load testing generates traffic at the protocol level, and front-end performance measures what one real browser experiences. Playwright handles the second natively; use k6, Artillery, or autocannon for the first.",
      "repos": [
        {
          "repo": "grafana/k6",
          "stars": 31738,
          "pushed": "2026-10-01",
          "desc": "Load-testing tool: Go engine, JS/TS test scripts",
          "why": "Protocol-level load at scale, plus the built-in k6/browser module (a Playwright-like API that reports Core Web Vitals) for hybrid load and real-browser checks in one script."
        },
        {
          "repo": "GoogleChrome/lighthouse",
          "stars": 30843,
          "pushed": "2026-09-30",
          "desc": "Automated auditing and lab performance metrics",
          "why": "Point it at a Playwright-launched Chromium (remote debugging port) to score and gate LCP, TBT, and CLS in CI."
        },
        {
          "repo": "artilleryio/artillery",
          "stars": 9086,
          "pushed": "2026-09-23",
          "desc": "Load-testing platform with a built-in Playwright engine",
          "why": "The only mainstream load tool that runs real Playwright code as virtual users, reporting Web Vitals per page. It distributes on AWS Fargate, Lambda, and Azure ACI."
        },
        {
          "repo": "GoogleChrome/web-vitals",
          "stars": 8632,
          "pushed": "2026-10-01",
          "desc": "Official library for LCP, INP, CLS, FCP, and TTFB",
          "why": "Inject it into the page under test for metric definitions that match Chrome field data. v6 adds soft-navigation (SPA route change) support."
        },
        {
          "repo": "mcollina/autocannon",
          "stars": 8527,
          "pushed": "2026-05-16",
          "desc": "Fast HTTP/1.1 benchmarking tool written in Node.js",
          "why": "Load-test the APIs your Playwright suite exercises without leaving the Node and TypeScript toolchain."
        }
      ],
      "npm": [
        {
          "name": "web-vitals",
          "weekly": 53157764,
          "why": "Field-accurate Core Web Vitals collection inside pages under test. Most downloads come from production apps, not test suites.",
          "install": "npm i -D web-vitals"
        },
        {
          "name": "lighthouse",
          "weekly": 5660816,
          "why": "Programmatic Lighthouse audits against the Chromium Playwright launches. v13 is ESM-only and needs Node 22.19 or later.",
          "install": "npm i -D lighthouse"
        },
        {
          "name": "artillery",
          "weekly": 303517,
          "why": "The Playwright engine is bundled (do not install artillery-engine-playwright separately), so you can reuse page-object code for browser-level load.",
          "install": "npm i -D artillery"
        }
      ],
      "diy": [
        {
          "title": "Navigation and Resource Timing budgets",
          "summary": "Read the browser's own Navigation Timing and Resource Timing entries with page.evaluate, attach them to the report, and enforce soft budgets so a slow page flags the run without hiding other failures. Works in Chromium, Firefox, and WebKit.",
          "snippet": "test('home page timing budget', async ({ page }, testInfo) => {\n  await page.goto('/');\n  const nav = await page.evaluate(() =>\n    (performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming).toJSON());\n  const slowest = await page.evaluate(() => performance.getEntriesByType('resource')\n    .map(r => ({ name: r.name, ms: Math.round(r.duration) })).sort((a, b) => b.ms - a.ms).slice(0, 5));\n  await testInfo.attach('timing.json', { body: JSON.stringify({ nav, slowest }, null, 2), contentType: 'application/json' });\n  expect.soft(nav.responseStart, 'TTFB ms').toBeLessThan(800);\n  expect.soft(nav.domContentLoadedEventEnd, 'DCL ms').toBeLessThan(2500);\n  expect.soft(nav.loadEventEnd, 'load ms').toBeLessThan(4000);\n});",
          "source": "https://playwright.dev/docs/api/class-page#page-evaluate"
        },
        {
          "title": "LCP and CLS with PerformanceObserver in an init script",
          "summary": "Register PerformanceObservers before any page script runs (addInitScript with buffered: true), then read the values after load and assert Core Web Vitals budgets. layout-shift is Chromium-only, so gate CLS checks to the chromium project.",
          "snippet": "await page.addInitScript(() => {\n  const v = ((window as any).__vitals = { lcp: 0, cls: 0 });\n  new PerformanceObserver(l => l.getEntries().forEach(e => (v.lcp = e.startTime)))\n    .observe({ type: 'largest-contentful-paint', buffered: true });\n  new PerformanceObserver(l => l.getEntries().forEach((e: any) => { if (!e.hadRecentInput) v.cls += e.value; }))\n    .observe({ type: 'layout-shift', buffered: true });\n});\nawait page.goto('/');\nawait page.waitForLoadState('load');\nconst { lcp, cls } = await page.evaluate(() => (window as any).__vitals);\nexpect.soft(lcp, 'LCP ms').toBeLessThan(2500);\nexpect.soft(cls, 'CLS').toBeLessThan(0.1);",
          "source": "https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver"
        },
        {
          "title": "CDP session: CPU throttling and engine metrics",
          "summary": "Open a Chrome DevTools Protocol session to emulate a slow device and read engine counters (ScriptDuration, LayoutDuration, JSHeapUsedSize). For full flame charts, use browser.startTracing and open the JSON in DevTools.",
          "snippet": "test('dashboard under 4x CPU throttling', async ({ page, browserName }) => {\n  test.skip(browserName !== 'chromium', 'CDP is Chromium-only');\n  const cdp = await page.context().newCDPSession(page);\n  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });\n  await cdp.send('Performance.enable');\n  await page.goto('/dashboard');\n  const { metrics } = await cdp.send('Performance.getMetrics');\n  const m = Object.fromEntries(metrics.map(x => [x.name, x.value]));\n  expect.soft(m.ScriptDuration, 'JS exec seconds').toBeLessThan(1.5);\n  expect.soft(m.JSHeapUsedSize, 'heap bytes').toBeLessThan(60e6);\n});",
          "source": "https://playwright.dev/docs/api/class-cdpsession"
        }
      ],
      "learn": [
        {
          "title": "web.dev: Web Vitals (metric definitions and thresholds)",
          "url": "https://web.dev/articles/vitals"
        },
        {
          "title": "Grafana k6 docs: Using k6 browser (hybrid load and browser testing)",
          "url": "https://grafana.com/docs/k6/latest/using-k6-browser/"
        }
      ],
      "notes": "Playwright is not a load-testing tool. Each browser virtual user costs about a CPU core and hundreds of MB of RAM, so generate volume with protocol-level tools and add only a handful of browser users for UX metrics (the hybrid model).\n\nLab numbers in CI are noisy. Pin runner hardware, repeat runs and compare medians, apply CPU throttling, and prefer expect.soft budgets plus trend tracking over hard gates. CDP calls, tracing, and the layout-shift API are Chromium-only.\n\nk6 is a Go binary, not an npm package: the npm 'k6' package is an empty stub. Install with winget, brew, or Docker and add @types/k6 for typings. k6 v2 moved the browser module into core (k6/browser) and has a built-in web dashboard (K6_WEB_DASHBOARD=true).\n\nFID no longer exists, so budget INP instead, and INP needs a real interaction. Native helpers worth knowing: tracing.startHar/stopHar (1.60) and APIResponse.timing() (1.62) for API latency.\n\nAvoid: playwright-lighthouse (last release January 2024; call lighthouse directly with port 9222), artillery-engine-playwright as a separate install, and benchmark.js (archived; use tinybench). CDP Network.emulateNetworkConditions is deprecated, so prefer CPU throttling or route-level delays.\n\nAlso worth knowing: Lighthouse CI (@lhci/cli) and sitespeed.io for CI perf monitoring, and grafana/k6-studio to record a browser session as a k6 script."
    },
    {
      "id": "frontend",
      "name": "Front-end testing",
      "short": "Front end",
      "lede": "End-to-end, component, and BDD testing in real browsers. Playwright is the core; Storybook and Vitest Browser Mode cover fast component feedback, and playwright-bdd adds Gherkin without leaving the runner.",
      "repos": [
        {
          "repo": "microsoft/playwright",
          "stars": 96951,
          "pushed": "2026-10-01",
          "desc": "Cross-browser end-to-end framework and test runner",
          "why": "The core: runner, auto-waiting locators, traces, built-in mount() component testing (1.62+), test agents, and the bundled MCP server and CLI."
        },
        {
          "repo": "storybookjs/storybook",
          "stars": 91188,
          "pushed": "2026-10-01",
          "desc": "UI component workshop with interaction, a11y, and visual testing",
          "why": "Storybook 10's Vitest addon runs every story as a test in a real Playwright-driven browser, so stories double as component fixtures."
        },
        {
          "repo": "vitest-dev/vitest",
          "stars": 17177,
          "pushed": "2026-10-01",
          "desc": "Vite-native test runner with Browser Mode",
          "why": "Browser Mode with the Playwright provider is the main option for fast component tests that sit alongside Playwright E2E."
        },
        {
          "repo": "mxschmitt/awesome-playwright",
          "stars": 1585,
          "pushed": "2026-09-20",
          "desc": "Curated list of Playwright tools and projects",
          "why": "Maintained by a Playwright core contributor; the quickest way to find vetted reporters, plugins, and integrations."
        },
        {
          "repo": "vitalets/playwright-bdd",
          "stars": 794,
          "pushed": "2026-09-30",
          "desc": "BDD (Gherkin) tests on the Playwright runner",
          "why": "Compiles .feature files into native Playwright tests, so you keep fixtures, sharding, traces, and the HTML report."
        }
      ],
      "npm": [
        {
          "name": "@vitest/browser-playwright",
          "weekly": 10237233,
          "why": "The Vitest Browser Mode provider that drives real browsers through Playwright for component and unit tests.",
          "install": "npm i -D vitest @vitest/browser-playwright"
        },
        {
          "name": "@storybook/addon-vitest",
          "weekly": 6350693,
          "why": "Runs every Storybook story as a Vitest browser test via Playwright. Replaces the archived @storybook/test-runner.",
          "install": "npx storybook add @storybook/addon-vitest"
        },
        {
          "name": "playwright-bdd",
          "weekly": 799550,
          "why": "A Gherkin layer that generates native Playwright tests, supporting the latest Playwright and the ten releases before it.",
          "install": "npm i -D playwright-bdd"
        }
      ],
      "diy": [
        {
          "title": "Fixture-based page objects with test.extend",
          "summary": "Wrap page objects in custom fixtures so tests declare what they need. Playwright handles setup and teardown and builds only the fixtures a test actually uses.",
          "snippet": "import { test as base, expect, type Page } from '@playwright/test';\n\nclass TodoPage {\n  constructor(readonly page: Page) {}\n  async add(text: string) {\n    const box = this.page.getByPlaceholder('What needs to be done?');\n    await box.fill(text);\n    await box.press('Enter');\n  }\n}\nexport const test = base.extend<{ todoPage: TodoPage }>({\n  todoPage: async ({ page }, use) => { await page.goto('/todomvc'); await use(new TodoPage(page)); },\n});\n\ntest('adds a todo', async ({ todoPage }) => {\n  await todoPage.add('Buy milk');\n  await expect(todoPage.page.getByTestId('todo-title')).toHaveText(['Buy milk']);\n});",
          "source": "https://playwright.dev/docs/test-fixtures#creating-a-fixture"
        },
        {
          "title": "Log in once: setup project and storageState",
          "summary": "Authenticate in a setup project, save cookies, localStorage, and IndexedDB to a file, and make every browser project depend on it so tests start signed in.",
          "snippet": "// tests/auth.setup.ts\nimport { test as setup } from '@playwright/test';\nsetup('authenticate', async ({ page }) => {\n  await page.goto('/login');\n  await page.getByLabel('Email').fill(process.env.E2E_USER!);\n  await page.getByLabel('Password').fill(process.env.E2E_PASS!);\n  await page.getByRole('button', { name: 'Sign in' }).click();\n  await page.waitForURL('**/dashboard');\n  await page.context().storageState({ path: 'playwright/.auth/user.json' });\n});\n// playwright.config.ts → projects:\n// { name: 'setup', testMatch: /.*\\.setup\\.ts/ },\n// { name: 'chromium', use: { storageState: 'playwright/.auth/user.json' }, dependencies: ['setup'] }",
          "source": "https://playwright.dev/docs/auth"
        },
        {
          "title": "Role locators, web-first assertions, and ARIA snapshots",
          "summary": "Locate by accessible role and name, which survives markup churn, and use auto-retrying expect matchers. toMatchAriaSnapshot asserts a whole region's accessibility tree in one readable YAML template.",
          "snippet": "import { test, expect } from '@playwright/test';\n\ntest('pricing page', async ({ page }) => {\n  await page.goto('/');\n  await page.getByRole('link', { name: 'Pricing' }).click();\n  await expect(page).toHaveURL(/\\/pricing/);\n  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Pricing');\n  await expect(page.getByRole('main')).toMatchAriaSnapshot(`\n    - heading \"Pricing\" [level=1]\n    - button \"Start free trial\"\n  `);\n});",
          "source": "https://playwright.dev/docs/aria-snapshots"
        }
      ],
      "learn": [
        {
          "title": "Playwright docs: Best practices",
          "url": "https://playwright.dev/docs/best-practices"
        },
        {
          "title": "Playwright docs: Component testing with stories and galleries (1.62+)",
          "url": "https://playwright.dev/docs/test-components"
        }
      ],
      "notes": "Selection: the three highest-download packages that add something Playwright lacks natively (a Vitest component runner, Storybook story tests, a BDD layer). @axe-core/playwright lives under Accessibility. @testing-library/* is left out because Playwright's getByRole and getByLabel already cover it, and playwright-testing-library is archived.\n\nBig change in component testing: 1.62 added a built-in mount('story/id') fixture to plain @playwright/test, served by your own dev server and framework-agnostic (npx playwright init-skills ships a skill to scaffold it). The @playwright/experimental-ct-* packages stopped at 1.62.1 and cannot be aligned with ^1.63, so migrate using the docs guide.\n\nWorth adopting from 1.50–1.63: locator.visible() replaces :visible (1.63); test locks { lock: 'name' } for shared resources (1.63); retryStrategy: 'isolated' (1.62); the AbortSignal option on actions (1.62); page.localStorage and passkeys via context.credentials (1.61); locator.drop() (1.60); failOnFlakyTests (1.52); --only-changed and page.clock (1.45–1.46).\n\nPlatform: Playwright uses Chrome for Testing builds since 1.57, Node 18 is deprecated, and Ubuntu 20.04 and Debian 11 are dropped.\n\nAvoid: lost-pixel (archived 2026), playwright-testing-library (archived), storybookjs/test-runner (archived; use the Vitest addon), experimental-ct-* (frozen). cypress-io/cypress is a competitor, not a complement. Install the microsoft/playwright-vscode extension for the IDE."
    },
    {
      "id": "backend",
      "name": "Back-end and API testing",
      "short": "Back end / API",
      "lede": "REST and GraphQL tests, response contracts, and network mocking. Playwright's request fixture and route API cover most of it natively; add schema validation, shared mock handlers, and consumer-driven contracts where they earn their place.",
      "repos": [
        {
          "repo": "mswjs/msw",
          "stars": 18243,
          "pushed": "2026-09-30",
          "desc": "Industry-standard API mocking for REST, GraphQL, and WebSocket",
          "why": "Share one set of handlers across Vitest, Storybook, and Playwright; the official @msw/playwright binding routes page traffic through them."
        },
        {
          "repo": "ajv-validator/ajv",
          "stars": 14844,
          "pushed": "2026-09-06",
          "desc": "The fastest JSON Schema validator",
          "why": "Validates responses directly against JSON Schema or OpenAPI component schemas when the spec, not TypeScript code, is the source of truth."
        },
        {
          "repo": "stoplightio/prism",
          "stars": 5046,
          "pushed": "2026-10-01",
          "desc": "OpenAPI mock server and validation proxy",
          "why": "Run it as a Playwright webServer to mock a backend that isn't built yet, or proxy real traffic and flag contract violations."
        },
        {
          "repo": "schemathesis/schemathesis",
          "stars": 3643,
          "pushed": "2026-10-01",
          "desc": "Property-based API testing from OpenAPI and GraphQL schemas",
          "why": "A language-agnostic CLI that fuzzes every endpoint from the spec to find crashes and contract drift that hand-written tests miss. Run it next to your suite."
        },
        {
          "repo": "pact-foundation/pact-js",
          "stars": 1817,
          "pushed": "2026-10-01",
          "desc": "Consumer-driven contract testing for HTTP and messages",
          "why": "Catches consumer and provider drift without full E2E environments; PactFlow's bi-directional mode can turn Playwright route mocks into contracts."
        }
      ],
      "npm": [
        {
          "name": "ajv",
          "weekly": 450082343,
          "why": "JSON Schema and OpenAPI response validation. Choose zod instead (see Utilities) when schemas are defined in TypeScript; don't install both.",
          "install": "npm i -D ajv ajv-formats"
        },
        {
          "name": "msw",
          "weekly": 25212440,
          "why": "Reusable REST, GraphQL, and WebSocket mock handlers. Pair with @msw/playwright for a network fixture in Playwright.",
          "install": "npm i -D msw @msw/playwright"
        },
        {
          "name": "@pact-foundation/pact",
          "weekly": 735661,
          "why": "Contract testing (PactV4), the one capability Playwright's request and route APIs cannot replicate.",
          "install": "npm i -D @pact-foundation/pact"
        }
      ],
      "diy": [
        {
          "title": "API tests with the request fixture",
          "summary": "The built-in request fixture honors baseURL and extraHTTPHeaders from config or test.use and needs no browser. Since 1.63, request methods accept a type argument for typed json().",
          "snippet": "import { test, expect } from '@playwright/test';\ntype User = { id: number; email: string };\ntest.use({ baseURL: process.env.API_URL, extraHTTPHeaders: { Authorization: `Bearer ${process.env.API_TOKEN}` } });\n\ntest('create then read a user', async ({ request }) => {\n  const created = await request.post('/api/users', { data: { email: 'qa@example.com' } });\n  await expect(created).toBeOK();\n  const { id } = await created.json();\n  const res = await request.get<User>(`/api/users/${id}`); // typed json() since 1.63\n  expect((await res.json()).email).toBe('qa@example.com');\n});",
          "source": "https://playwright.dev/docs/api-testing"
        },
        {
          "title": "Stub REST and GraphQL with page.route",
          "summary": "Intercept browser traffic to return fixtures, inject errors, or patch live responses. Branch GraphQL by operationName and fall through with route.fallback(). routeFromHAR with { update: true } records whole flows to replay later.",
          "snippet": "import { test, expect } from '@playwright/test';\n\ntest('empty list and cart error', async ({ page }) => {\n  await page.route('**/api/v1/fruits', route => route.fulfill({ json: [] }));\n  await page.route('**/graphql', route => {\n    const { operationName } = route.request().postDataJSON();\n    if (operationName === 'GetCart') return route.fulfill({ status: 500, json: { errors: [{ message: 'boom' }] } });\n    return route.fallback();\n  });\n  await page.goto('/shop');\n  await expect(page.getByText('No fruits yet')).toBeVisible();\n});",
          "source": "https://playwright.dev/docs/mock"
        },
        {
          "title": "Contract check plus eventual consistency",
          "summary": "Parse every response through a schema so contract drift fails loudly, and wrap asynchronous back-end effects in expect().toPass() to poll with backoff instead of sleeping.",
          "snippet": "import { test, expect } from '@playwright/test';\nimport { z } from 'zod';\nconst Order = z.object({ id: z.string(), status: z.enum(['pending', 'paid']), total: z.number().min(0) });\n\ntest('order is created and eventually paid', async ({ request }) => {\n  const res = await request.post('/api/orders', { data: { sku: 'A1', qty: 1 } });\n  const order = Order.parse(await res.json()); // throws on contract drift\n  await expect(async () => {\n    const r = await request.get(`/api/orders/${order.id}`);\n    expect(Order.parse(await r.json()).status).toBe('paid');\n  }).toPass({ intervals: [500, 1_000, 2_000], timeout: 15_000 });\n});",
          "source": "https://playwright.dev/docs/test-assertions#expecttopass"
        }
      ],
      "learn": [
        {
          "title": "Playwright docs: API testing",
          "url": "https://playwright.dev/docs/api-testing"
        },
        {
          "title": "Pact docs: Consumer-driven contract testing",
          "url": "https://docs.pact.io/"
        }
      ],
      "notes": "Selection: one package per gap Playwright cannot fill natively (schema validation, shared mock handlers, contract testing), ranked by downloads. zod appears under Utilities; ajv is listed here because API specs are usually JSON Schema or OpenAPI.\n\nMSW 3.0 shipped September 28, 2026: ESM-only, Node 22+, TypeScript 5.9+, GraphQL moved to msw/graphql, and onUnhandledRequest renamed onUnhandledFrame. The official @msw/playwright (pre-1.0) requires msw 3 and supersedes the community playwright-msw.\n\nBreaking since 1.52: route glob patterns no longer support ? and []. Use a RegExp instead.\n\nAPI-side additions 1.48–1.63: routeWebSocket (1.48), maxRedirects (1.52), tracing.startHar (1.60), test.abort() from route handlers (1.60), WebSockets in HAR and traces (1.61), apiResponse.timing() (1.62), typed request.get<T>() and per-origin httpCredentials arrays (1.63).\n\nUsually unnecessary: supertest overlaps the request fixture, and nock intercepts only in-process Node HTTP, never browser traffic. Bruno, Hoppscotch, and Newman are API clients, not Playwright complements. Mockoon is a solid alternative to Prism for spec-free mock servers.\n\nAvoid: stepci (no push since 2024), jest-openapi / OpenAPIValidators (stale since 2023), openapi-response-validator (stale), playwright-msw (superseded)."
    },
    {
      "id": "utils",
      "name": "Utility packages",
      "short": "Utilities",
      "lede": "The small libraries a test framework leans on every day: schema validation, environment config, realistic test data, and linting. Playwright already handles retries, polling, and custom assertions natively.",
      "repos": [
        {
          "repo": "colinhacks/zod",
          "stars": 44049,
          "pushed": "2026-09-30",
          "desc": "TypeScript-first schema validation with static type inference",
          "why": "Validates API responses and test-data contracts with types inferred from the schema; pairs with a custom toMatchSchema matcher."
        },
        {
          "repo": "faker-js/faker",
          "stars": 15503,
          "pushed": "2026-09-30",
          "desc": "Generate realistic fake data",
          "why": "The standard test-data generator for unique users, addresses, and payloads. Seed it so failures reproduce."
        },
        {
          "repo": "motdotla/dotenv",
          "stars": 20542,
          "pushed": "2026-09-30",
          "desc": "Loads environment variables from .env",
          "why": "Loads per-environment secrets and base URLs into playwright.config.ts, the pattern Playwright's own docs show."
        },
        {
          "repo": "mskelton/eslint-plugin-playwright",
          "stars": 398,
          "pushed": "2026-09-29",
          "desc": "ESLint plugin for Playwright (flat config)",
          "why": "Catches missing awaits, focused tests, waitForTimeout, and non-web-first assertions before CI does. Few stars, but nothing else lints Playwright."
        },
        {
          "repo": "date-fns/date-fns",
          "stars": 36648,
          "pushed": "2026-09-22",
          "desc": "Modern, tree-shakable date utility library",
          "why": "Builds and formats date inputs and expected values such as 'today + 30 days' in the app's locale. Add @date-fns/tz for time zones."
        }
      ],
      "npm": [
        {
          "name": "zod",
          "weekly": 359979939,
          "why": "Runtime schema checks for API and DB payloads with inferred TypeScript types; Standard Schema compatible.",
          "install": "npm i -D zod"
        },
        {
          "name": "dotenv",
          "weekly": 216679941,
          "why": "Loads .env per environment in playwright.config.ts. Pass { quiet: true }, because the config is evaluated in every worker.",
          "install": "npm i -D dotenv"
        },
        {
          "name": "@faker-js/faker",
          "weekly": 21140474,
          "why": "Realistic, seedable test data. Use this maintained scoped fork, never the legacy 'faker' package.",
          "install": "npm i -D @faker-js/faker"
        }
      ],
      "diy": [
        {
          "title": "Typed environment config with option fixtures",
          "summary": "Declare environment settings as { option: true } fixtures so each project (local, staging, prod smoke) overrides them in use. Node's built-in process.loadEnvFile() replaces dotenv for simple cases, and tests read typed values instead of process.env.",
          "snippet": "// fixtures.ts\nimport { test as base } from '@playwright/test';\nexport type EnvOptions = { apiUrl: string; tenant: string };\nexport const test = base.extend<EnvOptions>({\n  apiUrl: [process.env.API_URL ?? 'http://localhost:3000', { option: true }],\n  tenant: ['qa', { option: true }],\n});\n\n// playwright.config.ts\nif (existsSync('.env')) process.loadEnvFile('.env');\nexport default defineConfig<EnvOptions>({\n  projects: [{ name: 'staging', use: { apiUrl: 'https://staging.example.com', tenant: 'stg' } }],\n});",
          "source": "https://playwright.dev/docs/test-parameterize"
        },
        {
          "title": "expect.poll and toPass instead of retry libraries",
          "summary": "expect.poll re-runs a function that returns a value until the matcher passes, and toPass re-runs a whole block of assertions. Both take intervals and a timeout, respect the test timeout, and appear as steps in the report and trace.",
          "snippet": "await expect.poll(async () => {\n  const res = await request.get(`/api/exports/${id}`);\n  return (await res.json()).status;\n}, { intervals: [500, 1_000, 2_000], timeout: 30_000 }).toBe('ready');\n\nawait expect(async () => {\n  const res = await request.post('/api/login', { data: creds });\n  expect(res.status()).toBe(200);\n}).toPass({ intervals: [1_000, 2_000, 5_000], timeout: 30_000 });",
          "source": "https://playwright.dev/docs/test-assertions#expectpoll"
        },
        {
          "title": "Custom matchers with expect.extend",
          "summary": "Wrap any check, here a Zod schema, in a first-class matcher so failures read cleanly in the HTML report and the logic lives in one place. Export the extended expect from your fixtures module next to your extended test.",
          "snippet": "import { expect as baseExpect } from '@playwright/test';\nimport type { ZodType } from 'zod';\n\nexport const expect = baseExpect.extend({\n  toMatchSchema(received: unknown, schema: ZodType) {\n    const result = schema.safeParse(received);\n    return {\n      pass: result.success, name: 'toMatchSchema', expected: 'schema-valid', actual: received,\n      message: () => (result.success ? 'expected value not to match schema' : result.error.message),\n    };\n  },\n});\n// usage: expect(await res.json()).toMatchSchema(UserSchema);",
          "source": "https://playwright.dev/docs/test-assertions#add-custom-matchers-using-expectextend"
        }
      ],
      "learn": [
        {
          "title": "Playwright docs: Fixtures (worker scope, option fixtures, box fixtures)",
          "url": "https://playwright.dev/docs/test-fixtures"
        },
        {
          "title": "Playwright docs: Parameterize tests (env vars, .env files, projects)",
          "url": "https://playwright.dev/docs/test-parameterize"
        }
      ],
      "notes": "Selection: the three packages a Playwright framework touches directly (validation, env, test data), ranked by downloads. ajv, uuid, and nanoid out-download them, but mostly as transitive dependencies, and crypto.randomUUID() covers IDs.\n\nInstall eslint-plugin-playwright (6.7M/wk) as well. Pair playwright.configs['flat/recommended'] with @typescript-eslint/no-floating-promises, which catches the most common Playwright bug: a missing await.\n\nAvoid the legacy 'faker' package (its author sabotaged it in January 2022, yet it still gets about 2.7M downloads a week), moment (maintenance mode), and the stale async-retry and node-retry. For UI time travel, use page.clock rather than a date library.\n\nESM-only packages (@faker-js/faker v10, p-retry 8) need Node 20.19+/22.12+ (require(esm)) or \"type\": \"module\", because Playwright transpiles TS to CJS and this repo is \"type\": \"commonjs\".\n\nUnique data without libraries: testInfo.parallelIndex or workerIndex plus crypto.randomUUID(). Seed faker per test and attach the seed so a failure can be replayed.\n\nAlternatives: dayjs for dates; pino or winston for framework logs (but prefer test.step and testInfo.attach so logs land in the report); @t3-oss/env-core or envalid for typed env validation; fishery or plain typed builders for factories."
    },
    {
      "id": "database",
      "name": "Database packages",
      "short": "Database",
      "lede": "Seed, isolate, assert, and clean up the data behind your tests. Real disposable databases beat mocks, and parallel workers must never share rows.",
      "repos": [
        {
          "repo": "testcontainers/testcontainers-node",
          "stars": 2619,
          "pushed": "2026-09-29",
          "desc": "Throwaway Docker containers (Postgres, MySQL, Mongo, Redis) for tests",
          "why": "Gives each run or each worker a real, disposable database from a setup project; the Postgres module adds snapshot() and restoreSnapshot() for fast resets."
        },
        {
          "repo": "prisma/orm",
          "stars": 47686,
          "pushed": "2026-10-01",
          "desc": "Next-generation TypeScript ORM (formerly prisma/prisma)",
          "why": "If the app uses Prisma, reuse its schema and client in fixtures for seeding and type-safe DB assertions."
        },
        {
          "repo": "drizzle-team/drizzle-orm",
          "stars": 35922,
          "pushed": "2026-10-01",
          "desc": "Lightweight, SQL-like TypeScript ORM",
          "why": "Typed queries with no codegen step, plus drizzle-seed for deterministic seeding. Runs on pg, mysql2, SQLite, and PGlite."
        },
        {
          "repo": "electric-sql/pglite",
          "stars": 16100,
          "pushed": "2026-08-26",
          "desc": "Embeddable Postgres (WASM) running in-process",
          "why": "A real ephemeral Postgres with no Docker, good for fast per-worker databases. pglite-socket lets pg clients and app servers connect to it."
        },
        {
          "repo": "brianc/node-postgres",
          "stars": 13218,
          "pushed": "2026-09-30",
          "desc": "The canonical PostgreSQL client for Node.js",
          "why": "The lowest-friction way to seed, truncate, and assert DB state from fixtures, including transaction-rollback fixtures."
        }
      ],
      "npm": [
        {
          "name": "pg",
          "weekly": 68024162,
          "why": "Direct SQL for seeding, cleanup, and DB assertions in worker-scoped fixtures; the driver Testcontainers, Drizzle, and Kysely build on.",
          "install": "npm i -D pg @types/pg"
        },
        {
          "name": "drizzle-orm",
          "weekly": 29472576,
          "why": "Typed, codegen-free queries for assertions, plus the drizzle-seed companion. If the app already uses Prisma, reuse @prisma/client instead.",
          "install": "npm i -D drizzle-orm drizzle-seed"
        },
        {
          "name": "@testcontainers/postgresql",
          "weekly": 4374679,
          "why": "One line starts a disposable Postgres in a setup project and hands getConnectionUri() to workers.",
          "install": "npm i -D @testcontainers/postgresql"
        }
      ],
      "diy": [
        {
          "title": "Worker-scoped pool with per-test transaction rollback",
          "summary": "Open one small pg Pool per worker and wrap each test in BEGIN/ROLLBACK, so nothing written through tx is ever committed. This isolates only the test's own connection: an app server commits through its own pool, so use it for DB and API tests, not browser E2E writes.",
          "snippet": "import { test as base } from '@playwright/test';\nimport { Pool, type PoolClient } from 'pg';\n\nexport const test = base.extend<{ tx: PoolClient }, { pool: Pool }>({\n  pool: [async ({}, use) => {\n    const pool = new Pool({ connectionString: process.env.TEST_DATABASE_URL, max: 2 });\n    await use(pool);\n    await pool.end();\n  }, { scope: 'worker' }],\n  tx: async ({ pool }, use) => {\n    const client = await pool.connect();\n    await client.query('BEGIN');\n    await use(client);\n    await client.query('ROLLBACK');\n    client.release();\n  },\n});",
          "source": "https://playwright.dev/docs/test-fixtures"
        },
        {
          "title": "Seed in a setup project, clean in its teardown project",
          "summary": "Project dependencies with a teardown project are the recommended replacement for globalSetup and globalTeardown. Seeding and cleanup show up in the HTML report and trace, and can use fixtures such as request for API seeding.",
          "snippet": "// playwright.config.ts → projects\n{ name: 'seed db', testMatch: /db\\.setup\\.ts/, teardown: 'clean db' },\n{ name: 'clean db', testMatch: /db\\.teardown\\.ts/ },\n{ name: 'chromium', use: { ...devices['Desktop Chrome'] }, dependencies: ['seed db'] },\n\n// db.setup.ts\nimport { test as setup } from '@playwright/test';\nimport { Client } from 'pg';\nsetup('seed baseline data', async () => {\n  const db = new Client({ connectionString: process.env.TEST_DATABASE_URL });\n  await db.connect();\n  await db.query(\"INSERT INTO plans (code) VALUES ('pro') ON CONFLICT DO NOTHING\");\n  await db.end();\n});",
          "source": "https://playwright.dev/docs/test-global-setup-teardown"
        },
        {
          "title": "Assert DB state after a UI action with expect.poll",
          "summary": "Drive the UI, then poll the database until the row reaches the expected state. That handles async writers such as queues and triggers without sleeps. Build keys from testInfo.workerIndex so parallel workers never collide on a row.",
          "snippet": "test('signup persists an active user', async ({ page, pool }, testInfo) => {\n  const email = `signup-w${testInfo.workerIndex}-${Date.now()}@test.local`;\n  await page.goto('/signup');\n  await page.getByLabel('Email').fill(email);\n  await page.getByRole('button', { name: 'Create account' }).click();\n  await expect.poll(async () => {\n    const { rows } = await pool.query('SELECT status FROM users WHERE email = $1', [email]);\n    return rows[0]?.status;\n  }, { timeout: 10_000, message: 'user row becomes active' }).toBe('active');\n});",
          "source": "https://playwright.dev/docs/test-assertions#expectpoll"
        }
      ],
      "learn": [
        {
          "title": "Playwright docs: Global setup and teardown with project dependencies",
          "url": "https://playwright.dev/docs/test-global-setup-teardown"
        },
        {
          "title": "Testcontainers for Node.js: PostgreSQL module",
          "url": "https://node.testcontainers.org/modules/postgresql/"
        }
      ],
      "notes": "Safety first: never point tests at production or shared staging. Make the seed project refuse destructive SQL unless the host or database name matches an allow-list such as localhost or *_test.\n\nParallel workers share DB state. Isolate with a schema or database per testInfo.parallelIndex (cloned quickly with CREATE DATABASE … TEMPLATE), unique keys per test, or Playwright 1.63's test locks for tests that touch the same rows.\n\nTransaction rollback isolates only the test's own connection. An app under test commits through its own pool, so for browser E2E, clean up by unique key, TRUNCATE in a teardown project, or reset with Testcontainers restoreSnapshot().\n\nSeed through the API (the request fixture): it is far faster than the UI and still enforces business rules. Close pools in worker-fixture teardown or workers hang at exit. Testcontainers needs Docker, so use Ubuntu runners in CI.\n\nVersion watch: testcontainers-node v12 requires Node 22.22 or later (this repo currently runs 22.14). Prisma 7 is ESM-first with required driver adapters; Prisma 8 is in RC, so pin client and CLI to the same version. Drizzle 1.0 is in RC. Avoid @snaplet/seed (shut down), node-database-cleaner (abandoned), and pg-mem for anything beyond simple SQL.\n\nAlso worth knowing: kysely for typed assertions without an ORM, mongodb-memory-server for Mongo stacks, ioredis for cache cleanup, and PGlite with pglite-socket for Docker-free Postgres."
    },
    {
      "id": "visual",
      "name": "Visual regression testing",
      "short": "Visual regression",
      "lede": "Pixel comparisons that catch the CSS bugs functional tests can't see. Built-in toHaveScreenshot is the default; add a review platform when baselines need human approval on pull requests.",
      "repos": [
        {
          "repo": "mapbox/pixelmatch",
          "stars": 6974,
          "pushed": "2026-09-15",
          "desc": "Small, fast pixel-level image comparison library",
          "why": "Playwright vendors pixelmatch as the default comparator behind toHaveScreenshot. Use it directly for custom diffs such as staging vs prod, PDFs, or canvas output."
        },
        {
          "repo": "garris/BackstopJS",
          "stars": 7182,
          "pushed": "2026-09-08",
          "desc": "Config-driven visual regression runner with an HTML diff report",
          "why": "The most-starred standalone open-source runner. Its Playwright engine suits URL-matrix visual sweeps outside @playwright/test, with an approve workflow."
        },
        {
          "repo": "argos-ci/argos",
          "stars": 633,
          "pushed": "2026-10-01",
          "desc": "Open-source visual testing platform with a review UI",
          "why": "A first-class Playwright reporter and argosScreenshot() give pull-request review and approvals without committing baseline PNGs. The closest open-source successor to the archived Lost Pixel."
        },
        {
          "repo": "dmtrKovalenko/odiff",
          "stars": 3223,
          "pushed": "2026-08-24",
          "desc": "SIMD-accelerated image comparison with a Node API",
          "why": "A much faster drop-in for large full-page diffs in custom pipelines; playwright-odiff wraps it as a matcher."
        },
        {
          "repo": "reg-viz/reg-suit",
          "stars": 1296,
          "pushed": "2026-10-01",
          "desc": "Visual regression CLI with S3/GCS baselines and GitHub PR status",
          "why": "A self-hosted, SaaS-free way to diff a folder of Playwright screenshots against the base branch, with an HTML report."
        }
      ],
      "npm": [
        {
          "name": "pixelmatch",
          "weekly": 12422140,
          "why": "The pixel-diff primitive for in-house comparisons (pair it with pngjs). Playwright bundles its own copy, so install it only for custom diffs.",
          "install": "npm i -D pixelmatch pngjs @types/pngjs"
        },
        {
          "name": "@chromatic-com/playwright",
          "weekly": 291928,
          "why": "Swap the test import and Chromatic archives each test (DOM plus assets) as a visual snapshot you review in Chromatic, re-renderable across browsers.",
          "install": "npm i -D chromatic @chromatic-com/playwright"
        },
        {
          "name": "@argos-ci/playwright",
          "weekly": 259415,
          "why": "argosScreenshot() and the Argos reporter upload screenshots per pull request for review, with stabilization built in. Free tier for open source.",
          "install": "npm i -D @argos-ci/playwright"
        }
      ],
      "diy": [
        {
          "title": "Deterministic toHaveScreenshot",
          "summary": "Remove flake at the source: mask dynamic regions, inject a stylesheet that hides tickers and carets (stylePath), freeze animations, and allow a small maxDiffPixelRatio. Put shared defaults under expect.toHaveScreenshot in the config.",
          "snippet": "import { test, expect } from '@playwright/test';\n\ntest('pricing page', async ({ page }) => {\n  await page.goto('/pricing');\n  await expect(page).toHaveScreenshot('pricing.png', {\n    fullPage: true,\n    animations: 'disabled',\n    mask: [page.getByTestId('live-chat'), page.locator('time')],\n    maskColor: '#000000',\n    stylePath: './tests/visual/hide-dynamic.css',\n    maxDiffPixelRatio: 0.01,\n  });\n});",
          "source": "https://playwright.dev/docs/api/class-pageassertions#page-assertions-to-have-screenshot-1"
        },
        {
          "title": "Docker-pinned, platform-agnostic baselines",
          "summary": "Rendering differs by OS and fonts, so generate and compare baselines only inside the official image matching your exact Playwright version, and drop {platform} from snapshotPathTemplate so Windows and macOS machines never write their own.",
          "snippet": "import { defineConfig } from '@playwright/test';\nexport default defineConfig({\n  // one baseline set (no {platform}), only ever generated inside the pinned image\n  snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}-{projectName}{ext}',\n  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: 'disabled' } },\n});\n// Pin \"@playwright/test\": \"1.63.0\" exactly to match the image, then:\n// docker run --rm --ipc=host -v \"$PWD\":/work -w /work mcr.microsoft.com/playwright:v1.63.0-noble \\\n//   npx playwright test --update-snapshots=changed",
          "source": "https://playwright.dev/docs/docker"
        },
        {
          "title": "Component-level snapshots per state and theme, stored as WebP",
          "summary": "Screenshot a single component locator instead of whole pages so unrelated layout shifts don't fail the test. Loop over color schemes and states, and use .webp names (lossless WebP baselines, 1.62+) to shrink the repo.",
          "snippet": "import { test, expect } from '@playwright/test';\n\nfor (const scheme of ['light', 'dark'] as const) {\n  test(`Save button – ${scheme}`, async ({ page }) => {\n    await page.emulateMedia({ colorScheme: scheme });\n    await page.goto('/design-system/buttons');\n    const btn = page.getByRole('button', { name: 'Save' });\n    await expect(btn).toHaveScreenshot(`save-${scheme}.webp`);\n    await btn.hover();\n    await expect(btn).toHaveScreenshot(`save-${scheme}-hover.webp`);\n  });\n}",
          "source": "https://playwright.dev/docs/api/class-locatorassertions#locator-assertions-to-have-screenshot-1"
        }
      ],
      "learn": [
        {
          "title": "Playwright docs: Visual comparisons",
          "url": "https://playwright.dev/docs/test-snapshots"
        },
        {
          "title": "awesome-regression-testing: curated visual regression tools and articles",
          "url": "https://github.com/mojoaxel/awesome-regression-testing"
        }
      ],
      "notes": "Built-in toHaveScreenshot should be your default. It is left out of the repository list because this project already has it.\n\nDefault baselines include browser and platform in the filename (for example -chromium-win32.png), so baselines generated on this Windows machine will not match Linux CI. Pin @playwright/test to an exact version matching the Docker image tag; ^1.63 can drift to 1.64 and break the browser match. In Git Bash, prefix docker commands with MSYS_NO_PATHCONV=1.\n\nRecent native additions: updateSnapshots changed/all semantics (1.50), the {testFileBaseName} token (1.60), WebP baselines and lossy quality (1.62), screen and ARIA snapshots in traces (1.63), and the stories/gallery mount() component model (1.62).\n\nRun visual tests in one browser project (usually Chromium) unless you are deliberately testing cross-engine rendering; baselines multiply by browser × platform × theme.\n\n2025–2026 changes: Lost Pixel was archived in April 2026 (migrate; Argos is the closest match). storybookjs/test-runner and happo.io are archived. Vitest 4 added Browser Mode toMatchScreenshot.\n\nSaaS SDK weekly downloads: Chromatic 292k, Argos 259k, Percy 244k, Applitools 62k. Avoid for new work: loki (Storybook-only, stale), Resemble.js (stale), jest-image-snapshot (Jest-only)."
    },
    {
      "id": "reporting",
      "name": "Reporting and observability",
      "short": "Reporting",
      "lede": "Turn test runs into evidence: reports, traces, flaky-test history, and pull-request summaries. Start with the built-in HTML, blob, and perfetto reporters; add a platform when you need history across runs.",
      "repos": [
        {
          "repo": "allure-framework/allure2",
          "stars": 5548,
          "pushed": "2026-10-01",
          "desc": "Multi-language test report with history, trends, and retries",
          "why": "The most-installed rich report for Playwright via allure-playwright. The TypeScript-native Allure 3 (allure-framework/allure3, npm 'allure') drops the Java requirement."
        },
        {
          "repo": "reportportal/reportportal",
          "stars": 2034,
          "pushed": "2026-08-20",
          "desc": "Self-hosted test analytics with ML-assisted failure triage",
          "why": "Cross-run dashboards, flaky and unique-error analysis, and automatic failure analysis for teams that want self-hosted history."
        },
        {
          "repo": "dorny/test-reporter",
          "stars": 1185,
          "pushed": "2026-09-28",
          "desc": "GitHub Action that renders test results as check runs",
          "why": "Feed it Playwright's built-in junit reporter to get annotated test results in pull-request checks with no hosting."
        },
        {
          "repo": "ctrf-io/github-test-reporter",
          "stars": 376,
          "pushed": "2026-09-01",
          "desc": "GitHub Actions summaries and PR comments with flaky-test detection",
          "why": "Pair with playwright-ctrf-json-reporter to put pass, fail, and flaky tables and historical flake rates straight into PR checks."
        },
        {
          "repo": "cenfun/monocart-reporter",
          "stars": 322,
          "pushed": "2026-09-29",
          "desc": "Single-file Playwright HTML report with trends and coverage",
          "why": "Playwright-specific and serverless, with history trends, custom columns, and built-in V8/Istanbul coverage merging."
        }
      ],
      "npm": [
        {
          "name": "allure-playwright",
          "weekly": 1566111,
          "why": "Allure adapter for @playwright/test with steps, attachments, labels, and history. Render with Allure 3 (npm 'allure').",
          "install": "npm i -D allure-playwright allure"
        },
        {
          "name": "@reportportal/agent-js-playwright",
          "weekly": 461431,
          "why": "Streams results, logs, and attachments to a ReportPortal server for long-term analytics and triage.",
          "install": "npm i -D @reportportal/agent-js-playwright"
        },
        {
          "name": "playwright-ctrf-json-reporter",
          "weekly": 448229,
          "why": "Emits the open CTRF JSON schema, consumed by CTRF's GitHub, Slack, and Teams reporters and easy to load into your own dashboard.",
          "install": "npm i -D playwright-ctrf-json-reporter"
        }
      ],
      "diy": [
        {
          "title": "Custom reporter that tracks flaky tests",
          "summary": "Implement the Reporter interface and, in onEnd, use TestCase.outcome() (expected, unexpected, flaky, skipped) and per-attempt results to write JSON you can append to a history store. Run it alongside the HTML reporter.",
          "snippet": "// reporter: [['html'], ['./reporters/flaky-reporter.ts']]\nimport type { FullConfig, FullResult, Reporter, Suite } from '@playwright/test/reporter';\nimport { writeFileSync } from 'node:fs';\n\nexport default class FlakyReporter implements Reporter {\n  private suite!: Suite;\n  onBegin(_config: FullConfig, suite: Suite) { this.suite = suite; }\n  onEnd(result: FullResult) {\n    const rows = this.suite.allTests().map(t => ({ id: t.titlePath().join(' > '), outcome: t.outcome(),\n      attempts: t.results.length, ms: t.results.reduce((s, r) => s + r.duration, 0) }));\n    writeFileSync('flaky-report.json', JSON.stringify({ status: result.status, flaky: rows.filter(r => r.outcome === 'flaky'), rows }, null, 2));\n  }\n}",
          "source": "https://playwright.dev/docs/api/class-reporter"
        },
        {
          "title": "Rich evidence: tags, annotations, step params, attachments",
          "summary": "Tags and annotations make tests filterable and linkable in every report. test.step subtitle and params (1.63) put structured data next to steps in the report and trace, and testInfo.attach adds artifacts reporters can surface.",
          "snippet": "test('checkout', {\n  tag: ['@smoke', '@checkout'],\n  annotation: { type: 'issue', description: 'https://jira.example.com/browse/SHOP-123' },\n}, async ({ page }, testInfo) => {\n  await test.step('Add to cart', async () => {\n    await page.goto('/product/42');\n    await page.getByRole('button', { name: 'Add to cart' }).click();\n  }, { subtitle: 'SKU 42', params: { sku: 42, qty: 1 } }); // 1.63+\n  const cart = await page.localStorage.getItem('cart'); // 1.61+\n  await testInfo.attach('cart.json', { body: cart ?? 'null', contentType: 'application/json' });\n});",
          "source": "https://playwright.dev/docs/api/class-test#test-step"
        },
        {
          "title": "Blob reports and merge-reports for sharded CI",
          "summary": "Each shard writes a blob report, and a final job merges them into one HTML report plus JSON for your own tooling. The perfetto reporter (1.63) renders a per-worker timeline to find slow tests and idle workers.",
          "snippet": "// playwright.config.ts\nimport { defineConfig } from '@playwright/test';\nexport default defineConfig({\n  retries: process.env.CI ? 2 : 0,\n  retryStrategy: 'isolated', // 1.62+: retries run last, one at a time, for a cleaner flaky signal\n  reporter: process.env.CI ? [['blob'], ['github']] : [['html'], ['perfetto']],\n});\n// CI job N:  npx playwright test --shard=N/4   (upload ./blob-report as an artifact)\n// merge job: PLAYWRIGHT_JSON_OUTPUT_NAME=results.json npx playwright merge-reports --reporter=html,json ./all-blob-reports",
          "source": "https://playwright.dev/docs/test-sharding#merging-reports-from-multiple-shards"
        }
      ],
      "learn": [
        {
          "title": "Playwright docs: Reporters (built-in, perfetto, custom)",
          "url": "https://playwright.dev/docs/test-reporters"
        },
        {
          "title": "Playwright docs: Trace Viewer",
          "url": "https://playwright.dev/docs/trace-viewer"
        }
      ],
      "notes": "Use the built-ins before adding a vendor: the HTML report's Speedboard (1.57) and duration waterfall (1.63), the perfetto reporter and --add-reporter (1.63), Reporter.preprocess() (1.62), retryStrategy: 'isolated' (1.62), failOnFlakyTests (1.52), trace mode retain-on-failure-and-retries, and the npx playwright trace CLI (1.59).\n\nPlaywright marks a test flaky within a run but keeps no history. Long-term flake tracking needs Allure history, ReportPortal, Currents, flakiness.io, or your own JSON store.\n\nSaaS options: Currents (@currents/playwright, 394k/wk, no public repo), Qase, Testomat.io, Tesults. Other popular reporters: monocart-reporter (385k/wk), @estruyf/github-actions-reporter, playwright-slack-report.\n\n2025–2026 entrants: flakiness.io from Playwright co-creator Andrey Lushnikov (open Flakiness JSON spec), playwright-opentelemetry (tests as OTel spans; still experimental), and playwright-reports-server (self-hosted shard reports).\n\nAvoid: microsoft/playwright-github-action (archived; use npx playwright install --with-deps), Microsoft Playwright Testing (retired March 8, 2026; migrate to Playwright Workspaces in Azure App Testing via @azure/playwright), playwright-merge-html-reports (made redundant by native merge-reports), and sorry-cypress (Cypress-only)."
    },
    {
      "id": "ai",
      "name": "AI-assisted testing and Claude Code",
      "short": "AI and Claude Code",
      "lede": "Give Claude a live browser, encode your team's conventions as skills, and let Playwright's planner, generator, and healer agents draft tests. Treat every AI change as a draft pull request.",
      "repos": [
        {
          "repo": "anthropics/skills",
          "stars": 179239,
          "pushed": "2026-09-29",
          "desc": "Anthropic's public Agent Skills (webapp-testing, skill-creator, mcp-builder)",
          "why": "The reference for SKILL.md format. webapp-testing is a working Playwright skill to learn from (it's Python, so port it to TypeScript), and skill-creator helps write your own."
        },
        {
          "repo": "hesreallyhim/awesome-claude-code",
          "stars": 54883,
          "pushed": "2026-10-01",
          "desc": "Curated list of Claude Code skills, subagents, hooks, and commands",
          "why": "The best-maintained index for testing skills, hook recipes, and CLAUDE.md patterns to borrow."
        },
        {
          "repo": "microsoft/playwright-mcp",
          "stars": 37736,
          "pushed": "2026-09-28",
          "desc": "Official Playwright MCP server, driven by accessibility snapshots",
          "why": "The standard way to give Claude Code a live browser. @playwright/test 1.62+ also bundles it as npx playwright mcp, and it powers the server the test agents use."
        },
        {
          "repo": "web-infra-dev/midscene",
          "stars": 15048,
          "pushed": "2026-09-30",
          "desc": "Vision-driven agent and testing kit (aiAct, aiQuery, aiAssert)",
          "why": "The most active open-source library for adding AI steps inside an existing Playwright test via new PlaywrightAgent(page)."
        },
        {
          "repo": "microsoft/playwright-cli",
          "stars": 13711,
          "pushed": "2026-09-28",
          "desc": "Token-efficient browser control for coding agents, with installable skills",
          "why": "Microsoft's recommended path for coding agents over MCP: concise output and skills loaded only when needed. Bundled as npx playwright cli since 1.62."
        }
      ],
      "npm": [
        {
          "name": "@anthropic-ai/claude-code",
          "weekly": 14495496,
          "why": "The Claude Code CLI itself, which every .claude/ skill, agent, hook, and .mcp.json asset depends on. The native installer is recommended; npm needs Node 22+.",
          "install": "npm i -g @anthropic-ai/claude-code"
        },
        {
          "name": "@playwright/mcp",
          "weekly": 8294373,
          "why": "The official Playwright MCP server. Pin it as a devDependency for reproducible agent runs, or use the copy bundled in @playwright/test 1.62+.",
          "install": "npm i -D @playwright/mcp"
        },
        {
          "name": "@playwright/cli",
          "weekly": 1221107,
          "why": "The official agent CLI and skills; uses far fewer tokens than MCP in Claude Code sessions and updates faster than the bundled copy.",
          "install": "npm i -D @playwright/cli@latest"
        }
      ],
      "diy": [
        {
          "title": "Bootstrap Playwright test agents for Claude Code",
          "summary": "npx playwright init-agents --loop=claude writes planner, generator, and healer subagents plus a playwright-test MCP server entry. Run it first because it overwrites .mcp.json, and re-run it after every Playwright upgrade.",
          "snippet": "# 1) Subagents + playwright-test MCP (overwrites .mcp.json, so run before any `claude mcp add`)\nnpx playwright init-agents --loop=claude\n#    -> .claude/agents/playwright-test-{planner,generator,healer}.md, specs/, seed.spec.ts\n\n# 2) Optional general-purpose browser MCP, bundled in @playwright/test 1.62+\nclaude mcp add --scope project playwright -- npx playwright mcp --headless --isolated\n\n# 3) Then, inside Claude Code:\n#  > Use playwright-test-planner to plan guest checkout (seed: tests/seed.spec.ts)\n#  > Use playwright-test-generator on specs/guest-checkout.md\n#  > Use playwright-test-healer to fix the failing tests",
          "source": "https://playwright.dev/docs/test-agents"
        },
        {
          "title": "Project skill that encodes your Playwright conventions",
          "summary": "Commit .claude/skills/playwright-conventions/SKILL.md. Claude loads it automatically when the description matches the task, and you can run it as /playwright-conventions. The frontmatter must start on the first line.",
          "snippet": "---\nname: playwright-conventions\ndescription: House rules for writing, reviewing, or fixing Playwright tests, page objects, and fixtures in this repo. Use whenever creating or editing *.spec.ts files or anything under src/tests/.\n---\n- Locators: getByRole > getByLabel > getByTestId. No CSS/XPath chains, no nth().\n- Web-first assertions only (`await expect(loc).toBeVisible()`); never `page.waitForTimeout()`.\n- Import `test`/`expect` from `./fixtures`; auth comes from the setup project's storageState, never inline secrets.\n- Never delete or loosen an assertion to go green. If the app looks broken, use `test.fixme()` and say why.\n- Done means `npx playwright test --only-changed --reporter=line` passes.",
          "source": "https://code.claude.com/docs/en/skills"
        },
        {
          "title": "PostToolUse hook that runs affected tests after edits",
          "summary": "In .claude/settings.json: after Claude edits a .ts file, run only the tests affected by uncommitted changes in the background (asyncRewake), and wake Claude with the failure output (exit 2) only when something breaks. Needs Git Bash on Windows.",
          "snippet": "{\"hooks\": {\"PostToolUse\": [{\n  \"matcher\": \"Edit|Write\",\n  \"hooks\": [{\n    \"type\": \"command\",\n    \"if\": \"Edit(*.ts)\",\n    \"command\": \"npx playwright test --only-changed --reporter=line >&2 || exit 2\",\n    \"asyncRewake\": true,\n    \"timeout\": 300\n  }]\n}]}}",
          "source": "https://code.claude.com/docs/en/hooks"
        }
      ],
      "learn": [
        {
          "title": "Playwright docs: Test agents (planner, generator, healer)",
          "url": "https://playwright.dev/docs/test-agents"
        },
        {
          "title": "Playwright docs: Playwright CLI and skills for coding agents",
          "url": "https://playwright.dev/docs/getting-started-cli"
        },
        {
          "title": "Claude Code docs: Hooks guide (links to skills, subagents, and MCP)",
          "url": "https://code.claude.com/docs/en/hooks-guide"
        }
      ],
      "notes": "Selection: repositories ranked by relevance first, then stars. Larger but more general projects (obra/superpowers, anthropics/claude-code, browser-use, microsoft/playwright) are covered elsewhere or aren't testing-specific. Other strong options: ChromeDevTools/chrome-devtools-mcp for perf and network debugging, lackeyjb/playwright-skill (a TypeScript-friendly Claude skill), and currents-dev/playwright-best-practices-skill.\n\nLeft out of npm: @modelcontextprotocol/sdk (only needed to build your own MCP server), @anthropic-ai/claude-agent-sdk (for custom CI agents such as failure-triage bots), and @browserbasehq/stagehand (v4 drives Chromium over CDP and no longer accepts a Playwright Page).\n\nNew in 2025–2026: test agents (1.56); ariaSnapshot({ mode: 'ai' }) with [ref=eN] element refs, the most compact LLM page context (1.59); npx playwright trace for agent triage (1.59); MCP and CLI bundled into Playwright (1.62); ariaSnapshotJSON() (1.63); the HTML report's Copy prompt button (1.51). In Claude Code, slash commands have merged into skills, and hooks support if, asyncRewake, and exec-form args.\n\nCaveats: results are non-deterministic, so review every diff and run generated tests with retries 0 and --repeat-each before merging. Never let the healer weaken or delete assertions; it may skip a test it believes is broken, which can hide real bugs.\n\nCost: Currents measured about 114K tokens per test with MCP versus 27K with the CLI, so prefer playwright-cli and skills for coding sessions. Secrets: use --isolated, keep storageState and .env out of git and out of the model's context (deny Read(.env)). Page text is untrusted input, so don't point broadly-permissioned agents at arbitrary sites.\n\nWindows: init-agents writes cmd /c npx … into .mcp.json; do the same for manual servers. Project .mcp.json servers need a one-time approval.\n\nAvoid: ZeroStep (repo gone), auto-playwright, antiwork/shortest (stale), executeautomation/mcp-playwright (migrate to the official server), browserbase/mcp-server-browserbase and octomind-mcp (archived)."
    }
  ]
};
