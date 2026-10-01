---
# Identity
id: ready-for-white-glove
title: Ready for White Glove
kind: orchestrator
stage: ready-for-white-glove
owner: RobertRiceJR

# Lifecycle
status: draft
version: 0.1.0
minted: null
updated: 2026-10-01

# Graph
depends_on:
  - id: ready-for-playwright
    version: ^0.1.0
    uses: [playwright-exit]
  - id: custom-reporter
    version: ^0.1.0
    uses: [automation-results]
  - id: custom-dashboard
    version: ^0.1.0
    uses: [results-dashboard]
provides:
  - name: compiled-report
    kind: report
    ref: src/contracts/stages/white-glove.ts

# Mint gate
gate:
  - One compiled report per story traces story to test cases to verdicts to run results
  - Every failure in the report links to its trace and screenshot
  - The report builds with no manual editing

# The two halves
code: []
knowledge: []
---

# Ready for White Glove

## Purpose
The final stage and the glue. It compiles everything upstream (story, judged cases, run results, dashboard) into one finished report a stakeholder can read without context.

## Interface
- **compiled-report**: a self-contained report per story. Its format is still open.

## Non-goals
Producing results. It only assembles and presents what upstream already produced.

## Open questions
- What's the output format (HTML artifact, PDF, PR comment, or several)?

## Changelog
- 0.1.0 (2026-10-01): drafted
