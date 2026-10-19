# Architecture Diagram — [View name]

> **Template Origin**: GovKit | **GovKit Version**: [GOVKIT_VERSION] | **ArcKit Version**: [ARCKIT_VERSION] | **Command**: `/govkit:diagram`

## Document Control

<!-- DOC-CONTROL-HEADER -->
<!-- Resolved at command-execution time per references/govkit/runtime-contract.md §4. -->

## Revision History

| Version | Date | Author | Changes | Approved By | Approval Date |
|---------|------|--------|---------|-------------|---------------|
| [VERSION] | [YYYY-MM-DD] | GovKit AI | Initial creation from `/govkit:diagram` | [PENDING] | [PENDING] |

## Diagram

| Item | Value |
|------|-------|
| Source file | [`GOV-NNN-DGRM-NNN-vN.N.drawio`](GOV-NNN-DGRM-NNN-vN.N.drawio) — open in draw.io to edit |
| Notation / viewpoint | [ArchiMate 3.2 — Application Cooperation / C4 — Container / DFD / …] |
| Diagram style | [tools.drawio.style] |
| Pages | [n — names] |
| Converted from | [ARC-NNN-DIAG-NNN-vN.N §heading, or —] |
| Validation | [validate-drawio.mjs summary line] |

![[View name]](GOV-NNN-DGRM-NNN-vN.N.drawio.svg)

<!-- If export was skipped (draw.io desktop not installed), replace the image with:
     "Export pending — open the .drawio file in draw.io, or install draw.io desktop and re-run /govkit:diagram." -->

## Purpose and Scope

[What question this view answers, for whom, and what is deliberately out of scope.]

## Elements

| ID | Element | Notation element | Layer / boundary | State | Source |
|----|---------|------------------|------------------|-------|--------|
| [p1-app] | [Booking Service] | [Application Component] | [Application] | [focal / context / out of scope / —] | [ARC-001-HLDR-v1.0 §3.2] |

## Relationships

| ID | From | To | Relationship | Label | Source |
|----|------|----|--------------|-------|--------|
| [p1-e1] | [p1-app] | [p1-db] | [access] | [reads/writes] | [ARC-001-DATA-v1.0 §2] |

## Notes and Assumptions

[Anything inferred rather than sourced; any relationship drawn as association because validity was unclear.]
