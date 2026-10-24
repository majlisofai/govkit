---
name: finos-method
description: "FINOS AI Governance Framework vocabulary and routing inside GovKit: the risk catalogue (ri-*, AIR-OP / AIR-SEC / AIR-RC), the mitigation catalogue (mi-*, Preventative / Detective), triggers, inherent and residual risk. Use when a GovKit-governed project talks about FINOS, AI risk in financial services, prompt injection, hallucination, model versioning, agent or MCP security, or which mitigations an AI system needs. Not for contributing to the FINOS framework itself."
allowed-tools:
  - Read(/${CLAUDE_PLUGIN_ROOT}/**)
---

# FINOS Method

The FINOS module brings the FINOS AI Governance Framework into GovKit governance. This skill keeps the vocabulary exact and sends work to the right command.

## When this applies

- The user asks what could go wrong with an AI system, which FINOS risks apply, or which mitigations are missing.
- A GovKit artefact cites a FINOS risk or mitigation, or the profile has `finos-aigf` active.
- An ArcKit artefact (HLDR, AAGR, AASE, AIPB) describes a generative AI, RAG or agentic system in a financial institution.

## Procedure

1. Read `${CLAUDE_PLUGIN_ROOT}/references/finos-model.md` before reasoning about any FINOS risk or mitigation.
2. Use FINOS's identifiers exactly: risks as `ri-10` (site display id `AIR-SEC-010`), mitigations as `mi-3`, or in GovKit citations `finos-aigf:mi-3`. Name Draft items as Draft.
3. Route the work:

   | The user wants | Run |
   |----------------|-----|
   | The module set up, or refreshed after an upgrade | `/govkit-finos:apply` |
   | One AI system's risks triaged and its mitigations checked | `/govkit-finos:risk-assess <project> <system>` |
   | The project's maturity on the FINOS mitigations, control by control | `/govkit:assess <project> finos-aigf` |
   | FINOS lined up against ISO/IEC 42001 or NIST AI RMF | `/govkit:crosswalk` |
   | FINOS mitigations merged into the control register | `/govkit:controls` |
   | A risk above appetite accepted | `/govkit:exception` |
   | A risk added to the register | `/arckit:risk` (GovKit proposes; ArcKit writes) |

4. If `.govkit/doc-types.json` lacks FNRA, say that `/govkit-finos:apply` has not been run.

## Anti-patterns

- **Certifying.** FINOS publishes guidance. Never call a system "FINOS compliant" or "FINOS certified".
- **Skipping the profile.** Risk applicability depends on the system's deployment model, data and architecture. Triage without a profile is guesswork.
- **Dropping risks silently.** Every catalogue risk gets a triage row, including the not-applicable ones.
- **Crediting claims.** A mitigation with no evidence is Not implemented, and lowers no residual risk.
- **Inventing risks or mitigations.** Use the catalogue. A risk FINOS does not cover goes to `/arckit:risk` as the project's own risk, not as a FINOS item.
