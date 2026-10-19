# How to fix a failing compatibility gate

This guide shows maintainers what to do when `check-compat.mjs`, `validate-content.py` or `sync-arckit.mjs --check` fails, usually after a new ArcKit release.

Find the failing check in the output, then:

| If this fails | It usually means | Do this |
|---------------|------------------|---------|
| `vendored` | A vendored ArcKit file was edited by hand | Revert the file. To change vendored files, only run `node scripts/sync-arckit.mjs`. |
| `versions` | `plugin.json` and `marketplace.json` disagree, the two `compat.json` files differ, or the locked ArcKit version is outside the tested range | Make the versions match, copy `upstream/compat.json` to `plugins/govkit/config/compat.json`, or [widen the tested range](take-an-arckit-release.md#widen-the-tested-range) |
| `arckit-refs` | ArcKit renamed or removed a command | Update the `arckit:<cmd>` reference in GovKit's commands, skills, recipe or frameworks |
| `govkit-refs` | A `govkit:<cmd>` reference names no GovKit command or skill | Fix the reference, or add the missing command |
| `overrides` | ArcKit renamed a template | Rename the rule heading in `references/govkit/arckit-overrides.md` to match the new `<name>-template.md` |
| `doc-types` | ArcKit added a code that GovKit also uses | Rename the GovKit code in `config/doc-types.mjs`, its command, template and the `check-compat.mjs` mapping, and add a migration note to `CHANGELOG.md` |
| `templates` | A GovKit doc type has no command or no template | Add the missing command or template, or the template mapping in `check-compat.mjs` |
| content: `… not an ArcKit doc type` | ArcKit renamed a code | Update `methods/lifecycles/*.yaml` and the frameworks' `evidence_hints` |

Then run all the checks again:

```bash
node scripts/sync-arckit.mjs --check && node scripts/check-compat.mjs && python3 scripts/validate-content.py && node --test tests/
```

For what each check verifies, see the [compatibility reference](../../reference/compatibility.md).
