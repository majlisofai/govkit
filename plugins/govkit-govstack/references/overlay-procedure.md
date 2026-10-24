# Overlay Procedure

Every `/govkit-govstack:*` command follows these rules. They keep the overlay working through GovKit's extension points only, the same way GovKit works with ArcKit.

## O1. Locate GovKit

GovKit is a separate plugin, so `${CLAUDE_PLUGIN_ROOT}` is this overlay's root, not GovKit's. Find GovKit's root (call it `<govkit>`) by globbing in this order, and take the highest version:

1. `${CLAUDE_PLUGIN_ROOT}/../../govkit/*/` (marketplace cache: `cache/majlisofai/<plugin>/<version>/`)
2. `${CLAUDE_PLUGIN_ROOT}/../govkit/` (a checkout of the GovKit repository)

If neither exists, stop and tell the user to run `claude plugin install govkit@majlisofai`.

Read `<govkit>/.claude-plugin/plugin.json`. If its version is outside `govkit.min` … `govkit.max_exclusive` in `${CLAUDE_PLUGIN_ROOT}/govkit-overlay.json`, warn once and continue.

## O2. Follow GovKit's contract

Read `<govkit>/references/govkit/runtime-contract.md` and apply it as GovKit's own commands do. Where it says `${CLAUDE_PLUGIN_ROOT}`, read `<govkit>`. That covers profile resolution, content layers, naming, Document Control, brand, interoperation with ArcKit, and quality.

## O3. Check the overlay is applied

Before writing an artefact, check that `.govkit/doc-types.json` contains every code in `govkit-overlay.json` `doc_types`. If any is missing, stop: GovKit's filename hook would block the file. Tell the user to run `/govkit-govstack:apply`.

## O4. Write artefacts with GovKit's procedure

Follow `<govkit>/references/govkit/artefact-procedure.md` (P1–P8), with two differences:

- **P4 Template.** Resolve `<name>-template.md` through `.govkit/templates-custom/`, then the organisation layer's `templates-custom/`, then `${CLAUDE_PLUGIN_ROOT}/templates/` (this overlay).
- **P5 Filename.** Run `node <govkit>/scripts/generate-gov-id.mjs <PID> <TYPE> <VERSION> --relpath [--next-num projects/<dir>/<subdir>]`. It reads the overlay's codes from `.govkit/doc-types.json`.

Fill `[GOVKIT_VERSION]` with GovKit's version and `[OVERLAY_VERSION]` with this overlay's version from `${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json`.

## O5. GovStack content

Read `${CLAUDE_PLUGIN_ROOT}/references/govstack-model.md` before any judgement about GovStack requirements. Building blocks and their specification URLs are in `${CLAUDE_PLUGIN_ROOT}/references/building-blocks.yaml`.

Framework ids:

- `govstack-cfr`: the core cross-functional requirements, installed by `/govkit-govstack:apply`.
- `govstack-bb-<id>`: one building block's functional requirements and CFR extensions, written by `/govkit-govstack:bb add <id>`.

Resolve both through GovKit's content layers (contract §2). Never edit a file whose first line is `# govkit-overlay govkit-govstack@…`. The overlay owns it, and `apply` or `bb refresh` regenerates it.
