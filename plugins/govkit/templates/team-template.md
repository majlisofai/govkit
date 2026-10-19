# Team Topology Design — [Hub / organisation name]

> **Template Origin**: GovKit | **GovKit Version**: [GOVKIT_VERSION] | **ArcKit Version**: [ARCKIT_VERSION] | **Skill**: `/govkit:team-design`

## Document Control

<!-- DOC-CONTROL-HEADER -->
<!-- Resolved at command-execution time per references/govkit/runtime-contract.md §4. -->

## Revision History

| Version | Date | Author | Changes | Approved By | Approval Date |
|---------|------|--------|---------|-------------|---------------|
| [VERSION] | [YYYY-MM-DD] | GovKit AI | Initial creation from `/govkit:team-design` | [PENDING] | [PENDING] |

## Executive Summary

[Two paragraphs: how many business streams, how they are staffed, which chapters align craft, what the platform provides, and the key design decisions and open warnings.]

![Team matrix](GOV-NNN-TEAM-vN.N.drawio.svg)

| Item | Value |
|------|-------|
| Model (source of truth) | [`GOV-NNN-TEAM-vN.N.json`](GOV-NNN-TEAM-vN.N.json) |
| Diagram | [`GOV-NNN-TEAM-vN.N.drawio`](GOV-NNN-TEAM-vN.N.drawio) — regenerate with `/govkit:team-design --evolve`, do not edit by hand |
| Team model (method) | [approach.team_model — id, version, source layer] |
| Rule check | [validate-team.mjs summary line] |

## Business Streams and Stream-Aligned Teams

| Team | Business stream | Source | Mission | Size | Leadership |
|------|-----------------|--------|---------|------|------------|
| [STREAM 1 — Wealth/Elite] | [Wealth & Elite Banking] | [ARC-001-SOBC-v1.0 §3.2] | [mission] | [8] | [PO + Tech Lead] |

**Fracture planes used:** [e.g. business domain for streams 1–5; risk for the credit engine]

## Virtual Chapters

| Chapter | Scope | Lead | [STREAM 1] | [STREAM 2] | … | Total |
|---------|-------|------|------------|------------|---|-------|
| [UX/UI] | [Design Systems, CX, Accessibility] | [Design Lead] | [2] | [1] | … | [n] |
| **Total** | | | [8] | [8] | … | [64] |

## Platform Team(s)

| Capability | Detail | Consumers | Interaction |
|------------|--------|-----------|-------------|
| [GenAI Platform] | [Gateway, RAG, Guardrails] | [all streams] | X-as-a-Service |

Platform size: [8] · Service catalogue owner: [role]

## Enabling and Complicated-Subsystem Teams

| Team | Type | Size | Justification | Serves | Until |
|------|------|------|---------------|--------|-------|

[Write "None — no capability gap or specialist subsystem justified one." when empty.]

## Interactions

| From | To | Mode | Purpose | Until |
|------|----|------|---------|-------|

## Rule Check

| Rule | Severity | Result | Note / action |
|------|----------|--------|---------------|
| [team_size] | [error] | [PASS / FAIL / WARN — finding] | [accepted because … / action] |

## Decision Rights

| Decision | Owner | Operating-model role |
|----------|-------|----------------------|
| Stream backlog and outcomes | Product Owner | [first-line] |
| Stream technical decisions (ADRs) | Tech Lead | [first-line] |
| Craft standards across streams | Chapter Lead | [second-line] |
| Platform service catalogue and SLOs | Platform lead | [first-line] |

## Cognitive Load and Evolution

[Per stream: what it must know and own; what the platform removes. Collaborations ending, and what moves to X-as-a-Service afterwards. Planned changes to streams, chapters or platform.]

## Assumptions

[Staffing counts not yet backed by demand data; streams inferred rather than sourced.]
