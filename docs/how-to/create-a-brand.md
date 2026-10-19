# How to create your own brand

This guide shows you how to make GovKit present every output (GOV documents, draw.io diagrams, team matrices, and ArcKit's dashboard and decks) in your organisation's house style.

## Create the brand

1. Run the skill with the richest source you have:

    === "From a guideline document"

        ```text
        /govkit:create-brand acme --from brand-guidelines.pdf
        ```

        `.docx` and `.md` also work. Colours given as RGB, CMYK or Pantone are converted to hex and marked approximate.

    === "From a website"

        ```text
        /govkit:create-brand acme --from https://design.acme.example
        ```

        GovKit also looks for a CSS file or design tokens on the site.

    === "From a design system or skill"

        ```text
        /govkit:create-brand acme --from https://claude.ai/artifact/…
        /govkit:create-brand acme --from brand-acme
        ```

    === "By interview"

        ```text
        /govkit:create-brand acme
        ```

        GovKit asks one question at a time: name and tagline, colours, fonts, logo, tone, words to avoid, and status labels.

2. Choose where the brand lives when GovKit asks, or pass the flag:

    | Flag | Writes to | Use when |
    |------|-----------|----------|
    | `--project` | `.govkit/brands/<id>/` | Only this repository uses the brand |
    | `--central` | the organisation layer named by `extends:` | Several repositories share it. See [Share configuration across repositories](share-configuration-across-repositories.md). |

3. Name your logo files when GovKit asks. Prefer SVG. GovKit copies them unchanged into the brand's `assets/`, and rejects any SVG that contains scripts, event handlers, `<foreignObject>` or external links.
4. Review the list of fields that GovKit filled from the `neutral` brand because your source didn't give them. Tell GovKit any values you want instead.

## Resolve the checks

GovKit checks the brand before it activates it.

- **If a contrast pair fails**, GovKit proposes the nearest shade that passes WCAG AA (4.5:1). Accept it, or give your own value. GovKit never changes a brand colour without asking.
- **If the diagram preview looks wrong**, say what to change. The preview is a small ArchiMate diagram in the new diagram style. It is skipped if draw.io desktop is not installed.
- **Confirm the document preview** (header line, RAG line and callout) and the **voice rules and banned terms**.

## Activate the brand

1. GovKit sets `brand: acme` in the profile you chose.
2. Run:

    ```text
    /govkit:apply
    ```

    This publishes the logo to `projects/000-global/brand/` for document headers, and re-themes ArcKit's `/arckit:pages` dashboard and `/arckit:presentation` decks.

3. Regenerate any GOV artefact that should carry the new brand. Existing artefacts keep their old presentation until you do.

For every field you can set, see the [brand reference](../reference/brand.md).
