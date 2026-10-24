---
description: "Self-assess a solution against GovStack (GSCA, multi-instance): the core cross-functional requirements and, optionally, one building block's specification. Applies GovStack's rule that every REQUIRED requirement must be met, reports the share of RECOMMENDED requirements met, and demands runtime evidence for OBSERVABLE requirements."
doc-type: GSCA
argument-hint: "<project ID or name> <bb id | cfr> [solution name]"
effort: high
handoffs:
  - command: govkit:exception
    description: Record a time-boxed exception for a gap the organisation accepts. The requirement stays unmet.
  - command: arckit:risk
    description: Add unmet REQUIRED requirements to the risk register.
  - command: govkit:gate
    description: Use the self-assessment as evidence at the next gate.
allowed-tools:
  - Read(/${CLAUDE_PLUGIN_ROOT}/**)
---

## User Request

```text
$ARGUMENTS
```

Follow `${CLAUDE_PLUGIN_ROOT}/references/overlay-procedure.md` (O1–O5). **Type**: GSCA (multi-instance, `govstack/`). **Template**: `compliance`. Read `${CLAUDE_PLUGIN_ROOT}/references/govstack-model.md` before rating anything.

**Inputs** (P3).

- Required: the `govstack-cfr` framework. If it is missing, name `/govkit-govstack:apply`. If a building block is named, also `govstack-bb-<id>`. If that is missing, name `/govkit-govstack:bb add <id>`.
- Optional: the project's `GOV-*-GSBB-*`, `GOV-*-EVID-*`, `GOV-*-CTRL-*`, and ArcKit `HLDR`, `DLDR`, `ADR`, `SECD`, `DEVOPS`, `OPS`, `DATA` and `CDAU`. Also any test reports or repository paths the user names, such as compliance test-suite output.

With `cfr` in place of a building block, assess the core cross-functional requirements only.

**Content**:

1. **Scope.**
   - Name the solution (from `$ARGUMENTS`, or the GSBB row for this building block), its version, and the specification versions, as pinned identifiers such as `govstack-cfr-2.1.0` and `govstack-bb-payments-3.0.0`.
   - The requirements in scope are every `govstack-cfr` control, plus every `govstack-bb-<id>` control.
   - Where the building block extends a core requirement, assess the extended, stricter form.
   - Where the building-block specification marks a core requirement INAPPLICABLE, list it with GovStack's rationale and leave it out.
   - List DRAFT and DEPRECATED requirements, but leave them out of the verdict.
2. **Evidence.**
   - If an EVID register covers these controls, use it.
   - Otherwise dispatch GovKit's `govkit-evidence-reader` agent in batches of about 10 requirements, at most 8 at once. Send each requirement's intent as the objective. For OBSERVABLE requirements, set `accepted_types` to `[test-result, log, record]`. For AUDITABLE requirements, use `[artefact, policy, record, attestation]`. Add the user's paths as `extra_paths`. The reader extracts evidence and does not judge it.
3. **Rating.**
   - Dispatch GovKit's `govkit-control-assessor` agent once per group, in parallel. Pass the scale `{ "levels": [{ "value": 0, "label": "Not met", "meaning": "The evidence does not fully demonstrate the requirement as written" }, { "value": 1, "label": "Met", "meaning": "The evidence fully demonstrates the requirement as written, by the method its verification class demands" }], "default_target": 1 }`, posture `compliance-led`, the controls (`id`, `title`, `intent`, target 1) and their evidence.
   - Override the assessor in two cases. An OBSERVABLE requirement backed only by documents is "Not met — no observable evidence". A requirement with no evidence at all is "Not met — no evidence".
   - For a conditional requirement whose condition does not hold, record "Not triggered" with the evidence that it does not hold.
4. **Verdict** (`govstack-model.md` rules 1–3):
   - **Self-assessed compliant** only if every in-scope REQUIRED requirement is Met or Not triggered.
   - Otherwise **Not compliant**, listing each unmet REQUIRED requirement by its GovStack identifier.
   - Report RECOMMENDED coverage as met ÷ in scope, the figure GovMarket shows buyers.
   - State in the verdict that this is a self-assessment, not GovStack certification or a GovMarket listing.
5. **Test readiness.** List the OBSERVABLE requirements, with whether test evidence exists for each. Note whether the solution provides a compliance mock (`govstack-cfr:quality-7`) and an OpenAPI description (`govstack-cfr:quality-4`). Without them, third-party compliance testing is harder. Recommend running GovStack's compliance test suites for the building block where they exist.
6. **Gaps and actions.**
   - An unmet REQUIRED requirement is a **blocker**: its severity is critical. An unmet RECOMMENDED requirement is **minor**.
   - Give each gap an owner role from the operating model and an action.
   - For a gap the organisation will accept for now, recommend `/govkit:exception`. The requirement still counts as unmet in the verdict.
   - Propose blockers as risks for `/arckit:risk`. Do not write the risk register.
7. **Extensions.** If the project or the organisation tightens any EXTENSIBLE requirement, for example a stricter national rule, list the tightened rule and assess against it.

**Report** (P8): the verdict, REQUIRED met out of in scope, RECOMMENDED coverage, blockers, OBSERVABLE requirements without runtime evidence, and the three most important actions.
