# Diagrams as draw.io files

ArcKit draws diagrams in Mermaid. GovKit, by default, draws them as draw.io files. This page explains why, and why GovKit validates and tests its diagrams so carefully.

## Why not Mermaid

Mermaid is excellent for diagrams written inline, in Markdown, by developers. Its text is easy to diff and it renders anywhere that supports it. But governance diagrams have different readers and a different life:

- **They get edited by people who don't write code.** Architects and governance leads adjust layouts by hand before a board meeting. draw.io is a visual editor that they already know. Mermaid's text is not.
- **Layout matters.** In an ArchiMate view, the layers are meant to run top to bottom. In a C4 container diagram, the person goes on top. Mermaid's automatic layout decides placement for you, and for these notations it often decides wrongly.
- **Notations need real stencils.** draw.io ships the full ArchiMate 3.2 and C4 shape libraries. Mermaid approximates them.
- **They must carry a brand.** A diagram style in draw.io can set every font, stroke and fill, and add a title block with the organisation's symbol.

So GovKit's default is `tools.diagrams: drawio`. Mermaid isn't removed. Mermaid that ArcKit writes inside its own artefacts stays, `/govkit:diagram --from` converts it when you want draw.io, and a profile can choose Mermaid again.

## Why the .drawio file is the deliverable

An exported SVG or PNG is convenient for embedding, but it is a picture. The `.drawio` file is the model: editable, diffable as XML, and openable in the desktop app, the browser or VS Code. That is why GovKit still succeeds when draw.io desktop isn't installed and export is skipped. The exports GovKit does produce embed the diagram, so even a `.drawio.svg` opens for editing.

## Why validate generated XML

A language model writing draw.io XML can produce files that look plausible but are subtly broken: a duplicated cell id, an edge pointing at a cell that doesn't exist, a compressed diagram that draw.io can't diff. draw.io itself is forgiving and may open such a file and silently drop the broken parts. That is worse than failing.

`validate-drawio.mjs` catches these before the file is committed, along with layout problems such as overlapping shapes and positions off the grid. It has no dependencies, because plugins are never `npm install`ed, so it uses a small tokenizer rather than a full XML parser. draw.io's uncompressed format is regular enough for that.

## Why every stencil is render-tested

Every style string in the built-in diagram styles has been rendered with the draw.io desktop CLI. draw.io accepts unknown style values without complaint, so a misspelt stencil name gives a plain box, not an error. The rule that the skill never invents stencil names, and the requirement that custom styles use only stencils that have been rendered, both follow from this. A shape that isn't covered becomes an honest rounded rectangle with a «stereotype» label, rather than a guess that might render as anything.

## Why every element cites a source

Each element in a governed diagram traces to an ArcKit artefact section or to the user's request, and the traceability is stored in the diagram itself as a tooltip. A diagram in a gate pack is evidence. If an element can't be traced, a reviewer can't tell whether it reflects the design or the drawer's assumption.
