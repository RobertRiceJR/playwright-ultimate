---
# Identity
id: ready-for-playwright
title: Ready for Playwright
kind: orchestrator
stage: ready-for-playwright
owner: RobertRiceJR

# Lifecycle
status: draft
version: 0.1.0
minted: null
updated: 2026-10-01

# Graph
depends_on:
  - id: ready-for-testing
    version: ^0.1.0
    uses: [testing-exit]
  - id: runner-tag-topology
    version: ^0.1.0
    uses: [tag-vocabulary]
provides:
  - name: run-plan
    kind: schema
    ref: src/contracts/stages/playwright.ts
  - name: playwright-exit
    kind: schema
    ref: src/contracts/stages/playwright.ts

# Mint gate
gate:
  - Every judged test case maps to at least one Playwright spec
  - The run plan selects specs by tag only, never by file path
  - `npx playwright test` runs the plan across chromium, firefox, and webkit

# The two halves
code: []
knowledge: []
---

# Ready for Playwright

## Purpose
The third stage. It turns judged test cases into a run plan (which specs run, on which runners, chosen by tag) and executes it.

## Interface
- **run-plan**: the tag expression per runner, built from the tag vocabulary.
- **playwright-exit**: the handoff to Ready for White Glove, meaning the run ids and where their results landed.

## Non-goals
Report formatting and presentation (that's the custom reporter and White Glove).

## Open questions
- Do runners mean Playwright projects, CI shards, or separate machines?

## Changelog
- 0.1.0 (2026-10-01): drafted
