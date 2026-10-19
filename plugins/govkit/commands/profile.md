---
description: "Show, validate or change the active GovKit profile (approach, methods, frameworks, tools)."
doc-type: none
argument-hint: "[show | validate | set <key> <value> | explain <key>]"
effort: low
allowed-tools:
  - Read(/${CLAUDE_PLUGIN_ROOT}/**)
---

## User Request

```text
$ARGUMENTS
```

1. Read `${CLAUDE_PLUGIN_ROOT}/references/govkit/runtime-contract.md` and resolve the profile (§1).
2. Act on the sub-command (default `show`):
   - **show** — a table of the effective value of every key and which layer it came from (default / extends / project).
   - **validate** — check that every id resolves to a file (§2), every framework in `frameworks.active` exists, `frameworks.primary` is in `frameworks.active`, every `tools.arckit.commands.exclude`/`substitute` key names a real ArcKit command (glob ArcKit core's `commands/` as `/govkit:apply` step 2 locates it), every `substitute` value names a real `/govkit:*` command, and every overlay in `tools.arckit.overlays` is installed. Report PASS / FAIL per check with the fix.
   - **set** — edit `.govkit/profile.yaml` (never the built-in defaults). Show the before/after line, then re-run **validate**. If the key changes a template or recipe input (`methods.risk`, `methods.assessment_scale`, `frameworks.*`, `tools.arckit.*`), remind the user to run `/govkit:apply`.
   - **explain** — what the key controls and which commands read it.
