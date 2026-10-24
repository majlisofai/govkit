---
description: "Apply the GovStack overlay to GovKit: register the overlay's doc types in .govkit/doc-types.json and install the GovStack core cross-functional requirements (govstack-cfr) into a GovKit content layer. Idempotent; re-run after upgrading the overlay."
doc-type: none
argument-hint: "[--central] [--activate] [--dry-run]"
effort: low
handoffs:
  - command: govkit-govstack:map
    description: Map the project's services to GovStack building blocks.
  - command: govkit:profile
    description: Activate govstack-cfr with `set frameworks.active`.
allowed-tools:
  - Read(/${CLAUDE_PLUGIN_ROOT}/**)
---

## User Request

```text
$ARGUMENTS
```

You install the GovStack overlay into GovKit without changing GovKit. GovKit reads custom doc types from `.govkit/doc-types.json` and content files from its project and organisation layers. You write there only.

## Process

1. Follow `${CLAUDE_PLUGIN_ROOT}/references/overlay-procedure.md` O1 and O2: locate GovKit and resolve the profile.
2. Read `${CLAUDE_PLUGIN_ROOT}/govkit-overlay.json`.
3. **Doc types.** Read `.govkit/doc-types.json`, or start from `{}`. For each code in `doc_types`, set the entry to the manifest's value without the `template` key. Keep every other entry unchanged. If an entry with the same code exists but was not written by this overlay (its `command` does not start with `govkit-govstack:`), stop and report the collision. Do not overwrite it. This file is always project-level, because GovKit's filename hook reads it from the repository root.
4. **Content files.** Choose the layer: the organisation layer (the directory of the profile named by `extends:`) with `--central`, otherwise `.govkit/`. For each path in `installs`:
   1. Read `${CLAUDE_PLUGIN_ROOT}/<path>`.
   2. Prepend the provenance line `# govkit-overlay govkit-govstack@<overlay version> — refreshed by /govkit-govstack:apply; delete this line to take ownership`.
   3. If the target exists **without** that first line, the user owns it. Do not overwrite it: report it and show the diff you would have made.
   4. Otherwise write it. Report created, updated or unchanged.
5. **Activate.** With `--activate`, run `/govkit:profile set frameworks.active` with the current list plus `govstack-cfr`. Without it, ask whether to activate `govstack-cfr` now, unless it is already active.
6. With `--dry-run`, print the planned changes and write nothing.
7. Report a table with one row per doc type and file: created, updated, unchanged, skipped (user-owned) or collision. Then recommend `/govkit-govstack:map <project>`, and `/govkit-govstack:bb add <id>` for each building block the project will use.

## Notes

- Upgrading the overlay changes nothing until you re-run this command. The provenance line shows which overlay version installed each file.
- To remove the overlay, delete its entries from `.govkit/doc-types.json` and the files that carry the provenance line. Existing GSBB and GSCA artefacts stay valid as records, but GovKit's hook will block new versions of them.
