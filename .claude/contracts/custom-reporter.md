---
# Identity
id: custom-reporter
title: Custom Reporter
kind: capability
stage: ready-for-playwright
owner: RobertRiceJR

# Lifecycle
status: draft
version: 0.1.0
minted: null
updated: 2026-10-01

# Graph
depends_on: []
provides:
  - name: automation-results
    kind: file-format
    ref: src/contracts/automation-results.ts

# Mint gate
gate:
  - Implements Playwright's Reporter interface and is registered in playwright.config.ts
  - Writes one automation-results file per run, valid against its schema
  - Each result carries test id, project, status, duration, retries, tags, and attachment paths

# The two halves
code: []
knowledge: []
---

# Custom Reporter

## Purpose
Produces the Automation Results the dashboard and White Glove consume. It's built on Playwright's native Reporter API, not on a third-party reporter.

## Interface
- **automation-results**: a JSON file per run with run metadata plus one record per test result.

## Non-goals
Rendering anything. That's the dashboard's job.

## Open questions
- Should results be keyed by the tag vocabulary? If so, add runner-tag-topology to depends_on.

## Changelog
- 0.1.0 (2026-10-01): drafted
