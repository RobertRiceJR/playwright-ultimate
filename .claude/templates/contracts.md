---
# Identity
id: <kebab-slug>                 # equals the filename; never changes; other contracts point at it
title: <Human Name>
kind: capability                 # orchestrator (a lifecycle stage) | capability (work inside a stage)
stage: <ready-for-refinement>    # id of the orchestrator that owns this; an orchestrator names itself
owner: <github-handle>

# Lifecycle
status: draft                    # draft -> proposed -> minted -> deprecated
version: 0.1.0                   # semver over `provides`; major bump = breaking for consumers
minted: null                     # date it reached `minted`; null until then
updated: YYYY-MM-DD

# Graph: you can only mint once every depends_on entry is minted
depends_on:
  - id: <upstream-contract-id>
    version: ^1.0.0              # upstream version range this was built against
    uses: [<provide-name>]       # which of the upstream's `provides` this consumes
provides:                        # what downstream may build on; frozen once minted
  - name: <provide-name>
    kind: <schema | api | fixture | tag-set | file-format | report>
    ref: <path to the source of truth, e.g. src/contracts/tags.ts>

# Mint gate: each line is pass/fail; all must pass to mint
gate:
  - <assertion>

# The two halves (see CLAUDE.md)
code: []                         # framework paths that implement it
knowledge: []                    # .claude skills/dashboards that explain it
---

# <Human Name>

## Purpose
One paragraph on what this unblocks and for whom.

## Interface
Detail for each `provides` entry: shape, an example, invariants.

## Non-goals
What this contract deliberately does not promise.

## Open questions
Anything that must be resolved before `status: proposed`.

## Changelog
- 0.1.0 (YYYY-MM-DD): drafted
