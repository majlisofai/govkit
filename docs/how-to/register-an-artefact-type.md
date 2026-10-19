# How to register a new artefact type

This guide shows you how to add your own GOV artefact type in a repository, for example an AI Impact Assessment, without changing GovKit.

1. Choose an upper-case code that is not an ArcKit or GovKit code. GovKit's own codes use four letters. See the [doc types reference](../reference/doc-types.md) for the codes in use.
2. Create `.govkit/doc-types.json` at the repository root:

    ```json title=".govkit/doc-types.json"
    {
      "AIIA": {
        "name": "AI Impact Assessment",
        "category": "Assurance",
        "multiInstance": true,
        "subdir": "impact"
      }
    }
    ```

    Set `multiInstance` to `true` if a project can have several, numbered in `subdir`. For a type with companion files, add `"extensions": [".md", ".json"]`.

3. Optional: if you have a clone of GovKit, check that the ID generator accepts the code. Run it with `--root` set to your repository:

    ```bash
    node <govkit clone>/plugins/govkit/scripts/generate-gov-id.mjs 001 AIIA \
      --relpath --next-num projects/001-booking/impact --root .
    ```

    It prints `impact/GOV-001-AIIA-001-v1.0.md`. GovKit's filename hook accepts the same names.

4. Add a template at `.govkit/templates-custom/aiia-template.md`. Start from a GovKit template so that it keeps the `<!-- DOC-CONTROL-HEADER -->` marker.
5. To produce the artefact, either ask Claude to write it from that template, or write a command for it in your own small plugin that depends on `govkit`.

A built-in GovKit code always wins over a custom code with the same name.
