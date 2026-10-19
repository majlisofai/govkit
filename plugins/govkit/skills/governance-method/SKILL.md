---
name: governance-method
description: "Applies the organisation's GovKit profile (operating model, lifecycle, assessment scale, risk method, frameworks, tool choices) whenever governance, assurance, compliance, risk or gate questions come up in a repository with projects/ or .govkit/ — including while ArcKit commands run — so answers use the organisation's own vocabulary, scales and decision rights instead of generic ones. Not needed for pure architecture-content questions with no governance angle."
paths:
  - "projects/**"
  - ".govkit/**"
allowed-tools:
  - Read(/${CLAUDE_PLUGIN_ROOT}/**)
---

# Governance Method

GovKit separates **what** is governed, which is ArcKit's artefacts, from **how** it is governed, which is the GovKit profile. This skill keeps the "how" consistent wherever governance comes up.

## When this applies

- The user asks whether something is compliant, approved, ready for a gate, within appetite, or who decides.
- An ArcKit command writes a risk, conformance, principles-compliance or review artefact and the profile defines scales for it.
- The user wants to change how governance works: an approach, method, framework or tool. Route them to `/govkit:profile set`, `/govkit:framework`, or an override file under `.govkit/`. Never edit GovKit's or ArcKit's plugin files.

## Procedure

1. Resolve the profile as `${CLAUDE_PLUGIN_ROOT}/references/govkit/runtime-contract.md` §1–§2 describes. Load only the files the question needs.
2. Use the profile's vocabulary:
   - **Ratings** use the assessment scale's level labels, never an ad hoc "good/bad".
   - **Risk** uses the risk method's likelihood, impact and band labels, and says whether a risk is within appetite.
   - **Decisions** name the operating-model role and the lifecycle gate that owns them.
   - **Frameworks** are cited as `framework-id:control-id`.
3. If an ArcKit command is running and its template has a GovKit override (`.arckit/templates-custom/*` with a `govkit-override` comment), fill the overridden sections with the profile's values.
4. If the user's question needs an artefact that doesn't exist, name the command that produces it. Respect `tools.arckit.commands.exclude` and `substitute`.

## Anti-patterns

- **Inventing a scale or band.** If the profile names a scale, use it exactly. If the method file is missing, say so.
- **Approving.** GovKit recommends and records. Approvals belong to the role the operating model names, so leave decision fields `[PENDING]`.
- **Duplicating ArcKit.** If an ArcKit core or overlay command already covers a framework, hand off to it.
