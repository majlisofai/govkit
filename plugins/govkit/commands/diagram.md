---
description: "Create a governed draw.io architecture diagram (DGRM, multi-instance): ArchiMate, C4, data-flow, process or sequence view as an editable .drawio file plus exported SVG/PNG, in the profile's diagram style — or convert an ArcKit Mermaid/PlantUML diagram with --from. Replaces /arckit:diagram when tools.diagrams is drawio."
doc-type: DGRM
argument-hint: "<project ID or name> <view type and subject, e.g. 'archimate application cooperation booking'> | --from <ARC document ID>"
effort: high
handoffs:
  - command: arckit:hld-review
    description: Reference the diagram in the high-level design review.
  - command: govkit:evidence
    description: Diagrams are evidence for architecture-documentation controls.
allowed-tools:
  - Read(/${CLAUDE_PLUGIN_ROOT}/**)
  - Bash(bash ${CLAUDE_PLUGIN_ROOT}/scripts/bash/create-project.sh *)
  - Bash(node ${CLAUDE_PLUGIN_ROOT}/scripts/generate-gov-id.mjs *)
  - Bash(node ${CLAUDE_PLUGIN_ROOT}/scripts/validate-drawio.mjs *)
  - Bash(bash ${CLAUDE_PLUGIN_ROOT}/scripts/export-drawio.sh *)
---

## User Request

```text
$ARGUMENTS
```

Follow `${CLAUDE_PLUGIN_ROOT}/references/govkit/artefact-procedure.md`. **Type**: DGRM (multi-instance, `diagrams/`). **Template**: `diagram`. Draw by following the `drawio-diagrams` skill in `${CLAUDE_PLUGIN_ROOT}/skills/drawio-diagrams/SKILL.md`.

If the profile's `tools.diagrams` is `mermaid` or `plantuml`, say that `/arckit:diagram` is the configured tool and stop, unless the user explicitly asked for draw.io.

**Inputs** (P3). Required: a view type and subject, or `--from <ARC document ID>`. Optional: the project's ArcKit `REQ`, `HLDR`, `DLDR`, `DATA`, `DIAG`, `DFD` and `ADR`, plus `projects/000-global/ARC-000-PRIN-*`.

**Content**:

1. **Choose the view.**

   | Request mentions | Notation and view |
   |------------------|-------------------|
   | capability, motivation, layered, application cooperation, technology | ArchiMate 3.2 viewpoint |
   | context, container, component | C4 at that level |
   | data flow, DFD, trust boundary | flow (DFD) |
   | process, workflow | flow |
   | sequence, interaction | sequence |

   If the request is ambiguous, ask once with AskUserQuestion.
2. **With `--from`:**
   1. Read the ArcKit artefact and extract every ```` ```mermaid ```` and `@startuml` block.
   2. If there is more than one, ask which ones to convert. One page per block is the default.
   3. Convert each one as the skill's "Converting" section describes.
   4. Record the source document ID and block heading in the artefact.
   ArcKit's file stays unchanged.
3. **Model.** Build the element and relationship tables (skill §2). Every element cites its source artefact section.
4. **Filenames.** P5 gives `diagrams/GOV-<PID>-DGRM-<NNN>-v<V>.md`. The diagram is the same stem with `.drawio`. Exports add `.svg` or `.png` after `.drawio`.
5. **Draw.** Resolve the style: `tools.drawio.style`, where `brand` means the brand's `diagrams.drawio_style` (skill §1), lay out (§3), and write the `.drawio` with the Write tool (§4).
6. **Validate and export** (skill §5). Pass `--grid <page.grid>` to the validator. For export, use `tools.drawio.export` if it is set, otherwise the style's `export.formats`. Look at the PNG if one was produced, and fix layout problems before continuing.
7. **Render the artefact** from the template. Include the view, notation and style, the element and relationship tables, a link to the `.drawio` file, and an image embed of the `.drawio.svg` or `.drawio.png` when it exists. Add the validator's summary line and a note to open or edit the diagram in draw.io (desktop, or app.diagrams.net) or the VS Code Draw.io Integration extension.

**Report** (P8): the paths of the `.md`, `.drawio` and exports, the element and relationship counts, the validator result, and whether export ran or was skipped (draw.io desktop not installed).
