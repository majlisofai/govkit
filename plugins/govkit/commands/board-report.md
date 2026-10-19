---
description: "Produce a governance board report (BRPT, multi-instance) across all projects: gate status, framework results, risks above appetite, exceptions and evidence health."
doc-type: BRPT
argument-hint: "[reporting period] [project IDs...]"
effort: high
handoffs:
  - command: arckit:pages
    description: Publish the portfolio dashboard alongside the report.
  - command: arckit:presentation
    description: Turn the report into a board deck.
allowed-tools:
  - Read(/${CLAUDE_PLUGIN_ROOT}/**)
  - Bash(bash ${CLAUDE_PLUGIN_ROOT}/scripts/bash/list-projects.sh *)
  - Bash(node ${CLAUDE_PLUGIN_ROOT}/scripts/generate-gov-id.mjs *)
---

## User Request

```text
$ARGUMENTS
```

Follow `${CLAUDE_PLUGIN_ROOT}/references/govkit/artefact-procedure.md`. **Project**: `000-global`. **Type**: BRPT (multi-instance, `board-reports/`). **Template**: `board-report`.

**Inputs** (P3). Required: at least one project with a GOV artefact. Optional: for every project (or those listed in `$ARGUMENTS`), the latest GATE, the ASMT for the primary framework, open EXCPs, EVID and ArcKit RISK. Also the previous BRPT, for trend.

**Content**:

1. **Portfolio Status.** Make one row per project. The trend (↑ ↓ →) compares the primary-framework result and critical gaps with the previous BRPT.
2. **Top Risks Above Appetite.** Take them from ArcKit RISK artefacts, rated with the profile's risk method. List at most 10, ordered by score.
3. **Exceptions.** List every open EXCP. Flag any expired or expiring within 30 days.
4. **Evidence Health.** Take the numbers from each EVID.
5. **Decisions Requested.** Include gate decisions still `[PENDING]` for the governing body, exceptions above appetite, and profile changes awaiting approval.
6. Write for the governing body. Lead with decisions and exposure, not process.

**Report** (P8): the number of projects covered, decisions requested, and risks above appetite.
