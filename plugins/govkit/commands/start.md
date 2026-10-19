---
description: "Recommend the governance command sequence for a project — ArcKit and GovKit commands interleaved per the profile's lifecycle, frameworks and tool choices."
doc-type: none
argument-hint: "[project name or ID] [--gate G2]"
effort: medium
allowed-tools:
  - Read(/${CLAUDE_PLUGIN_ROOT}/**)
  - Bash(bash ${CLAUDE_PLUGIN_ROOT}/scripts/bash/list-projects.sh *)
---

## User Request

```text
$ARGUMENTS
```

<HARD-GATE>
Do not run any command. Your only output is a recommended plan. The user decides what to run.
</HARD-GATE>

## Process

1. Read `${CLAUDE_PLUGIN_ROOT}/references/govkit/runtime-contract.md`. Resolve the profile and its lifecycle file.
2. Find the project. Use `bash ${CLAUDE_PLUGIN_ROOT}/scripts/bash/list-projects.sh` and glob `projects/*/`. Inventory which ArcKit (`ARC-*`) and GovKit (`GOV-*`) artefacts exist, with their versions.
3. Find the **current gate**. It is the first gate in the lifecycle whose `required` artefacts are not all present. If `--gate` is passed, plan up to that gate instead.
4. Build the plan, gate by gate up to the target gate. For each missing required artefact:
   - Use the producing command. ArcKit codes come from the ArcKit command whose `doc-type:` frontmatter matches; glob ArcKit core's `commands/*.md`. GovKit codes come from `command` in `${CLAUDE_PLUGIN_ROOT}/config/doc-types.mjs`.
   - Apply `tools.arckit.commands.substitute`, and drop anything in `tools.arckit.commands.exclude`. If an excluded command produces a required artefact, flag it as a **gap** and do not silently drop it.
   - For each active framework with `related_arckit.overlay_commands`, add that overlay command next to `/govkit:assess`.
   - Order by dependency. ArcKit prerequisites come first, following ArcKit's own handoffs. GovKit commands come where their inputs exist: CTRL after APPL, ASMT after CTRL and the design artefacts, and GATE last for each gate.
5. Output a numbered list grouped by gate. Each line shows the command, the artefact it produces, and why the gate needs it. End with the single next command to run.
6. If the full recipe applies, mention `/arckit:build govkit-baseline`, which `/govkit:apply` installs into `.arckit/recipes/`.
