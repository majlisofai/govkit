# How to set up the FINOS module

This guide shows you how to add FINOS AI Governance Framework risk assessment to a repository that already uses GovKit. If you are new to the module, start with the tutorial [Your first FINOS AI risk assessment](../../tutorials/first-finos-risk-assessment.md).

1. Install GovKit's FINOS module from the GovKit marketplace. It needs GovKit 0.4.0 or later.

    ```bash
    claude plugin install govkit-finos@majlisofai
    ```

    For a team repository, also add `"govkit-finos@majlisofai": true` to `enabledPlugins` in `.claude/settings.json`. See [Share GovKit with your team](../share-govkit-with-your-team.md).

2. Apply it, and activate the FINOS framework:

    ```text
    /govkit-finos:apply --activate
    ```

    This registers the module's artefact type (FNRA) in `.govkit/doc-types.json`, installs `finos-aigf` into `.govkit/frameworks/`, and adds it to `frameworks.active`.

    To share the framework across repositories, add `--central`. The framework goes into the organisation layer named by `extends:`. The doc type is always written to each repository, because GovKit's filename hook reads it there.

3. Run `/govkit:profile validate`. Every check should PASS.

## Choose the primary framework

`finos-aigf` is usually a secondary framework next to ISO/IEC 42001, which stays `frameworks.primary`. The crosswalk then uses FINOS's own ISO/IEC 42001 references. To build the control register from FINOS's mitigations instead, run `/govkit:profile set frameworks.primary finos-aigf`.

## Set the risk appetite

`/govkit-finos:risk-assess` rates inherent and residual risk with the profile's risk method (`methods.risk`, default `iso31000-5x5`), and compares residual risk with that method's appetite (default Medium). To use your organisation's scales, bands or appetite, see [Use your own method](../use-your-own-method.md).

## After upgrading the module

Run `/govkit-finos:apply` again. It refreshes every file whose first line is `# govkit-overlay govkit-finos@…` and leaves the rest alone.

## If you want to edit the FINOS framework

Delete the `# govkit-overlay` first line from `.govkit/frameworks/finos-aigf.yaml`. The file is then yours, and `apply` will show you the diff of future changes instead of overwriting them. You can tighten an intent, add evidence hints, or add your own controls. Keep FINOS's `mi-<n>` ids for FINOS mitigations, because the risk catalogue refers to them.

Next: [assess an AI system against the FINOS risks](assess-ai-system-risk.md).
