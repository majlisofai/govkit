# ArcKit Template Override Rules

`/govkit:apply` uses these rules to change ArcKit templates. Each rule names the sections it may touch. Everything else is copied verbatim from the upstream template. To support another template, add a section here. Do not edit ArcKit.

## risk-register

Source: ArcKit `risk-register-template.md` (filled by `/arckit:risk`). Resolve the profile's `methods.risk` file first.

- **Likelihood and impact scales**: replace the scale tables or definitions with the risk method's `likelihood` and `impact` labels and values.
- **Risk scoring / rating bands**: replace them with the method's `bands`, including each band's `treatment`.
- **Risk appetite**: set the appetite statement to the profile's `methods.risk` appetite, or to the method's `appetite_default`.
- **Risk Response (4Ts)**: keep ArcKit's 4Ts headings; add the method's `treatments` mapping beneath them so both vocabularies appear.
- **Risk owner**: add a note that owners are assigned per the operating model's `artefact_ownership.RISK` role.

## architecture-principles

Source: ArcKit `architecture-principles-template.md`.

- Add a section after the existing principles, named **Governance Principles (GovKit)**. List one principle for each active framework's `type: principles` controls, with their source. Do not change ArcKit's own principle sections.

## requirements

Source: ArcKit `requirements-template.md`.

- In the non-functional requirements section, add a **Governance & Compliance (NFR-GOV-*)** subsection. It contains a table with columns ID, Requirement, Framework control and Evidence expected, plus one example row for each active framework. Leave every existing NFR category untouched.

## pages

Source: ArcKit `pages-template.html` (the `/arckit:pages` dashboard). Applied automatically when the resolved brand has `arckit.pages: true`, or when listed in `tools.arckit.template_overrides`. Brand fields come from contract §6.

- **`:root` custom properties**: change values only, and keep every property name. `--bg-page` and `--bg-surface` take `colours.paper`. `--bg-surface-alt`, `--bg-sidebar`, `--bg-code` and `--bg-hover` take `colours.poche`/`poche_strong`. `--bg-header` and `--bg-code-block` take `colours.ink`. `--text-primary` takes `colours.ink`. `--text-secondary` takes `colours.ink_muted`. `--text-inverse` and `--text-code-block` take `colours.paper`. `--text-link` and `--text-link-hover` take `colours.link` and `colours.accent`. `--border-main` takes `colours.border`. `--border-light` takes `colours.hairline`. `--color-success`, `--color-warning` and `--color-error` take `colours.rag.green`, `amber` and `red`. `--color-focus` takes `colours.accent`. If the brand has `colours.dark`, apply it to the template's dark-theme block the same way.
- **Fonts**: if `typography.google_fonts` is set, add `<link rel="stylesheet" href="…">` in `<head>`. Set the body `font-family` to `typography.text.family` followed by `typography.fallback`, and the code font to `typography.code.family`.
- **Header logo**: if `logo.symbol` exists, add an `<img>` before the site title in the header, 24px high, with `alt` set to `logo.alt`. The `src` is `brand/<file>`; `/govkit:apply` copies the logo into `docs/brand/`.
- Do not change any script, placeholder or structural element. ArcKit fills them in.

## presentation

Source: ArcKit `presentation-template.md` (MARP decks from `/arckit:presentation`). Applied when the brand has `arckit.presentation: true`, or when listed in `tools.arckit.template_overrides`.

- **MARP frontmatter**: keep `marp: true`, `theme` and `paginate`. Add a `style: |` block containing:
  - `section` background `colours.paper`, colour `colours.ink`, and font `typography.text.family`
  - `h1` and `h2` in `typography.display.family` at its weight
  - `strong` and `a` in `colours.accent`
  - an `@import url(…)` of `typography.google_fonts` when it is set
- **Footer**: prefix `logo.alt` before the existing `[CLASSIFICATION]` footer placeholder. Keep the placeholder.
- **Title slide**: if `logo.lockup` (or `logo.symbol`) exists, add `![w:160](../000-global/brand/<file>)` above the title. Decks are written in `projects/<NNN-name>/`, and `/govkit:apply` publishes the logo to `projects/000-global/brand/`.
- Keep every slide heading and `[PLACEHOLDER]` that ArcKit fills in.
