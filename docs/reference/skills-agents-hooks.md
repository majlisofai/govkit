# Skills, agents and hooks

## Skills

| Skill | Invoked | Purpose |
|-------|---------|---------|
| `governance-method` | By the model, whenever governance comes up, including inside ArcKit commands | Uses the profile's scale labels, risk bands, operating-model roles and `framework-id:control-id` citations. Leaves decision fields `[PENDING]`. |
| `framework-authoring` | By the model | Guides hand-written framework and method files |
| `drawio-diagrams` | By `/govkit:diagram`, and for files matching `**/*.drawio` or `**/GOV-*-DGRM-*.md` | Writes uncompressed, styled draw.io XML, then validates and exports it |
| `team-design` | `/govkit:team-design`, or by the model | Designs teams. Produces the TEAM artefact. |
| `create-brand` | `/govkit:create-brand`, or by the model | Creates or updates a brand and its diagram style |

## Agents

Subagents dispatched by commands. You cannot invoke them directly.

| Agent | Dispatched by | Tools | Model | Returns |
|-------|---------------|-------|-------|---------|
| `govkit-evidence-reader` | `/govkit:evidence`, `/govkit:assess` | Read, Glob, Grep | sonnet | JSON per [`evidence-handoff.schema.json`](https://github.com/majlisofai/govkit/blob/main/plugins/govkit/schemas/evidence-handoff.schema.json). Extracts evidence. Never rates. |
| `govkit-control-assessor` | `/govkit:assess` | Read | inherit | JSON per [`assessment-handoff.schema.json`](https://github.com/majlisofai/govkit/blob/main/plugins/govkit/schemas/assessment-handoff.schema.json). Rates controls from the evidence it is given only. |
| `govkit-framework-researcher` | `/govkit:framework add`, `refresh` | Read, WebSearch, WebFetch | inherit | JSON per [`framework.schema.json`](https://github.com/majlisofai/govkit/blob/main/plugins/govkit/schemas/framework.schema.json), with a citation per control |

## Hooks

| Hook | Event | Does |
|------|-------|------|
| `govkit-session.mjs` | SessionStart | Warns when the installed ArcKit is outside the range in `config/compat.json`, and tells the model whether a GovKit profile is active. Never blocks. |
| `validate-gov-filename.mjs` | PreToolUse `Write` under `projects/` | Validates `GOV-*` filenames against the doc-type registry, including `.govkit/doc-types.json`. Blocks a write with a wrong name and gives the correct path. |

ArcKit's own hooks keep running for `ARC-*` files.

## Data

GovKit sends no data of its own and has no MCP servers. `/govkit:framework add` and `refresh` fetch public web pages through Claude's WebSearch and WebFetch tools.
