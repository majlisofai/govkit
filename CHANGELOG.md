# Changelog

## 0.2.0 — 2026-10-19

Tested against ArcKit 6.18.2.

- **Brand as central configuration.** The new profile key `brand:` (default `tmofai`, built-ins `tmofai` and `neutral`) controls the look and voice of all GovKit output:
  - GOV document header, status and RAG wording, voice and banned terms, and footer
  - the draw.io diagram style and Mermaid theming
  - via `/govkit:apply` and ArcKit's own `.arckit/templates-custom/`: ArcKit's `/arckit:pages` dashboard and `/arckit:presentation` MARP decks

  Brands resolve project → organisation layer (the directory of `extends:`) → built-in, so one change in the org profile rebrands every repository.
- **`create-brand` skill** (`/govkit:create-brand`). Builds a brand from a guideline (PDF, URL, design system, skill, logo files) or by interview. It checks WCAG contrast, renders a preview and activates the brand in the project or the central org profile.
- **draw.io replaces Mermaid as the diagram tool.** `tools.diagrams: drawio` (the new default) routes all diagram work to the new `/govkit:diagram` command (DGRM, multi-instance, `diagrams/`) and the `drawio-diagrams` skill:
  - covers ArchiMate 3.2, C4, flow/DFD and sequence
  - writes editable `.drawio` files with `.drawio.svg`/`.png` exports
  - `--from` converts Mermaid or PlantUML blocks in ArcKit artefacts

  `mermaid` and `plantuml` still route to `/arckit:diagram`.
- Diagram styles `standard` and `tmofai`, with every stencil render-tested on the draw.io CLI. Includes the full ArchiMate 3.2 stencil catalogue.
- New scripts: `validate-drawio.mjs` (zero-dependency structural validator), `export-drawio.sh` (draw.io desktop CLI, skips cleanly when absent), `check-contrast.mjs` (WCAG).
- Organisation layer for every content kind: methods, frameworks, brands, diagram styles and templates.
- The filename hook now covers `.drawio`, `.drawio.svg` and `.drawio.png` companions for types that declare them.

## 0.1.0 — 2026-10-19

Initial release. Tested against ArcKit 6.18.2.

- Plugin `govkit` with 15 commands, 2 skills, 3 agents, 2 hooks.
- Profile-driven approach, methods, frameworks and tools (`.govkit/profile.yaml`, project-first override of every method, framework and template).
- Built-in: Three Lines operating model, five-gate lifecycle, maturity 0–5 and RAG scales, ISO 31000-aligned 5×5 risk method, ISO/IEC 42001, NIST AI RMF 1.0 and ISO/IEC 38500 frameworks (paraphrased).
- `GOV-*` doc types: GMOD, APPL, ASMT, XWLK, CTRL, EVID, GATE, EXCP, BRPT.
- ArcKit integration through `.arckit/templates-custom/` and `.arckit/recipes/` (`govkit-baseline` recipe).
- Upstream tooling: `sync-arckit.mjs`, `check-compat.mjs`, `validate-content.py`, weekly upstream-watch workflow.
