# How to set up the GovStack overlay

This guide shows you how to add GovStack building-block governance to a repository that already uses GovKit.

1. Install the overlay. It needs GovKit 0.4.0 or later.

    ```bash
    claude plugin install govkit-govstack@majlisofai
    ```

    For a team repository, also add `"govkit-govstack@majlisofai": true` to `enabledPlugins` in `.claude/settings.json`. See [Share GovKit with your team](../share-govkit-with-your-team.md).

2. Apply it, and activate the core GovStack framework:

    ```text
    /govkit-govstack:apply --activate
    ```

    This registers the overlay's two artefact types (GSBB and GSCA) in `.govkit/doc-types.json`, installs `govstack-cfr` into `.govkit/frameworks/`, and adds it to `frameworks.active`.

    To share the framework across repositories, add `--central`. The framework goes into the organisation layer named by `extends:`. The doc types are always written to each repository, because GovKit's filename hook reads them there.

3. Run `/govkit:profile validate`. Every check should PASS.

## After upgrading the overlay

Run `/govkit-govstack:apply` again. It refreshes every file whose first line is `# govkit-overlay govkit-govstack@…` and leaves the rest alone.

## If you want to edit the GovStack framework

Delete the `# govkit-overlay` first line from `.govkit/frameworks/govstack-cfr.yaml`. The file is then yours, and `apply` will show you the diff of future changes instead of overwriting them.

Next: [map a project to building blocks](map-a-project-to-building-blocks.md).
