---
description: "Manage GovStack building-block frameworks: list the building blocks, show one, add one as a GovKit framework (govstack-bb-<id>) drafted from its GovStack specification, or refresh it when the specification changes."
doc-type: none
argument-hint: "[list | show <bb> | add <bb> [--version <x.y.z>] | refresh <bb>]"
effort: high
handoffs:
  - command: govkit-govstack:compliance
    description: Self-assess a solution against the building block.
  - command: govkit:crosswalk
    description: Map the building block's requirements onto other active frameworks.
allowed-tools:
  - Read(/${CLAUDE_PLUGIN_ROOT}/**)
---

## User Request

```text
$ARGUMENTS
```

A building-block framework is a GovKit framework file, `govstack-bb-<id>.yaml`, holding one GovStack building block's functional requirements and its extensions to the core cross-functional requirements. The overlay does not ship them, because building-block specifications change on their own release cycles. This command drafts them from the published specification.

Follow `${CLAUDE_PLUGIN_ROOT}/references/overlay-procedure.md` O1, O2 and O5 first.

## Sub-commands

- **list** (default): a table of every building block in `${CLAUDE_PLUGIN_ROOT}/references/building-blocks.yaml`, with name, wave, specification link, whether `govstack-bb-<id>` exists in a GovKit content layer and its specification version, and whether it is active in the profile.
- **show `<bb>`**: the framework's header, then its requirements grouped by `group` (Key Functionality, or "Cross-functional"), with obligation, verification and mutability. Add counts per obligation.
- **add `<bb>`**:
  1. Resolve `<bb>` against `building-blocks.yaml` by id or name. If it is not listed, stop and show the list.
  2. Dispatch the `govstack-spec-reader` agent with `{ "bb_id": "<id>", "spec_url": "<spec>", "version": "<--version or null>", "framework_schema": "<govkit>/schemas/framework.schema.json" }`. It returns a JSON framework draft with a citation for every requirement, plus the specification version and any notes on legacy keywords or ambiguous classifiers.
  3. Check the draft: ids unique, every requirement has `obligation` and `attributes.ref`, defaults applied per `govstack-model.md`, and `related_govkit.overlay_commands` set to `["govkit-govstack:compliance"]`. Set `evidence_hints` from ArcKit and GovKit doc-type codes. For ArcKit codes, glob ArcKit core's `config/doc-types.mjs`, located as `<govkit>/commands/apply.md` step 2 describes. For GovKit codes, read `<govkit>/config/doc-types.mjs`.
  4. Show the user a summary: specification version, counts per obligation and verification class, Key Functionalities, and every note from the reader. Ask for confirmation.
  5. Write `.govkit/frameworks/govstack-bb-<id>.yaml` with the provenance line `# govkit-overlay govkit-govstack@<overlay version> — drafted by /govkit-govstack:bb from <spec url> v<spec version>; delete this line to take ownership`. If the file exists without that line, the user owns it: show the diff and stop.
  6. Run `/govkit:framework validate govstack-bb-<id>`.
- **refresh `<bb>`**: re-run **add** against the specification's current version. Show a diff of requirements added, removed, reworded and reclassified. A change of obligation or mutability is a GovStack version change, so call it out. Write only after confirmation, and update `verified`.

## Rules

- Paraphrase each requirement's intent in one sentence. Keep GovStack's requirement titles and identifiers verbatim, because procurement documents cite them.
- Never invent requirements. If the specification has none for a Key Functionality, record the Key Functionality in the summary and add nothing.
- If the specification has not yet been aligned with the 2.0.0 classifier model (no explicit REQUIRED or RECOMMENDED labels), map its legacy keywords as `govstack-model.md` describes and say so in `text_policy`.
