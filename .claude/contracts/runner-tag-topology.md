---
# Identity
id: runner-tag-topology
title: Runner Tag Topology
kind: capability
stage: ready-for-playwright
owner: RobertRiceJR

# Lifecycle
status: draft
version: 0.1.0
minted: null
updated: 2026-10-01

# Graph
depends_on:
  - id: tc-author
    version: ^0.1.0
    uses: [test-case-metadata]
provides:
  - name: tag-vocabulary
    kind: tag-set
    ref: src/contracts/tags.ts

# Mint gate
gate:
  - The tag vocabulary is a closed, typed set derived from test-case metadata fields
  - Every spec has exactly one @area tag and one @priority tag
  - An unknown tag fails `npx playwright test --list`

# The two halves
code: []
knowledge: []
---

# Runner Tag Topology

## Purpose
Defines the tags every spec carries and how runners select by them. Run plans, result grouping, and the dashboard's filters all depend on this vocabulary.

## Interface
- **tag-vocabulary**: the allowed tags, grouped by dimension (area, priority, type), using Playwright's native `tag` option on `test()`.

## Non-goals
Choosing which runner executes what. That's the run plan in Ready for Playwright.

## Open questions
- Which dimensions are mandatory on every spec, and which are optional?

## Changelog
- 0.1.0 (2026-10-01): drafted
