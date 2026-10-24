# How to add a command or artefact type to GovKit

This guide shows maintainers how to add a built-in command, artefact type or ArcKit template override to GovKit itself. To add a type in one repository only, see [Register a new artefact type](../register-an-artefact-type.md).

## Add a command

1. Create `plugins/govkit/commands/<name>.md` with frontmatter: `description`, `doc-type` (a GovKit code or `none`), `argument-hint`, `effort`, `handoffs` and `allowed-tools`. Copy an existing command such as `exception.md`.
2. For a command that writes an artefact, follow `references/govkit/artefact-procedure.md` (steps P1–P8). Refer to the steps by number. Don't restate them.
3. Every `arckit:<cmd>` you write must exist in `upstream/snapshot/commands.json`. Every ArcKit doc-type code must exist in `upstream/snapshot/doc-types.json`.
4. Take colours, fonts, logos, status words and diagram styling from the resolved brand. Never write them inline. A new output surface gets new brand fields.

## Add an artefact type

1. Check that the code doesn't collide with an ArcKit code in `upstream/snapshot/doc-types.json`.
2. Register it in `plugins/govkit/config/doc-types.mjs`, with `name`, `category` and `command`, and with `multiInstance`, `subdir` and `extensions` if needed.
3. Add the command, with a matching `doc-type:` in its frontmatter.
4. Add `plugins/govkit/templates/<name>-template.md`. Keep the `<!-- DOC-CONTROL-HEADER -->` marker.
5. Add the template mapping in `scripts/check-compat.mjs`.

## Add an ArcKit template override

Add a `## <arckit-template-name>` rule to `plugins/govkit/references/govkit/arckit-overrides.md`. The heading must match an ArcKit `<name>-template.md`. Say which sections change and what stays verbatim.

## Add a built-in framework

Paraphrase control intents only, and use titles only for paywalled standards. Set `verified`, and use doc-type codes in `evidence_hints`.

## Check

```bash
node scripts/sync-arckit.mjs --check && node scripts/check-compat.mjs && python3 scripts/validate-content.py && node scripts/release.mjs check && node --test tests/
```

Plugin scripts and hooks must be zero-dependency Node ESM, because plugins are cloned and never `npm install`ed. Repo tooling may use Python with PyYAML.
