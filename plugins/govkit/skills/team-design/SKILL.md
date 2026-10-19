---
name: team-design
description: "Designs (or evolves) a team organisation using Team Topologies: stream-aligned teams that each own one business stream end to end, virtual chapters that align craft across streams, and platform, enabling and complicated-subsystem teams with explicit interaction modes. It derives business streams from ArcKit artefacts or an interview, sizes teams against the profile's team-model rules, validates the model, renders a branded draw.io team matrix, and writes a governed TEAM artefact. Use when the user wants to organise, staff, restructure or document teams, squads, chapters, tribes, a hub or a centre of excellence around business streams or value streams."
doc-type: TEAM
argument-hint: "<project ID or name> [hub name] [--from <model.json or ARC document ID>] [--evolve]"
allowed-tools:
  - Read(/${CLAUDE_PLUGIN_ROOT}/**)
  - Bash(bash ${CLAUDE_PLUGIN_ROOT}/scripts/bash/create-project.sh *)
  - Bash(node ${CLAUDE_PLUGIN_ROOT}/scripts/generate-gov-id.mjs *)
  - Bash(node ${CLAUDE_PLUGIN_ROOT}/scripts/validate-team.mjs *)
  - Bash(node ${CLAUDE_PLUGIN_ROOT}/scripts/render-team-matrix.mjs *)
  - Bash(node ${CLAUDE_PLUGIN_ROOT}/scripts/validate-drawio.mjs *)
  - Bash(bash ${CLAUDE_PLUGIN_ROOT}/scripts/export-drawio.sh *)
---

# Team Design (Team Topologies · Chapters · Business Streams)

This skill produces one governed artefact, the **TEAM** document, with companion files beside it in the project folder:

| File | Role |
|------|------|
| `GOV-<PID>-TEAM-v<V>.json` | **Source of truth**: the team model (`${CLAUDE_PLUGIN_ROOT}/schemas/team-topology.schema.json`) |
| `GOV-<PID>-TEAM-v<V>.drawio` (+ `.drawio.svg` / `.png`) | The team matrix, rendered from the JSON. Never hand-draw it. |
| `GOV-<PID>-TEAM-v<V>.md` | The governed document: rationale, tables, rule check results, decision rights |

The structure has two axes:

- **Vertical: stream-aligned teams.** Each one owns exactly one **business stream**: a value stream, product line or business case, end to end.
- **Horizontal: virtual chapters.** Each one keeps a craft (UX, data science, MLOps…) consistent across streams.

Every person sits in one team for delivery and in at most one chapter for practice. Platform teams serve the streams **X-as-a-Service**. Enabling and complicated-subsystem teams are exceptions that need a stated reason.

Follow `${CLAUDE_PLUGIN_ROOT}/references/govkit/artefact-procedure.md` (P1–P8). **Type**: TEAM (single-instance; a redesign is a new version). **Template**: `team`.

## 1. Method and inputs

1. **Resolve the method.** Read `approach.team_model` from the profile, and resolve `methods/team-models/<id>.yaml` through contract §2. Its `rules` block is the definition of a valid design. Its `team_types`, `interaction_modes` and `fracture_planes` are the vocabulary.
2. **Read optional inputs from the project and `000-global`:**

   | Input | Use |
   |-------|-----|
   | ArcKit `SOBC`, `STRAT`, `ROAD` | Business cases and strategic themes become candidate business streams |
   | ArcKit `REQ` | Capability and NFR load per stream |
   | ArcKit `STKE` | Owners: who will be Product Owner |
   | ArcKit `WVCH` / `WARD` (Wardley value chain or map) | Evolution stage. Commodity components point to platform capabilities; genesis or custom components point to stream or complicated-subsystem work |
   | ArcKit `PLAT` | Existing platform strategy |
   | `arckit-togaf-adm` capability map, `arckit-oaa` agile strategy (`OASTR`) | Value streams, and the target team topology |
   | `GOV-000-GMOD` | Decision rights. The TEAM design must not contradict them |
3. **With `--from <model.json>`,** start from that model. **With `--evolve`,** start from the latest `GOV-*-TEAM-*.json` in the project and change only what the user asks. Record the changes in the revision history.

## 2. Build the model (ask, don't assume)

Work through these steps with the user, using AskUserQuestion with one topic per question. Propose answers drawn from the inputs, and let the user correct them.

1. **Business streams.** List the candidate streams with their source, for example `ARC-001-SOBC-v1.0 §3.2`. Split or merge them using the method's `fracture_planes`, and name the plane you used. Each stream gets:
   - `name` (STREAM n) and `short`
   - `mission`, one line
   - `business_stream`, which must be unique
   - `source`
   - `leadership`, which by default is the method's required roles
2. **Chapters.** Propose chapters from the crafts the streams need. Each chapter gets a `scope` and a `lead`. The lead is a role that practises inside a team (`chapters.lead_must_practise`).
3. **Staffing.** For each stream, set the members per chapter. The constraints:
   - Stay within `rules.team_size`, and say whether leadership counts towards it (`count_leadership`).
   - Staff every chapter in `required_chapters`.
   - Make each chapter span at least `chapter_span.min_streams` streams.

   Where demand is unknown, start balanced and mark the counts as assumptions.
4. **Platform.** Group shared needs into capabilities (`name` and `detail`). Use the Wardley commodity components and the repeated requirements across streams. Add `consumers` where a capability serves only some streams. Size the platform team.
5. **Enabling and complicated-subsystem teams.** Add one only with a stated reason: a capability gap (enabling), or scarce specialist knowledge (complicated-subsystem). Every collaboration and facilitating interaction needs an `until` date.
6. **Interactions.** The platform serves `*stream` as `x-as-a-service`. Add any other interactions explicitly, each with a `purpose`.
7. **Focal team (optional).** Set `focal: true` on the team the decision is about. Its outline renders in the brand's accent.

Copy the method's resolved `rules` into the model's `rules` block. The scripts take no YAML, so the model carries its own rules.

## 3. Validate

Run `node ${CLAUDE_PLUGIN_ROOT}/scripts/validate-team.mjs <model.json>`.

- Fix every **FAIL** with the user. Never weaken a rule to get a pass. If the organisation genuinely wants a different rule, that is a method change: suggest an override in `.govkit/methods/team-models/`.
- Record each **WARN** in the artefact, either as accepted with a reason or as an action.

## 4. Render

1. **Resolve the diagram style.** Use the brand's `diagrams.drawio_style`, or `tools.drawio.style` when that is not `brand` (contract §6). Set the model's `styles` to that style's `notations.team` map, and `page.grid` to the style's grid. If the style has no `notations.team`, omit `styles`, and the renderer uses neutral defaults.
2. Write the model to `projects/<dir>/GOV-<PID>-TEAM-v<V>.json`. Take the stem from P5.
3. Run `node ${CLAUDE_PLUGIN_ROOT}/scripts/render-team-matrix.mjs <model.json> -o <stem>.drawio`.
4. Run `node ${CLAUDE_PLUGIN_ROOT}/scripts/validate-drawio.mjs <stem>.drawio`.
5. Run `bash ${CLAUDE_PLUGIN_ROOT}/scripts/export-drawio.sh <stem>.drawio svg png`. Exit 3 means draw.io desktop is absent: continue without the exports.
6. If a PNG exists, read it and check that labels fit and nothing overlaps. If text overflows, shorten `short` and `mission` rather than editing the drawio.

## 5. Write the artefact

Render `team-template.md` (P4–P8). Include:

- **Streams.** One row per stream, with its business stream, source, mission, size and leadership.
- **Chapter matrix.** Chapters as rows and streams as columns, with counts, row totals, column totals, and the chapter lead.
- **Platform capabilities** and their consumers.
- **Other teams**, each with the justification for it.
- **Interactions.** Mode, purpose and until-date for each.
- **Rule check.** The validator's findings, plus the method that defined the rules.
- **Decision rights.**
  - The Product Owner owns the stream backlog and outcomes.
  - The Tech Lead owns the stream's technical decisions (ArcKit ADRs).
  - The chapter lead owns craft standards across streams.
  - The platform team owns the service catalogue and its SLOs.

  Map each of these to the operating model's roles when `GOV-000-GMOD` exists.
- **Cognitive-load and evolution notes.** Which collaborations end when, and what should move to X-as-a-Service afterwards.
- **The diagram.** Embed `<stem>.drawio.svg`, falling back to the `.png`, and link the `.drawio` and `.json` files.

**Report** (P8):

- the number of teams of each type, chapters and people
- validator errors and warnings
- the paths of the `.md`, `.json`, `.drawio` and exports
- the next step: `/govkit:gate` if a gate needs the TEAM design, or `/arckit:roadmap` to phase the build-up

## Evolving the design

Re-run with `--evolve`. Typical changes: add or split a stream, move members between chapters, end a collaboration, or promote a stream capability into the platform. Each change produces a new version, with the old files left beside the new ones (ArcKit's version rules). The revision history states what changed and why.
