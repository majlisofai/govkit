# GovStack Building Block Map

> **Template Origin**: GovKit GovStack overlay | **Overlay Version**: [OVERLAY_VERSION] | **GovKit Version**: [GOVKIT_VERSION] | **ArcKit Version**: [ARCKIT_VERSION] | **Command**: `/govkit-govstack:map`

## Document Control

<!-- DOC-CONTROL-HEADER -->
<!-- Resolved at command-execution time per GovKit's references/govkit/runtime-contract.md §4. -->

## Revision History

| Version | Date | Author | Changes | Approved By | Approval Date |
|---------|------|--------|---------|-------------|---------------|
| [VERSION] | [YYYY-MM-DD] | GovKit AI | Initial creation from `/govkit-govstack:map` | [PENDING] | [PENDING] |

## Profile Basis

| Setting | Value |
|---------|-------|
| Operating model | [approach.operating_model] |
| Frameworks | [frameworks.active — govstack-cfr and govstack-bb-* marked] |
| GovStack specification set | [architecture spec version; building-block spec versions known] |

## Executive Summary

[Services in scope, how many needs map fully or partly to GovStack building blocks, the foundational building blocks the project depends on, needs with no building block, and the recommended next commands.]

## Services and Needs

| Service | Life event / capability | Need | Source |
|---------|-------------------------|------|--------|
| [Business licence application] | [Starting a business] | [Verify the applicant] | [ARC-001-REQ-v1.0 FR-012] |

## Building Block Fit

| Need | Building block | Fit | Key Functionalities used | Not covered | Rationale |
|------|----------------|-----|--------------------------|-------------|-----------|
| [Verify the applicant] | [Identity] | [full / partial / none] | [KF names from the spec] | [—] | [why] |

## Solutions

| Building block | Solution | Existing or candidate | GovStack status | Source |
|----------------|----------|-----------------------|-----------------|--------|
| [Identity] | [National ID platform] | [existing] | [GovMarket listed / self-assessed / unknown] | [ARC-001-APP-v1.0] |

## Data Exchanges

| From | To | Data | Crosses organisation? | Through Information Mediator? |
|------|----|------|-----------------------|-------------------------------|

## Gaps and Decisions

| Need | Gap | Proposed approach | Decision record |
|------|-----|-------------------|-----------------|
| [need] | [no building block / partial fit: …] | [build / reuse / buy] | [/arckit:adr — not yet written] |

## Next Steps

1. [`/govkit-govstack:bb add identity`]
2. [`/govkit-govstack:compliance <project> identity <solution>`]

## External References

<!-- Per references/citation-instructions.md: Document Register (source, URL, verification date) and inline citation IDs. -->

| ID | Document | Version | URL | Verified |
|----|----------|---------|-----|----------|
| [REF-001] | [GovStack <building block> specification] | [x.y.z] | [url] | [YYYY-MM-DD] |
