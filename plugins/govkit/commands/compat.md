---
description: "Diagnose GovKit ↔ ArcKit compatibility in this environment: installed ArcKit version vs tested range, overlays, template overrides built from an older ArcKit, and ArcKit commands GovKit references."
doc-type: none
argument-hint: ""
effort: low
allowed-tools:
  - Read(/${CLAUDE_PLUGIN_ROOT}/**)
---

1. Read `${CLAUDE_PLUGIN_ROOT}/config/compat.json` (tested range) and GovKit's own `.claude-plugin/plugin.json` version.
2. Locate ArcKit core as `/govkit:apply` step 2 describes; read its `.claude-plugin/plugin.json` version. Report whether it is inside `>= min, < max_exclusive`, and whether it is one of `tested`.
3. For every `.arckit/templates-custom/*-template.md` with a `govkit-override` comment, compare its `upstream=` version with the installed ArcKit version. Different → "stale override — re-run /govkit:apply".
4. Grep GovKit's `commands/`, `skills/`, `agents/`, `methods/`, `frameworks/` and `recipes/` for `arckit:<name>` and `arckit-<overlay>:<name>` references; confirm each exists in the installed ArcKit core or overlay `commands/` directory. Missing in an overlay that is not installed → informational; missing in an installed plugin → **incompatible**.
5. Print a PASS / WARN / FAIL table and, for each FAIL, the fix (upgrade GovKit, pin ArcKit, or re-run `/govkit:apply`).
