# Brand

A brand is `brands/<id>/brand.yaml` with an `assets/` folder. Start from [`brands/_template/brand.yaml`](https://github.com/majlisofai/govkit/blob/main/plugins/govkit/brands/_template/brand.yaml).

**Required:** `id`, `kind`, `name`, `colours` (`paper`, `ink`, `ink_muted`, `accent`, `on_accent`, `rag`, `text_pairs`), `typography.text` and `diagrams.drawio_style`.

## Surfaces

| Surface | Fields used |
|---------|-------------|
| GOV-* Markdown artefacts | `documents.*`, `voice.*`, `logo.symbol` |
| draw.io diagrams and team matrices | `diagrams.drawio_style` |
| Mermaid that GovKit writes | `diagrams.mermaid_init`, `diagrams.mermaid_classes` |
| `/arckit:pages` dashboard | `colours`, `typography`, `logo`, when `arckit.pages: true` |
| `/arckit:presentation` MARP decks | `colours`, `typography`, `logo`, when `arckit.presentation: true` |

A brand never changes Document Control fields, document IDs, section order or the content of findings.

## Identity

| Field | Description |
|-------|-------------|
| `id` | Lowercase and hyphenated. Equal to the folder name. |
| `kind` | `brand` |
| `brand_version` | Bumped on every change |
| `name`, `short_name`, `tagline` | |
| `descriptor` | Optional sub-brand or line of work, shown beside the name |
| `source.guideline`, `source.design_system` | Where the brand came from |

## `colours`

| Field | Description |
|-------|-------------|
| `paper`, `poche`, `poche_strong` | Surfaces |
| `ink`, `ink_muted` | Text |
| `linework`, `hairline`, `border` | Lines. `linework` is never used for text. |
| `accent`, `on_accent` | Focal colour, and text on it |
| `link` | |
| `rag.red`, `rag.amber`, `rag.green` | |
| `chart[]` | Categorical chart colours |
| `dark.*` | Dark-theme values for `paper`, `ink`, `ink_muted`, `accent` |
| `text_pairs[]` | `[foreground, background]` pairs that must meet WCAG AA 4.5:1. Dotted names such as `rag.red` are allowed. |

## `typography`

| Field | Description |
|-------|-------------|
| `display`, `label`, `text`, `code` | `family`, `weight`; `label` may set `case: upper` |
| `hand` | Annotation face, with a `use` rule |
| `fallback` | CSS fallback stack |
| `google_fonts` | Stylesheet URL added to ArcKit's dashboard |
| `banned` | Families never to use |

## `logo`

| Field | Description |
|-------|-------------|
| `symbol` | Default, for light grounds |
| `symbol_reversed` | For dark grounds |
| `symbol_mono` | Under 24 px, print |
| `lockup` | First contact only: covers, proposal first pages |
| `alt` | Alt text |
| `rules[]` | Usage rules |

Paths are relative to the brand folder, for example `assets/symbol.svg`.

## `voice`

| Field | Description |
|-------|-------------|
| `persona` | The voice GOV artefacts are written in |
| `pronouns` | |
| `titles` | Title case rule |
| `technical_writing` | Standard for procedures, for example ASD-STE100 |
| `rules[]` | Writing rules |
| `banned_terms[]` | Terms that must not appear anywhere in a GOV artefact |

## `documents`

| Field | Description |
|-------|-------------|
| `header` | Line under the H1 title. Placeholders: `{logo_path}`, `{logo_alt}`, `{name}`, `{descriptor}`, `{descriptor_sep}`, `{doc_id}`. Empty for no header. |
| `header_logo` | `symbol`, `lockup` or `none` |
| `status_labels[]` | Document status words |
| `rag_format` | For example `"{glyph} {word}"` |
| `rag_glyphs` | `red`, `amber`, `green` glyphs |
| `date_format`, `number_format` | |
| `callout` | Template with `{title}`, `{body}`, `{action}` |
| `footer` | Last line. Placeholders: `{name}`, `{classification}`, `{doc_id}`. |

`{logo_path}` is relative from the artefact to `projects/000-global/brand/<logo file>`. `{descriptor_sep}` is ` · ` when a descriptor is set.

## `diagrams`

| Field | Description |
|-------|-------------|
| `drawio_style` | A diagram-style id |
| `mermaid_init` | `%%{init: …}%%` block that starts every Mermaid diagram GovKit writes |
| `mermaid_classes` | `classDef` lines, for example `focal` and `context` |

## `arckit`

| Field | Description |
|-------|-------------|
| `pages` | Theme the `/arckit:pages` dashboard |
| `presentation` | Theme `/arckit:presentation` MARP decks |

## Built-in brands

| Field | `tmofai` | `neutral` |
|-------|----------|-----------|
| `name` | The Majlis of AI | the profile's `organisation.name` |
| `colours.ink` / `accent` | <span class="swatch" style="background:#111111"></span>`#111111` / <span class="swatch" style="background:#CC3A1C"></span>`#CC3A1C` | <span class="swatch" style="background:#1F1F1F"></span>`#1F1F1F` / <span class="swatch" style="background:#1D5FA8"></span>`#1D5FA8` |
| `colours.rag` | <span class="swatch" style="background:#A82F18"></span><span class="swatch" style="background:#7E5300"></span><span class="swatch" style="background:#2E6B47"></span> | <span class="swatch" style="background:#B3261E"></span><span class="swatch" style="background:#7A5200"></span><span class="swatch" style="background:#1E6B3A"></span> |
| `typography.text` | IBM Plex Sans | system-ui |
| `documents.rag_format` | `{glyph} {word}` (▲ ◆ ●) | `{word}` |
| `documents.header_logo` | `symbol` | `none` |
| `diagrams.drawio_style` | `tmofai` | `standard` |
| `arckit.pages` / `presentation` | true / true | false / false |
