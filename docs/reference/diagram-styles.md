# Diagram styles

A diagram style is `diagram-styles/<id>.yaml`. It turns notation into draw.io style strings.

## Style composition

```text
vertex = base.vertex + notations.<notation>.<element>             [+ states.<state>]
edge   = base.edge   + notations.<notation>.relationships.<rel>   [+ states.<state>]
```

`{type}`, `{form}` and `{fill}` in a style string are filled from the [notation catalogue](https://github.com/majlisofai/govkit/blob/main/plugins/govkit/skills/drawio-diagrams/references/notations.md).

## Sections

| Section | Fields |
|---------|--------|
| `id`, `kind`, `name` | `kind: diagram-style` |
| `page` | `width`, `height`, `grid`, `background` |
| `element_size` | `width`, `height` |
| `spacing` | `horizontal`, `vertical` |
| `font` | `family`, `size` |
| `sheet` | Optional. `drawing_area` (`x`, `y`, `width`, `height`), `title_block` (boolean), `drawing_title_y` |
| `base` | `vertex`, `edge`, `title`, `note` |
| `notations.archimate` | `element`, `device`, `grouping`, `layer_fill.<layer>`, optional `layer_band`, `relationships.<rel>` |
| `notations.c4` | `person`, `software_system`, `external_system`, `container`, `database`, `component`, `boundary`, `relationships.uses` |
| `notations.flow` | `process`, `decision`, `terminator`, `data_store`, `external_entity`, `trust_boundary`, `relationships.flow` |
| `notations.sequence` | `lifeline`, `actor`, `relationships.call`, `relationships.reply` |
| `notations.team` | Team-matrix styles. See below. |
| `states` | `focal`, `context`, `out_of_scope`, optional `annotation_leader` |
| `export.formats` | `[svg]`, `[png]` or `[svg, png]` |

ArchiMate relationships: `composition`, `aggregation`, `assignment`, `realization`, `serving`, `access`, `influence`, `triggering`, `flow`, `specialization`, `association`.

ArchiMate layers in `layer_fill`: `strategy`, `motivation`, `business`, `application`, `technology`, `implementation`, `migration`, `location`.

## `notations.team`

Used by `render-team-matrix.mjs`. Missing keys fall back to neutral defaults.

| Key | Draws |
|-----|-------|
| `title`, `subtitle`, `text`, `text_center` | Text |
| `boundary` | Box around the streams |
| `stream_aligned`, `stream_header`, `mission` | Stream columns |
| `chapter_rail`, `chapter`, `chapter_cell` | Chapter rows and cells |
| `platform`, `platform_header`, `capability` | Platform team |
| `enabling`, `complicated_subsystem` | Other teams |
| `box` | Summary and legend boxes |
| `focal` | Overlay for a team with `focal: true` |
| `edge_x_as_a_service`, `edge_collaboration`, `edge_facilitating`, `edge_plain` | Interactions |
| `dot` | Member glyph, default `●` |

## Built-in styles

| Field | `standard` | `tmofai` |
|-------|------------|----------|
| `name` | Standard notation colours | The Majlis of AI — monochrome drawing sheet |
| `page` | 1920 × 1080, grid 10 | 1920 × 1080, grid 8 |
| `font` | Helvetica 12 | IBM Plex Sans 12 |
| `sheet` | — | drawing area 1184 × 720 at (64, 184), title block |
| ArchiMate fills | Standard layer colours | All `#FFFFFF`, layers told apart by bands |
| `states.focal` | `#B85450`, width 3 | `#CC3A1C`, width 3 |
| Team matrix | draw.io palette: streams blue, chapters yellow, platform green, enabling purple, complicated-subsystem red | Monochrome, redline focal team |
| `export.formats` | `[svg]` | `[svg, png]` |
