---
description: "Apply the GovKit profile and brand: publish brand logos, and theme and customize ArcKit through its own extension points (template overrides in .arckit/templates-custom/, build recipes in .arckit/recipes/). Idempotent; re-run after changing the brand or upgrading ArcKit."
doc-type: none
argument-hint: "[--dry-run] [template names...]"
effort: medium
handoffs:
  - command: arckit:build
    description: Run a GovKit recipe with ArcKit's build harness.
  - command: govkit:compat
    description: Check ArcKit version compatibility if a template could not be found.
allowed-tools:
  - Read(/${CLAUDE_PLUGIN_ROOT}/**)
---

## User Request

```text
$ARGUMENTS
```

You customize ArcKit without forking it. ArcKit reads `.arckit/templates-custom/<name>-template.md` before its own template and `.arckit/recipes/<name>.yaml` before its own recipes. Both directories survive ArcKit upgrades. You write to them only.

## Process

1. Read `${CLAUDE_PLUGIN_ROOT}/references/govkit/runtime-contract.md` and resolve the profile.
2. **Locate ArcKit core's templates.** GovKit is a separate plugin, so `${CLAUDE_PLUGIN_ROOT}` is GovKit's root, not ArcKit's. Glob in this order and take the highest version:
   - `${CLAUDE_PLUGIN_ROOT}/../../../arckit-claude/arckit/*/templates/` (marketplace cache)
   - `${CLAUDE_PLUGIN_ROOT}/../arckit/templates/` and `${CLAUDE_PLUGIN_ROOT}/../arckit-claude/templates/` (checkouts)
   - `.arckit/templates/` (ArcKit CLI installs)
   If none is found, stop and tell the user to install `arckit@arckit-claude`.
3. **Brand.** Resolve `brand:` (runtime contract §2 and §6), then:
   1. Copy the brand's logo files (`logo.*`) into `projects/000-global/brand/`, for GOV document headers. If `arckit.pages` is true, also copy them into `docs/brand/`. Overwrite earlier copies, and delete logo files left there by a previous brand. Also write `projects/000-global/brand/BRAND.md`, which names the brand id, `brand_version`, its source layer (project, organisation or built-in) and the date.
   2. Add `pages` to the override list when `arckit.pages` is true, and `presentation` when `arckit.presentation` is true. When either is false, remove a GovKit-made override of that template (one that carries the `govkit-override` comment), so ArcKit's stock template applies again.
4. **Template overrides.** For each name in the override list from step 3 plus `tools.arckit.template_overrides`, or in `$ARGUMENTS` if names are given:
   1. Read the upstream template, `<name>-template.md` or `<name>-template.html`.
   2. Read the transform rule in `${CLAUDE_PLUGIN_ROOT}/references/govkit/arckit-overrides.md` for that name. If no rule exists for the name, skip it and report it as unsupported.
   3. Produce the override. Copy the upstream template **verbatim**, then change only the sections that the rule names. Keep every heading, marker (`<!-- DOC-CONTROL-HEADER -->`, `[VERSION]` and the like) and table that ArcKit's command fills in. ArcKit's commands and quality checks depend on them.
   4. Prepend the provenance comment: `<!-- govkit-override name=<name> upstream=<arckit version> profile-hash=<first 8 chars of sha256 of the resolved profile> brand=<id>@<brand_version> -->`. In an `.html` template, place the comment after `<!doctype html>`.
   5. If `.arckit/templates-custom/<name>-template.{md,html}` exists **without** a `govkit-override` comment, the user wrote it by hand. Do not overwrite it: report it and show the diff you would have made.
5. **Recipes.** For each id in `tools.arckit.recipes`, read `${CLAUDE_PLUGIN_ROOT}/recipes/<id>.yaml`, or `.govkit/recipes/<id>.yaml` if present. Substitute nothing. Copy it to `.arckit/recipes/<id>.yaml` with the same provenance-comment rule. Remove any target whose `skill` is in `tools.arckit.commands.exclude`, along with any dependency on it.
6. With `--dry-run`, print the planned changes and write nothing.
7. Report a table with one row per template and recipe: created, updated, unchanged, skipped (hand-written) or unsupported.

## Notes

- Re-run after every ArcKit upgrade. The upstream template may have gained sections, and the provenance comment shows which ArcKit version each override was built from.
- To return to stock ArcKit behaviour, delete the override file. `/arckit:customize` lists what is overridden.
