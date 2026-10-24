# How to add or refresh a GovStack building block

This guide shows you how to bring one building block's requirements into GovKit as a framework, and how to update it when GovStack publishes a new version.

## Add a building block

1. See which building blocks exist and which you already have:

    ```text
    /govkit-govstack:bb list
    ```

2. Add one by its id or name:

    ```text
    /govkit-govstack:bb add payments
    ```

    To pin a specification version, add `--version 3.0.0`.

3. Review the summary GovKit shows: the specification version, counts of REQUIRED and RECOMMENDED requirements, the Key Functionalities, and any notes. A note says, for example, that a requirement had no classifier and took GovStack's default, or that the specification still uses MUST/SHOULD wording. Confirm to write `.govkit/frameworks/govstack-bb-payments.yaml`.
4. If you want the building block crosswalked to your other frameworks, run `/govkit:crosswalk <project>`.

You don't need to activate a building-block framework in the profile. `/govkit-govstack:compliance` reads it directly.

## Refresh a building block

```text
/govkit-govstack:bb refresh payments
```

GovKit shows requirements added, removed, reworded and reclassified. A change of REQUIRED or RECOMMENDED, or of mutability, means GovStack released a new version. Re-run compliance assessments that used the old one.

## If the specification has not been aligned with GovStack 2.0.0

Some building blocks were still being aligned with the 2.0.0 classifier model during 2026. GovKit maps MUST and SHALL to REQUIRED, and SHOULD to RECOMMENDED, and records the original keyword in each requirement. Check those mappings before relying on a verdict.

For the fields of the framework file, see the [GovStack overlay reference](../../reference/govstack-overlay.md#building-block-frameworks).
