---
description: "Assess an AI system against the FINOS AI Governance Framework (FNRA, multi-instance): profile the system, triage every FINOS risk for applicability, rate inherent risk with the profile's risk method, check the evidence for each risk's FINOS mitigations, and rate residual risk against appetite. Covers operational, security, regulatory and agentic risks."
doc-type: FNRA
argument-hint: "<project ID or name> <AI system name> [paths to evidence]"
effort: high
handoffs:
  - command: arckit:risk
    description: Add risks above appetite to the risk register.
  - command: govkit:exception
    description: Record a time-boxed acceptance of a risk above appetite. The residual rating stays as assessed.
  - command: arckit-agent-architecture:agent-security
    description: Produce the agent security assessment that agentic risks need as evidence.
  - command: govkit:gate
    description: Use the risk assessment as evidence at the next gate.
allowed-tools:
  - Read(/${CLAUDE_PLUGIN_ROOT}/**)
---

## User Request

```text
$ARGUMENTS
```

Follow `${CLAUDE_PLUGIN_ROOT}/references/overlay-procedure.md` (O1–O5). **Type**: FNRA (multi-instance, `finos/`), one per AI system. **Template**: `risk-assessment`. Read `${CLAUDE_PLUGIN_ROOT}/references/finos-model.md` before rating anything, and `${CLAUDE_PLUGIN_ROOT}/references/risk-catalogue.yaml` for the risks and triggers.

**Inputs** (P3).

- Required: the `finos-aigf` framework. If it is missing, name `/govkit-finos:apply`. The profile's risk method (`methods.risk`).
- Optional: the project's `GOV-*-APPL-*`, `GOV-*-EVID-*`, `GOV-*-CTRL-*`, and ArcKit `REQ`, `HLDR`, `DLDR`, `DATA`, `DPIA`, `SECD`, `MLOPS`, `OPS`, `AIPB`, `ATRS`, `SOW`, `EVAL`, the agent artefacts `AAGI`, `AAGR`, `AASE`, `AAOV`, `AAIN`, and any `AIACT` or `DORA` assessment. Also any test reports, evaluation results, configuration or repository paths the user names.

**Content**:

1. **AI system profile** (`finos-model.md` rule 1).
   - Name the AI system, its version and owner, its use case and who uses its outputs. Say whether outputs are advisory or acted on automatically.
   - Record the deployment model, the model(s) and provider(s), and the data classification of inputs, retrieved content, outputs and logs.
   - Decide every trigger in `risk-catalogue.yaml` `triggers` as present or absent, citing the artefact or the user's answer. Ask the user about anything the artefacts do not settle. Do not guess.
2. **Risk triage** (rule 2). One row per risk in the catalogue: applicable or not applicable, the triggers that decide it, and a rationale. Label Draft risks. Give the FINOS identifier and display id (`ri-10`, `AIR-SEC-010`).
3. **Inherent risk** (rule 3). For each applicable risk, likelihood × impact on the profile's risk method, with the band. One line on why, for this use case.
4. **Mitigation evidence** (rule 4).
   - In scope: the union of `mitigated_by` across applicable risks. Read each mitigation's `title`, `intent` and `attributes` from `finos-aigf`, resolved through the content layers so organisation changes apply.
   - If an EVID register covers these controls, use it. Otherwise dispatch GovKit's `govkit-evidence-reader` agent in batches of about 10 mitigations, at most 8 at once. Send each mitigation's intent as the objective. For Detective mitigations, set `accepted_types` to `[log, record, test-result, artefact]`. For Preventative ones, use `[artefact, policy, record, test-result, attestation]`. Add the user's paths as `extra_paths`. The reader extracts evidence and does not judge it.
   - Dispatch GovKit's `govkit-control-assessor` agent once per group (Preventative, Detective), in parallel. Pass the scale `{ "levels": [{ "value": 0, "label": "Not implemented", "meaning": "No evidence that the mitigation is in place" }, { "value": 1, "label": "Partly implemented", "meaning": "In place for part of the scope, or designed but not yet operating" }, { "value": 2, "label": "Implemented", "meaning": "Evidence shows the mitigation is in place and operating across the scope" }], "default_target": 2 }`, the profile's posture, the mitigations (`id`, `title`, `intent`, target 2) and their evidence.
   - Override the assessor in one case: a mitigation with no evidence at all is "Not implemented — no evidence". Mark a mitigation "Not relevant" yourself only with a rationale tied to the profile.
5. **Residual risk and verdict** (rules 5 and 6). For each applicable risk: the mitigations and their ratings, the residual likelihood × impact and band, and Within appetite or Above appetite. State the appetite used and where it comes from.
6. **Regulatory and agentic hand-offs** (rule 7).
   - For each regime in scope (from APPL, an existing ArcKit assessment, or the user), name the ArcKit command and summarise its artefact if one exists. Otherwise recommend running it.
   - For applicable agentic risks, cite the agent artefacts used. If no AASE exists, recommend `/arckit-agent-architecture:agent-security`.
   - List the external references FINOS cites for each applicable risk (OWASP LLM / agentic, EU AI Act) as pointers, not findings.
7. **Gaps and actions.**
   - Each risk above appetite is a gap. Its severity follows the residual band: Critical → critical, High → major, Medium → moderate.
   - Give each gap the missing or partial mitigations, an action, an owner role from the operating model, and a target date or gate.
   - For a risk the organisation will accept for now, recommend `/govkit:exception`. The residual rating stays as assessed.
   - Propose every risk above appetite for `/arckit:risk`, with the inherent and residual ratings and the FINOS identifier. Do not write the risk register.

**Report** (P8): the system and its triggers, applicable risks out of the catalogue, risks above appetite with their bands, mitigations Not implemented, regulatory hand-offs, and the three most important actions. State that this is a self-assessment against the FINOS catalogue.
