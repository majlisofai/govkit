---
name: govstack-method
description: "GovStack vocabulary and routing inside GovKit: building blocks, key functionalities, functional and cross-functional requirements, the REQUIRED / RECOMMENDED, OBSERVABLE / AUDITABLE and mutability classifiers, and the all-REQUIRED compliance rule. Use when a GovKit-governed project talks about GovStack, digital public infrastructure building blocks, GovMarket, or whether a solution is GovStack-compliant. Not for writing or editing GovStack specifications themselves: that is GovStack's own govstack-skills plugin."
allowed-tools:
  - Read(/${CLAUDE_PLUGIN_ROOT}/**)
---

# GovStack Method

The GovStack overlay brings GovStack's building-block specifications into GovKit governance. This skill keeps the vocabulary exact and sends work to the right command.

## When this applies

- The user asks which GovStack building blocks a service needs, or whether a product or component is GovStack-compliant.
- A GovKit artefact cites a GovStack requirement, or the profile has `govstack-cfr` or a `govstack-bb-*` framework active.
- An ArcKit design artefact (HLDR, DLDR, PLAT) mentions GovStack, the Information Mediator or X-Road-style data exchange.

## Procedure

1. Read `${CLAUDE_PLUGIN_ROOT}/references/govstack-model.md` before reasoning about any GovStack requirement.
2. Use GovStack's terms exactly:
   - "building block", "Key Functionality", "functional requirement", "cross-functional requirement"
   - the classifiers in capitals: REQUIRED, RECOMMENDED, OBSERVABLE, AUDITABLE, IMMUTABLE, EXTENSIBLE, REPLACEABLE
   - requirements by identifier, for example `govstack-cfr-security#req-1`, or in GovKit citations `govstack-cfr:security-1`
3. Route the work:

   | The user wants | Run |
   |----------------|-----|
   | The overlay set up, or refreshed after an upgrade | `/govkit-govstack:apply` |
   | Which building blocks a project needs | `/govkit-govstack:map <project>` |
   | A building block's requirements in GovKit | `/govkit-govstack:bb add <id>` |
   | A solution checked against GovStack | `/govkit-govstack:compliance <project> <bb or cfr>` |
   | An accepted gap recorded | `/govkit:exception` |

4. If `.govkit/doc-types.json` lacks the overlay's codes (GSBB, GSCA), say that `/govkit-govstack:apply` has not been run.

## Anti-patterns

- **Certifying.** GovKit's verdict is a self-assessment. Never call a solution "GovStack certified" or "GovMarket listed" unless GovStack's own process says so.
- **Softening REQUIRED.** One unmet REQUIRED requirement means not compliant. An exception records an accepted gap. It does not make the requirement met.
- **Declaring requirements inapplicable.** Only a published GovStack extended specification can mark a requirement INAPPLICABLE.
- **Trusting documents for OBSERVABLE requirements.** They need evidence from the running system.
- **Inventing requirements or classifiers.** If a building block's framework is missing, run `/govkit-govstack:bb add`. Do not reconstruct the specification from memory.
