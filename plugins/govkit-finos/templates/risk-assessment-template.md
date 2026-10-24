# FINOS AI Risk Assessment

> **Template Origin**: GovKit FINOS module | **Overlay Version**: [OVERLAY_VERSION] | **GovKit Version**: [GOVKIT_VERSION] | **ArcKit Version**: [ARCKIT_VERSION] | **Command**: `/govkit-finos:risk-assess`

## Document Control

<!-- DOC-CONTROL-HEADER -->
<!-- Resolved at command-execution time per GovKit's references/govkit/runtime-contract.md §4. -->

## Revision History

| Version | Date | Author | Changes | Approved By | Approval Date |
|---------|------|--------|---------|-------------|---------------|
| [VERSION] | [YYYY-MM-DD] | GovKit AI | Initial creation from `/govkit-finos:risk-assess` | [PENDING] | [PENDING] |

## Profile Basis

| Setting | Value |
|---------|-------|
| Operating model | [approach.operating_model] |
| Posture | [approach.posture] |
| Risk method | [methods.risk] — appetite [band, source] |
| Frameworks | [finos-aigf v2] |

## Summary

> **This is a self-assessment against the FINOS AI Governance Framework catalogue.** FINOS publishes guidance, not a certification scheme.

| Item | Result |
|------|--------|
| AI system | [name, version] |
| Applicable risks | [n of m in the catalogue] |
| Above appetite | [n — Critical n, High n, Medium n] |
| Mitigations in scope | [n — Implemented n, Partly n, Not implemented n, Not relevant n] |
| Regulatory hand-offs | [EU AI Act, DORA, … or none] |

[One paragraph: the risks that matter most for this system, why, and the single most important action.]

## AI System Profile

| Item | Value | Source |
|------|-------|--------|
| Use case | [what it does, for whom] | [ARC-… / user] |
| Output use | [advisory / acted on automatically; human review] | |
| Deployment model | [third-party hosted API / firm-tenancy cloud / self-hosted] | |
| Model(s) and provider(s) | [name, version] | |
| Data classification | [inputs, retrieved content, outputs, logs] | |
| Evidence cut-off date | [YYYY-MM-DD] | |

### Triggers

| Trigger | Present | Evidence |
|---------|---------|----------|
| [foundation-model] | [yes / no] | [ARC-… / user answer] |

## Risk Triage

| Risk | Display id | Title | Category | Status | Applicable | Triggers | Rationale |
|------|------------|-------|----------|--------|------------|----------|-----------|
| [ri-10] | [AIR-SEC-010] | [Prompt Injection] | [Security] | [approved / Draft] | [yes / no] | [rag, agentic] | [rationale] |

## Inherent Risk

| Risk | Likelihood | Impact | Score | Band | Why |
|------|------------|--------|-------|------|-----|

## Mitigation Results

| Mitigation | Title | Type | Status | Rating | Evidence (IDs) | Finding | Mitigates (applicable) |
|------------|-------|------|--------|--------|----------------|---------|------------------------|
| [mi-3] | [User/App/Model Firewalling/Filtering] | [Preventative] | [recommended / Draft] | [Implemented / Partly implemented / Not implemented — no evidence / Not relevant] | [EV-… / ARC-…] | [finding] | [ri-10, ri-18] |

## Residual Risk

| Risk | Mitigations (rating) | Residual likelihood | Residual impact | Score | Band | Verdict |
|------|----------------------|---------------------|-----------------|-------|------|---------|
| [ri-10] | [mi-3 (Partly), mi-17 (Not), mi-19 (Implemented)] | [n] | [n] | [n] | [band] | [Within / Above appetite] |

## Regulatory and Agentic Hand-offs

| Regime or area | In scope because | ArcKit command | Artefact | Summary |
|----------------|------------------|----------------|----------|---------|
| [EU AI Act] | [APPL / user] | [`/arckit-eu:eu-ai-act`] | [ARC-…-AIACT-… or not yet run] | [one line] |

External references FINOS cites for the applicable risks (pointers, not findings): [ri-10: OWASP LLM01, ASI01; EU AI Act Art. 15 …].

## Gaps and Actions

| Risk | Residual band | Severity | Missing or partial mitigations | Action | Owner role | Target | Exception |
|------|---------------|----------|--------------------------------|--------|------------|--------|-----------|
| [ri-10] | [High] | [major] | [mi-17] | [action] | [role] | [gate / date] | [GOV-…-EXCP-… or —] |

## Risks Raised

[Risks above appetite proposed for the ArcKit risk register (`/arckit:risk`), with the FINOS identifier and the inherent and residual ratings per the profile's risk method.]

## External References

<!-- Per references/citation-instructions.md: Document Register (source, URL, verification date) and inline citation IDs. -->

| ID | Document | Version | URL | Verified |
|----|----------|---------|-----|----------|
| [REF-001] | [FINOS AI Governance Framework (CC BY 4.0, © FINOS)] | [v2] | [https://air-governance-framework.finos.org/] | [YYYY-MM-DD] |
