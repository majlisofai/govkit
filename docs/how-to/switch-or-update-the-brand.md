# How to switch or update the brand

This guide shows you how to change which brand GovKit uses, and how to change an existing brand.

## Switch to another brand

For one repository:

```text
/govkit:profile set brand neutral
/govkit:apply
```

`neutral` turns house style off: no logo, system fonts, standard notation colours and stock ArcKit presentation. `tmofai` is the default.

For every repository at once, set `brand:` in the organisation profile that the repositories `extends:`, then run `/govkit:apply` in each repository. If a repository sets `brand:` in its own profile, that value wins. Remove it to follow the central brand.

## Change an existing brand

1. Run the skill with the brand's id:

    ```text
    /govkit:create-brand acme
    ```

2. Say what to change, for example "make the accent #0B5FFF" or "add 'utilise' to the banned terms". GovKit changes only that, bumps `brand_version`, and runs the checks again.
3. Run `/govkit:apply`.
4. Regenerate the GOV artefacts that should show the change.

## Change diagram styling only

To keep the brand but draw diagrams in a different style, set:

```text
/govkit:profile set tools.drawio.style standard
```

See [Use your own diagram style](use-your-own-diagram-style.md).

## Stop theming ArcKit's dashboard or decks

Set `arckit.pages: false` or `arckit.presentation: false` in the brand's `brand.yaml`, then run `/govkit:apply`. It removes GovKit's override of that template, so ArcKit's stock template applies again.
