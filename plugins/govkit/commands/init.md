---
description: "Set up GovKit in this repository: interview for approach, methods, frameworks and tools, write .govkit/profile.yaml, then apply it to ArcKit's extension points."
doc-type: none
argument-hint: "[organisation name] [--defaults]"
effort: medium
handoffs:
  - command: govkit:apply
    description: Render the profile into ArcKit template overrides and build recipes.
  - command: govkit:operating-model
    description: Write the organisation-wide Governance Operating Model from the chosen approach.
  - command: arckit:principles
    description: ArcKit architecture principles are a G0 prerequisite.
allowed-tools:
  - Read(/${CLAUDE_PLUGIN_ROOT}/**)
  - Bash(bash ${CLAUDE_PLUGIN_ROOT}/scripts/bash/create-project.sh *)
---

## User Request

```text
$ARGUMENTS
```

You are setting up GovKit, a governance overlay for ArcKit, in this repository. The user chooses the approach, methods, frameworks and tools, and every other GovKit command then reads them from `.govkit/profile.yaml`.

## Process

1. Read `${CLAUDE_PLUGIN_ROOT}/references/govkit/runtime-contract.md` and `${CLAUDE_PLUGIN_ROOT}/config/profile.default.yaml`.
2. If `.govkit/profile.yaml` already exists, show its key choices and ask whether to amend or replace it. Never overwrite it silently.
3. List what is available. Glob both the built-in files and the project overrides (`.govkit/...`), as the contract's §2 describes:
   - operating models, lifecycles, assessment scales and risk methods from `methods/`
   - frameworks from `frameworks/`, excluding `_template.yaml`. Show each framework's `name`, `version` and `type`.
4. If `$ARGUMENTS` contains `--defaults`, skip to step 6 with the built-in defaults and only the organisation name filled in.
5. Interview the user with AskUserQuestion, one topic at a time and multiple choice where possible, following `${CLAUDE_PLUGIN_ROOT}/references/interview-pattern.md`:
   1. **Organisation**: name, sector and jurisdictions. Jurisdictions suggest ArcKit overlays: UAE → `arckit-uae`, EU → `arckit-eu`, US → `arckit-us`, CA → `arckit-ca`, AU → `arckit-au`, FR → `arckit-fr`, AT → `arckit-at`, NL → `arckit-nl`.
   2. **Approach**: operating model, lifecycle, and posture (risk-based, compliance-led or principles-led).
   3. **Methods**: assessment scale, risk method, risk appetite, and the maximum evidence age.
   4. **Frameworks**: the active set and the primary one (multi-select). Offer "add a framework not listed" and, if chosen, hand off to `/govkit:framework add` after init.
   5. **Tools**: ArcKit commands to exclude or substitute, action tracker, and which ArcKit templates to override (default `risk-register`). For the diagram tool, the default is `drawio`, which routes diagrams to `/govkit:diagram`; `mermaid` and `plantuml` use `/arckit:diagram`. With drawio, also choose the diagram style by listing `diagram-styles/` in both locations; the built-ins are `standard` and `tmofai`. If draw.io desktop is not installed, mention that SVG/PNG export will be skipped (`/Applications/draw.io.app`, or `drawio` on PATH).
   6. **Document control**: classification default, owner role, approvers and review cycle.
   7. **Brand**: list the brands available in the three layers (runtime contract §2). The default is `tmofai`, and `neutral` turns branding off. Offer "create our own", which runs the `create-brand` skill after init. If the organisation profile (`extends:`) already sets `brand:`, say that the brand is managed centrally, and only override it if the user asks.
6. Write `.govkit/profile.yaml`. Include only keys that differ from the defaults, plus `govkit_profile: 1` and `organisation`, and add a header comment saying the rest is inherited from the built-in defaults. A short file is easier to review and picks up new defaults on upgrade.
7. Create `.govkit/frameworks/`, `.govkit/methods/` and `.govkit/templates-custom/`, each with a one-line `README.md` explaining the override rule.
8. If `projects/000-global/` does not exist, create it with the vendored ArcKit script: `bash ${CLAUDE_PLUGIN_ROOT}/scripts/bash/create-project.sh --json --name global`. If the script names the project something other than `000-global`, report what it created rather than renaming it.
9. Check that every chosen ArcKit overlay is installed. Look for its plugin beside ArcKit core, as `/arckit:customize` describes. For each missing one, print `claude plugin install <overlay>@arckit-claude`.
10. Summarise the choices in one table and recommend `/govkit:apply` next, then `/govkit:operating-model`.
