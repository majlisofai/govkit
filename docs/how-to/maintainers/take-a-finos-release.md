# How to take a new FINOS release

This guide shows maintainers how to move the `govkit-finos` module to newer FINOS AI Governance Framework content. The module is pinned to one commit of `finos/ai-governance-framework` in `upstream/finos.lock.json`.

1. See what has changed upstream:

    ```bash
    python3 scripts/check-finos.py --ref main
    ```

    Use `--ref v3` for a tag. Set `GH_TOKEN` if GitHub rate-limits you. Each `DRIFT` line names a field in `finos-aigf.yaml` or `risk-catalogue.yaml` that differs from FINOS.

2. Update `plugins/govkit-finos/frameworks/finos-aigf.yaml` and `plugins/govkit-finos/references/risk-catalogue.yaml` until the check reports no drift:

    | FINOS change | Do |
    |--------------|----|
    | New mitigation | Add a control: FINOS `title`, `group`, `obligation`, `attributes`, `mappings` and `citation_url`. Write a one-sentence `intent` in your own words and choose `evidence_hints` from ArcKit or GovKit doc-type codes. |
    | New risk | Add a risk: FINOS fields as given. Write the `summary` in your own words and choose `triggers`. Add a trigger to the `triggers` list at the top only when no existing one fits. |
    | Changed `mitigates` | Update the control's `attributes.mitigates` and every affected risk's `mitigated_by` |
    | Draft became approved | Set `obligation: recommended` or `status: approved` |
    | Title, reference or URL change | Copy it |
    | Removed item | Remove it, and check that `references/finos-model.md` names no removed id |

    Never copy FINOS's description text into `intent` or `summary`. FINOS content is CC BY 4.0, and GovKit paraphrases.

3. Re-run the check against the new ref until it prints `0 difference(s)`.

4. Update `upstream/finos.lock.json`: `ref`, `commit` (the full SHA the check ran against), `version`, and `synced_at`. Set `verified` in `finos-aigf.yaml` to today.

5. Update the counts that the docs and tests state: `tests/finos.test.mjs`, `docs/reference/finos-module.md`, the module README, and the counts in the tutorial and in `examples/finos/README.md` if the sample system's applicable risks change.

6. Run all the checks:

    ```bash
    node scripts/sync-arckit.mjs --check && node scripts/check-compat.mjs && python3 scripts/validate-content.py && node scripts/release.mjs check && node --test tests/
    ```

7. Bump the module and describe the change:

    ```bash
    node scripts/release.mjs bump govkit-finos minor
    ```

    Fill in the `## govkit-finos X.Y.Z` stub in `CHANGELOG.md`, naming the FINOS commit and the risks and mitigations added or changed. See [Release a new version](release-govkit.md).

Repositories pick up the new content when they run `/govkit-finos:apply` after upgrading the module. Existing FNRA artefacts keep the catalogue they were assessed against, which their External References record.
