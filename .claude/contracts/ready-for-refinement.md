---
# Identity
id: ready-for-refinement
title: Ready for Refinement
kind: orchestrator
stage: ready-for-refinement
owner: RobertRiceJR

# Lifecycle
status: draft
version: 0.1.0
minted: null
updated: 2026-10-01

# Graph
depends_on: []
provides:
  - name: refinement-intake
    kind: schema
    ref: src/contracts/stages/refinement.ts
  - name: refinement-exit
    kind: schema
    ref: src/contracts/stages/refinement.ts

# Mint gate
gate:
  - Entry criteria for a story are written as a typed schema (refinement-intake)
  - Exit criteria are typed, and every authored test case traces to an acceptance criterion
  - A story missing acceptance criteria is rejected at intake, not passed downstream

# The two halves
code: []
knowledge: []
---

# Ready for Refinement

## Purpose
The first stage of the quality-engineering lifecycle. It takes a story with acceptance criteria and drives it to a set of authored test cases. It hosts TC-Author and starts every other contract in the chain.

## Interface
- **refinement-intake**: the story as TC-Author receives it, including id, summary, acceptance criteria, and links.
- **refinement-exit**: the handoff to Ready for Testing, meaning the refined story plus the ids of its authored test cases.

## Non-goals
Judging test-case quality (that's Ready for Testing / tc-judge). Executing anything.

## Open questions
- Where do stories come from (Jira, GitHub issues, markdown)? This decides the intake adapter.

## Changelog
- 0.1.0 (2026-10-01): drafted
