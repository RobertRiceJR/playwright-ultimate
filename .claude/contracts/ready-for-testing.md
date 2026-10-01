---
# Identity
id: ready-for-testing
title: Ready for Testing
kind: orchestrator
stage: ready-for-testing
owner: RobertRiceJR

# Lifecycle
status: draft
version: 0.1.0
minted: null
updated: 2026-10-01

# Graph
depends_on:
  - id: ready-for-refinement
    version: ^0.1.0
    uses: [refinement-exit]
  - id: tc-author
    version: ^0.1.0
    uses: [test-case-metadata]
provides:
  - name: pr-analysis
    kind: report
    ref: src/contracts/stages/testing.ts
  - name: testing-exit
    kind: schema
    ref: src/contracts/stages/testing.ts

# Mint gate
gate:
  - Stage starts only on a merged PR linked to a refined story
  - PR analysis maps changed files to the affected test cases
  - tc-judge returns a pass/fail verdict with reasons for every authored test case
  - testing-exit lists only judged-passing test cases

# The two halves
code: []
knowledge: []
---

# Ready for Testing

## Purpose
The second stage. It starts when the PR merges, runs PR analysis to scope impact, then has tc-judge grade the authored test cases. Only cases that pass the judge move on to Playwright.

## Interface
- **pr-analysis**: the merged PR, its changed files, and the test cases they affect.
- **testing-exit**: the handoff to Ready for Playwright, meaning the judged-passing test cases and their verdicts.

## Non-goals
Writing or running Playwright specs.

## Open questions
- Should tc-judge and PR analysis become capability contracts of their own, like tc-author? That's likely once their output shapes settle.

## Changelog
- 0.1.0 (2026-10-01): drafted
