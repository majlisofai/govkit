# GovStack Compliance Assessment

> **Template Origin**: GovKit GovStack overlay | **Overlay Version**: [OVERLAY_VERSION] | **GovKit Version**: [GOVKIT_VERSION] | **ArcKit Version**: [ARCKIT_VERSION] | **Command**: `/govkit-govstack:compliance`

## Document Control

<!-- DOC-CONTROL-HEADER -->
<!-- Resolved at command-execution time per GovKit's references/govkit/runtime-contract.md §4. -->

## Revision History

| Version | Date | Author | Changes | Approved By | Approval Date |
|---------|------|--------|---------|-------------|---------------|
| [VERSION] | [YYYY-MM-DD] | GovKit AI | Initial creation from `/govkit-govstack:compliance` | [PENDING] | [PENDING] |

## Profile Basis

| Setting | Value |
|---------|-------|
| Operating model | [approach.operating_model] |
| Posture | compliance-led (GovStack rule) |
| Frameworks | [govstack-cfr, govstack-bb-<id>] |

## Verdict

> **This is a governance self-assessment.** It is not GovStack certification and does not list the solution on GovMarket. Official compliance comes from GovStack's compliance process and test platform.

| Item | Result |
|------|--------|
| Verdict | [Self-assessed compliant / Not compliant] |
| REQUIRED met | [n of m in scope] |
| RECOMMENDED coverage | [n of m — p %] |
| Blockers | [n] |
| OBSERVABLE requirements without runtime evidence | [n] |

[One paragraph: what decides the verdict, the blockers by GovStack identifier, and the single most important action.]

## Scope

| Item | Value |
|------|-------|
| Solution | [name, version] |
| Building block | [name, or "core CFR only"] |
| Specifications | [govstack-cfr-x.y.z; govstack-bb-<id>-x.y.z] |
| Requirements in scope | [n — REQUIRED n, RECOMMENDED n] |
| Excluded | [DRAFT n, DEPRECATED n, INAPPLICABLE by spec n, not triggered n] |
| Evidence cut-off date | [YYYY-MM-DD] |

## Results by Group

| Group | In scope | REQUIRED met | REQUIRED not met | RECOMMENDED met | RECOMMENDED not met | Not triggered |
|-------|----------|--------------|------------------|-----------------|---------------------|---------------|

## Requirement Results

| Requirement | Title | Level | Verification | Mutability | Result | Evidence (IDs) | Finding |
|-------------|-------|-------|--------------|------------|--------|----------------|---------|
| [govstack-cfr-security#req-1] | [Transport security is enforced] | [REQUIRED] | [OBSERVABLE] | [IMMUTABLE] | [Met / Not met — no observable evidence / Not triggered] | [EV-… / ARC-…] | [finding] |

## Test Readiness

| Requirement | Verification | Runtime evidence | Source |
|-------------|--------------|------------------|--------|

Compliance mock (`govstack-cfr:quality-7`): [yes / no]. OpenAPI description (`govstack-cfr:quality-4`): [yes / no]. [Recommendation on GovStack compliance test suites.]

## Gaps and Actions

| Requirement | Level | Severity | Gap | Action | Owner role | Exception |
|-------------|-------|----------|-----|--------|------------|-----------|
| [ref] | [REQUIRED] | [blocker (critical)] | [gap] | [action] | [role] | [GOV-…-EXCP-… or —] |

## Extensions Applied

[Requirements tightened by the building-block specification, the organisation or national rules, and the stricter wording assessed. "None" when there are none.]

## Risks Raised

[Blockers proposed for the ArcKit risk register (`/arckit:risk`), with suggested likelihood × impact per the profile's risk method.]

## External References

<!-- Per references/citation-instructions.md: Document Register (source, URL, verification date) and inline citation IDs. -->

| ID | Document | Version | URL | Verified |
|----|----------|---------|-----|----------|
| [REF-001] | [GovStack Architecture Specification, §6 Cross-Functional Requirements] | [x.y.z] | [url] | [YYYY-MM-DD] |
