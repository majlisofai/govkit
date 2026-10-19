---
name: drawio-diagrams
description: "Writes architecture diagrams as editable draw.io (.drawio) files — ArchiMate 3.2, C4, data-flow, process and sequence views — in valid uncompressed mxGraph XML with the GovKit profile's diagram style, then validates and exports them. Use whenever a diagram is needed and the GovKit profile has tools.diagrams: drawio (the default), when editing *.drawio files, or when converting Mermaid/PlantUML diagrams to draw.io. Not for quick inline sketches when the profile chose mermaid."
paths:
  - "**/*.drawio"
  - "**/GOV-*-DGRM-*.md"
allowed-tools:
  - Read(/${CLAUDE_PLUGIN_ROOT}/**)
  - Bash(node ${CLAUDE_PLUGIN_ROOT}/scripts/validate-drawio.mjs *)
  - Bash(bash ${CLAUDE_PLUGIN_ROOT}/scripts/export-drawio.sh *)
---

# draw.io Diagrams

When the GovKit profile says `tools.diagrams: drawio`, architecture diagrams are **draw.io files**, not Mermaid. Mermaid blocks inside ArcKit artefacts are left as ArcKit writes them. A governed draw.io diagram comes from `/govkit:diagram`, which can also convert those Mermaid blocks (`--from`).

## 1. Resolve the style

1. Read the profile (`${CLAUDE_PLUGIN_ROOT}/references/govkit/runtime-contract.md` §1) and take `tools.drawio.style`. If it is `brand` (the default), resolve the profile's `brand:` (contract §2) and use the brand's `diagrams.drawio_style`.
2. Load `diagram-styles/<id>.yaml` through the three layers in contract §2: project, organisation, then built-in.
3. Build every cell style from that file and nothing else:
   - **Vertex:** `base.vertex` + `notations.<notation>.<element>`, plus `states.<state>` if one applies.
   - **Edge:** `base.edge` + `notations.<notation>.relationships.<rel>`, plus a state.
   - Fill the `{type}`, `{form}` and `{fill}` placeholders from `references/notations.md`.

   Don't invent stencil names. A shape not covered by the style or the catalogue is a plain rounded rectangle with a «stereotype» label.

## 2. Plan before drawing

Write the model as a table first, and keep it, because `/govkit:diagram` puts it in the GOV artefact:

| ID | Element | Notation element | Layer / boundary | State |
|----|---------|------------------|------------------|-------|

| ID | From | To | Relationship | Label |
|----|------|----|--------------|-------|

- Every element traces to a source: an ArcKit artefact section, or the user's request.
- ArchiMate relationships must be valid in ArchiMate 3.2. Common patterns are in `references/notations.md`. If you are unsure, use `association` and flag it.
- Use one viewpoint per page, at most about 20 elements per page. Split a larger view into pages of the same file.

## 3. Lay out

- Use the style's `page`, `element_size` and `spacing`. Snap every x and y to `page.grid`.
- **ArchiMate:** use horizontal layer bands, top to bottom: Motivation/Strategy, Business, Application, Technology, Implementation. Each band is a background vertex, and its elements sit inside it. Use the style's `layer_band` if it has one.
- **C4:** person on top, system or containers in the middle, external systems at the side or bottom. Draw a boundary as a container vertex that holds its children. The children's `parent` is the boundary id and their geometry is relative to it.
- **Flow / DFD:** left to right. Trust boundaries are containers.
- **Sequence:** lifelines in a row. Each message is an edge with `sourcePoint` and `targetPoint` at increasing y.
- Order elements to minimise edge crossings. Add `<Array as="points">` waypoints rather than letting edges cross elements.
- If the style has `sheet.drawing_area`, keep the drawing inside it.
- If the style has `sheet.title_block: true`, draw the title block in the space to the right of the drawing area. It holds:
  - the brand symbol, as an image cell with style `shape=image;image=data:image/svg+xml,<base64 of logo.symbol>;` at 48×48
  - `name` and `descriptor`
  - the document ID, date and status (from `documents.status_labels`)
  - the sheet title

  Use the brand's colours and fonts only.

## 4. Write the XML

Use uncompressed XML only. A `<diagram>` that contains base64 text is invalid.

```xml
<mxfile host="govkit" agent="GovKit" version="24.0.0">
  <diagram id="p1-context" name="Context">
    <mxGraphModel dx="1920" dy="1080" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1"
                  page="1" pageScale="1" pageWidth="1920" pageHeight="1080" background="#FFFFFF" math="0" shadow="0">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        <mxCell id="p1-app" value="Booking Service" style="…vertex style…" vertex="1" parent="1">
          <mxGeometry x="200" y="200" width="160" height="80" as="geometry"/>
        </mxCell>
        <mxCell id="p1-db" value="Bookings DB" style="…" vertex="1" parent="1">
          <mxGeometry x="440" y="200" width="160" height="80" as="geometry"/>
        </mxCell>
        <mxCell id="p1-e1" value="reads/writes" style="…edge style…" edge="1" parent="1" source="p1-app" target="p1-db">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

Rules:
- Cell ids are unique per page. Prefix them with the page id.
- Every `parent`, `source` and `target` must exist on the same page.
- Escape `&`, `<`, `>` and `"` in `value`. Use `&#xa;` for a line break, or `html=1` with `<br>`, escaped.
- To record traceability, give each element the source artefact ID in a `tooltip` attribute. That needs the `<object label="…" tooltip="…" id="…"><mxCell …/></object>` wrapper form.

## 5. Validate and export

1. Run `node ${CLAUDE_PLUGIN_ROOT}/scripts/validate-drawio.mjs <file> --grid <page.grid>`. Fix every FAIL, and every overlap or off-grid WARN unless it is intentional.
2. Run `bash ${CLAUDE_PLUGIN_ROOT}/scripts/export-drawio.sh <file> <style export.formats…>`. This writes `<file>.svg` and/or `<file>.png` with the diagram embedded, so they stay editable.
   - Exit 3 means draw.io desktop is not installed. Say so and continue, because the `.drawio` file is the deliverable.
   - Other non-zero exits are failures. Report them.
3. If export succeeded and the PNG is available, read it to check the layout: no overlapping labels, no edges through elements, and readable text. Fix the XML and re-export if needed.

## Converting Mermaid or PlantUML

- Map each node to an element and each arrow to a relationship, using the notation the source implies. A Mermaid `C4Context` becomes C4. A `flowchart` becomes flow. An `erDiagram` becomes flow, with a `data_store` per entity and the attributes listed in the label. A `sequenceDiagram` becomes sequence.
- Keep the labels verbatim.
- Re-lay out on the grid rather than copying Mermaid's auto-layout.
