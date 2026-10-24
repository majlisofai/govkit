# How to assess a solution against GovStack

This guide shows you how to self-assess a product or component against GovStack's requirements before procurement, a gate or a GovMarket application.

1. Make sure the frameworks exist:
    - `govstack-cfr`, from [setting up the module](set-up-the-govstack-overlay.md)
    - `govstack-bb-<id>` for the building block, from [adding a building block](add-a-building-block.md). Skip this to assess against the core cross-functional requirements only.
2. Gather evidence, matched to how each requirement is verified:

    | Requirement is | Gather |
    |----------------|--------|
    | OBSERVABLE | Results from the running system: API or UI test reports, GovStack compliance test-suite output, monitoring data |
    | AUDITABLE | Things to inspect: the repository, deployment manifests, ADRs, configuration, security audit reports, the SBOM |

    Documents alone never satisfy an OBSERVABLE requirement.

3. Run the assessment. Give the building block id, or `cfr`, and the solution's name:

    ```text
    /govkit-govstack:compliance 001 identity "National ID platform"
    ```

    Name any evidence paths outside the project when GovKit asks. If the project has an evidence register (`/govkit:evidence`), GovKit uses it.

4. Read the verdict in `govstack/GOV-001-GSCA-001-v1.0.md`:

    | Verdict | Means |
    |---------|-------|
    | Self-assessed compliant | Every in-scope REQUIRED requirement is met or not triggered |
    | Not compliant | At least one REQUIRED requirement is unmet. Each one is listed as a blocker. |

    RECOMMENDED coverage is reported as a percentage. It never changes the verdict.

5. Act on the gaps:
    - **If you will fix a blocker**, assign the owner and action in the artefact, then re-run the assessment when the evidence exists. GovKit writes the next GSCA in sequence.
    - **If you accept a gap for now**, record it with `/govkit:exception`. The requirement stays unmet and the verdict does not change.
    - **If a blocker is a delivery risk**, add it to the risk register with `/arckit:risk`.
6. Use the assessment at the next gate with `/govkit:gate`.

!!! warning "Self-assessment only"
    The verdict is GovKit's governance self-assessment. It is not GovStack certification and does not list the solution on GovMarket. Those come from GovStack's own compliance process and test platform.
