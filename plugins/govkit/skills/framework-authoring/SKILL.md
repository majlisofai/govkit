---
name: framework-authoring
description: "Guides writing or editing GovKit framework and method files under .govkit/ (frameworks/*.yaml, methods/*/*.yaml) — structure, granularity, copyright-safe paraphrasing, evidence hints using ArcKit/GovKit doc-type codes, and crosswalk mappings. Use when the user edits these files by hand or asks how to model their own policy, standard or regulation for GovKit."
paths:
  - ".govkit/frameworks/**"
  - ".govkit/methods/**"
allowed-tools:
  - Read(/${CLAUDE_PLUGIN_ROOT}/**)
---

# Framework and Method Authoring

## Files and precedence

- A framework lives at `.govkit/frameworks/<id>.yaml`. Its format is in `${CLAUDE_PLUGIN_ROOT}/frameworks/_template.yaml` and `${CLAUDE_PLUGIN_ROOT}/schemas/framework.schema.json`.
- Methods live at `.govkit/methods/{operating-models,lifecycles,scales,risk}/<id>.yaml`. Use the built-in files in `${CLAUDE_PLUGIN_ROOT}/methods/` as their reference format.
- A project file with the **same id** as a built-in file replaces it completely. Use a new id when you mean an addition. Use the same id when you mean a correction, for example adding the licensed ISO control text your organisation holds.

## Modelling rules

1. **One rateable obligation per control.** If an assessor would need two ratings, split the control.
2. **`intent` is one sentence that says what must be true,** in your own words unless the source licence allows quotation. Record the choice in `text_policy`.
3. **`evidence_hints` use doc-type codes.** ArcKit codes such as `RISK`, `DPIA`, `ADR` and `REQ` come from ArcKit's `config/doc-types.mjs`. GovKit codes are `GMOD APPL ASMT XWLK CTRL EVID GATE EXCP BRPT`, plus any in `.govkit/doc-types.json`. These hints steer `govkit-evidence-reader`.
4. **`mappings` only where you can defend them.** Record the target framework's control ids. `/govkit:crosswalk` treats them as the strongest mapping source.
5. **Delegate jurisdictional depth.** If an ArcKit overlay already has a command for the regulation, set `related_arckit.overlay_commands` and keep your file at the obligation level.
6. **Set `verified`** every time you check the source.

## Lifecycles

- `required.arckit` and `required.govkit` list doc-type codes. `/govkit:compat` and CI check ArcKit codes against the ArcKit release you have installed.
- Criteria must be checkable from artefacts. "Stakeholders are happy" is not a criterion. "Every HIGH risk has an owner" is.

## Check your work

Run `/govkit:framework validate <id>` or `/govkit:profile validate`.
