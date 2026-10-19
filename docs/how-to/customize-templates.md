# How to customize templates

This guide shows you how to change the structure of the documents GovKit writes, and how GovKit changes the documents ArcKit writes.

## Change a GovKit artefact template

1. Copy the template from [`plugins/govkit/templates/`](https://github.com/majlisofai/govkit/tree/main/plugins/govkit/templates) to `.govkit/templates-custom/`, keeping its name. For example, `assessment-template.md`.
2. Edit it. Keep:
    - the `<!-- DOC-CONTROL-HEADER -->` marker
    - the section headings that the command fills in
    - placeholders such as `[VERSION]`, `[GOVKIT_VERSION]` and `[ARCKIT_VERSION]`
3. Run the command again. It writes a new version of the artefact from your template.

To use the template in every repository, put it in the organisation layer's `templates-custom/`.

## Change an ArcKit artefact template

If you want GovKit to manage the override, so that it keeps up with new ArcKit releases:

1. Add the template name to the profile:

    ```yaml title=".govkit/profile.yaml"
    tools:
      arckit:
        template_overrides: [risk-register, requirements]
    ```

2. Make sure a rule for that template exists in [`references/govkit/arckit-overrides.md`](https://github.com/majlisofai/govkit/blob/main/plugins/govkit/references/govkit/arckit-overrides.md). Rules ship for `risk-register`, `architecture-principles`, `requirements`, `pages` and `presentation`. A name without a rule is reported as unsupported.
3. Preview, then apply:

    ```text
    /govkit:apply --dry-run
    /govkit:apply
    ```

`/govkit:apply` builds each override from the current ArcKit template every time. Re-run it after each ArcKit upgrade.

If you would rather write the override yourself, create `.arckit/templates-custom/<name>-template.md` by hand. GovKit leaves files without a `govkit-override` comment alone, and shows you the diff it would have made.

## Go back to stock ArcKit

Delete the file from `.arckit/templates-custom/` and remove its name from `tools.arckit.template_overrides`. `/arckit:customize` lists what is overridden.
