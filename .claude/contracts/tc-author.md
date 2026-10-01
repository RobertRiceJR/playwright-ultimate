---
# Identity
id: tc-author
title: TC-Author
kind: capability
stage: ready-for-refinement
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
    uses: [refinement-intake]
provides:
  - name: test-case-metadata
    kind: schema
    ref: src/contracts/test-case.ts

# Mint gate
gate:
  - Every authored test case has an id, title, steps, expected result, and acceptance-criterion trace
  - Test-case metadata carries the fields runner-tag-topology derives tags from (area, priority, type)
  - Authoring the same story twice yields the same test-case ids

# The two halves
code: []
knowledge: []
---

# TC-Author

## Purpose
Turns a refined story into structured test cases. Its output schema is what tags, judging, and reporting all key on, so it has to be stable before anything downstream can mint.

## Interface
- **test-case-metadata**: one record per test case, with id, title, steps, expected result, the acceptance-criterion id it traces to, and classification fields (area, priority, type).

## Non-goals
Judging quality (tc-judge) or writing Playwright code.

## Open questions
- Is this a Claude skill, a script, or both?
- How are ids made stable: a hash of story plus criterion, or assigned sequentially?

## Changelog
- 0.1.0 (2026-10-01): drafted
