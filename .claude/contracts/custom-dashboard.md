---
# Identity
id: custom-dashboard
title: Custom Dashboard
kind: capability
stage: ready-for-white-glove
owner: RobertRiceJR

# Lifecycle
status: draft
version: 0.1.0
minted: null
updated: 2026-10-01

# Graph
depends_on:
  - id: runner-tag-topology
    version: ^0.1.0
    uses: [tag-vocabulary]
  - id: custom-reporter
    version: ^0.1.0
    uses: [automation-results]
provides:
  - name: results-dashboard
    kind: report
    ref: .claude/dashboards/results/index.html

# Mint gate
gate:
  - Renders any automation-results file with no build step (vanilla HTML/CSS/JS)
  - Filters and groups by every tag dimension in the tag vocabulary
  - Works in light and dark themes and at phone width

# The two halves
code: []
knowledge: []
---

# Custom Dashboard

## Purpose
Shows Automation Results sliced by the runner tag topology. It can't be built until both the tag vocabulary and the results format are minted.

## Interface
- **results-dashboard**: a static page that reads automation-results data and renders pass rate, flakiness, and duration by tag.

## Non-goals
Producing the compiled stakeholder report. That's White Glove, which embeds or links this.

## Open questions
- Should it show history across runs, or only the latest run?

## Changelog
- 0.1.0 (2026-10-01): drafted
