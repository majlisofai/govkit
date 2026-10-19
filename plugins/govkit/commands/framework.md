---
description: "Manage governance frameworks: list, show, add a new one from a name or URL (researched and cited), refresh a built-in, or validate a custom framework file."
doc-type: none
argument-hint: "[list | show <id> | add <name or URL> | refresh <id> | validate <id>]"
effort: high
handoffs:
  - command: govkit:profile
    description: Activate the new framework with `set frameworks.active`.
  - command: govkit:crosswalk
    description: Map the new framework onto the ones already active.
allowed-tools:
  - Read(/${CLAUDE_PLUGIN_ROOT}/**)
---

## User Request

```text
$ARGUMENTS
```

Frameworks are data files, not code. A built-in framework lives in `${CLAUDE_PLUGIN_ROOT}/frameworks/<id>.yaml`. An organisation's own framework, or an override of a built-in one, lives in `.govkit/frameworks/<id>.yaml`. The format is defined in `${CLAUDE_PLUGIN_ROOT}/frameworks/_template.yaml` and `${CLAUDE_PLUGIN_ROOT}/schemas/framework.schema.json`.

## Sub-commands

- **list**: glob both locations. Show a table of id, name, version, type, number of controls, source (built-in, custom, or override) and whether the framework is active in the profile.
- **show `<id>`**: header fields, then the controls grouped by `group`.
- **add `<name or URL>`**:
  1. Dispatch the `govkit-framework-researcher` agent with `{ "query": "<name or URL>", "existing_ids": [...] }`. It returns a JSON draft that conforms to `framework.schema.json`, with a citation for every control.
  2. If the source is copyrighted (ISO, IEC, BSI and similar), keep `intent` to a one-sentence paraphrase and set `text_policy` to say so. Never paste licensed text.
  3. Suggest `evidence_hints` from ArcKit and GovKit doc-type codes. For ArcKit codes, glob ArcKit core's `config/doc-types.mjs`. For GovKit codes, read `${CLAUDE_PLUGIN_ROOT}/config/doc-types.mjs`.
  4. If an installed ArcKit overlay already covers this framework (for example the EU AI Act is covered by `arckit-eu:eu-ai-act`), set `related_arckit.overlay_commands`. GovKit then hands off to that command and does not duplicate it.
  5. Show the draft and ask for confirmation. Then write `.govkit/frameworks/<id>.yaml` and run **validate**.
- **refresh `<id>`**: re-run the researcher against the framework's `url`. Show a diff of the controls (added, removed, retitled). Write the result to `.govkit/frameworks/<id>.yaml`, which overrides the built-in file and leaves it untouched. Update `verified`.
- **validate `<id>`**: check that `id` equals the filename, every required field is present, control ids are unique, every `evidence_hints` code exists in the ArcKit or GovKit registry, every `mappings` target framework exists, and the `verified` date is no more than 12 months old (warning only). Report PASS or FAIL for each check.
