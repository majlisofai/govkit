---
description: "Apply the FINOS module to GovKit: register the FNRA doc type in .govkit/doc-types.json and install the FINOS AI Governance Framework mitigations (finos-aigf) into a GovKit content layer. Idempotent; re-run after upgrading the module."
doc-type: none
argument-hint: "[--central] [--activate] [--dry-run]"
effort: low
handoffs:
  - command: govkit-finos:risk-assess
    description: Triage an AI system against the FINOS risk catalogue.
  - command: govkit:profile
    description: Activate finos-aigf with `set frameworks.active`.
allowed-tools:
  - Read(/${CLAUDE_PLUGIN_ROOT}/**)
---

## User Request

```text
$ARGUMENTS
```

You install the FINOS module into GovKit without changing GovKit. GovKit reads custom doc types from `.govkit/doc-types.json` and content files from its project and organisation layers. You write there only.

## Process

1. Follow `${CLAUDE_PLUGIN_ROOT}/references/overlay-procedure.md` O1 and O2: locate GovKit and resolve the profile.
2. Read `${CLAUDE_PLUGIN_ROOT}/govkit-overlay.json`.
3. **Doc types.** Read `.govkit/doc-types.json`, or start from `{}`. For each code in `doc_types`, set the entry to the manifest's value without the `template` key. Keep every other entry unchanged. If an entry with the same code exists but was not written by this overlay (its `command` does not start with `govkit-finos:`), stop and report the collision. Do not overwrite it. This file is always project-level, because GovKit's filename hook reads it from the repository root.
4. **Content files.** Choose the layer: the organisation layer (the directory of the profile named by `extends:`) with `--central`, otherwise `.govkit/`. For each path in `installs`:
   1. Read `${CLAUDE_PLUGIN_ROOT}/<path>`.
   2. Prepend the provenance line `# govkit-overlay govkit-finos@<overlay version> — refreshed by /govkit-finos:apply; delete this line to take ownership`.
   3. If the target exists **without** that first line, the user owns it. Do not overwrite it: report it and show the diff you would have made.
   4. Otherwise write it. Report created, updated or unchanged.
5. **Activate.** With `--activate`, run `/govkit:profile set frameworks.active` with the current list plus `finos-aigf`. Without it, ask whether to activate `finos-aigf` now, unless it is already active.
6. With `--dry-run`, print the planned changes and write nothing.
7. Report a table with one row per doc type and file: created, updated, unchanged, skipped (user-owned) or collision. Then recommend `/govkit-finos:risk-assess <project> <AI system>` for each AI system in the project, and `/govkit:crosswalk` if `iso-iec-42001` is active too.

## Notes

- Upgrading the overlay changes nothing until you re-run this command. The provenance line shows which overlay version installed each file.
- To remove the overlay, delete its entries from `.govkit/doc-types.json` and the files that carry the provenance line. Existing FNRA artefacts stay valid as records, but GovKit's hook will block new versions of them.
