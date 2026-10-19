# Team model

A team model is `methods/team-models/<id>.yaml`, selected by `approach.team_model`. Built-in: [`team-topologies`](https://github.com/majlisofai/govkit/blob/main/plugins/govkit/methods/team-models/team-topologies.yaml), after Skelton and Pais, *Team Topologies* (2019), and Kniberg and Ivarsson, *Scaling Agile @ Spotify* (2012).

## Team types

| Type | Purpose | Default interaction | Notes |
|------|---------|---------------------|-------|
| `stream-aligned` | Owns one business stream end to end: discovery, build, run, outcomes | — | Leadership: Product Owner, Tech Lead |
| `platform` | Internal services that reduce stream teams' cognitive load, consumed self-service | `x-as-a-service` | |
| `enabling` | Helps stream teams gain missing capability, then steps away | `facilitating` | Time-boxed |
| `complicated-subsystem` | Owns a subsystem that needs scarce specialist knowledge | `x-as-a-service` | |

## Interaction modes

| Mode | Meaning | Time-boxed |
|------|---------|------------|
| `collaboration` | Two teams work closely for a defined period to discover something new | yes |
| `x-as-a-service` | One team consumes what another provides with minimal collaboration | no |
| `facilitating` | One team helps another learn or adopt a capability | yes |

## Chapters

| Key | Default | Description |
|-----|---------|-------------|
| `kind` | `virtual` | Practice community across streams. Line management stays with the team. |
| `lead_must_practise` | `true` | The chapter lead is a member of a team |
| `member_chapters_max` | `1` | Chapters per person |

## Fracture planes

Business domain or bounded context, regulatory compliance, change cadence, team location, risk, performance isolation, technology, user personas.

## Rules

`validate-team.mjs` implements each rule id. `severity` is `error` (exit 1) or `warn`. A rule missing from a model's `rules` block takes the default. Rule ids the validator doesn't implement are ignored.

| Rule | Severity | Settings (default) | Fails when |
|------|----------|--------------------|------------|
| `team_size` | error | `min: 5`, `max: 8`, `count_leadership: false` | A team's size is outside the range |
| `stream_ownership` | error | — | A stream-aligned team names no business stream, or two share one |
| `stream_leadership` | error | `required: [Product Owner, Tech Lead]` | A stream team lacks a required role. Case-insensitive. Product Owner also accepts `PO` and `Product Manager`; Tech Lead also accepts `TL`, `Technical Lead` and `Engineering Lead`. |
| `chapter_lead` | error | — | A chapter names no lead |
| `chapter_span` | warn | `min_streams: 2` | A chapter has members in fewer streams |
| `required_chapters` | warn | `chapters: []` | A stream team has no member in a listed chapter |
| `platform_interaction` | error | — | A platform-to-stream interaction is not `x-as-a-service`. Also warns when a platform team has no interactions. |
| `time_boxed` | error | — | A `collaboration` or `facilitating` interaction has no `until` |
| `max_collaborations` | warn | `max: 2` | A team is in more concurrent collaborations. A collaboration with `*stream` counts once per stream. |
| `capability_consumed` | warn | — | A platform capability lists `consumers: []` |
| `dunbar` | warn | `limit: 150` | The whole group, including leadership, is larger |

The validator also always runs a `structure` check, at error severity. It fails on duplicate team ids, a model with no stream-aligned team, members in an unknown chapter, a team with neither `members` nor `size`, an interaction naming an unknown team, or a capability consumer that is not a team.

Team size is the sum of `members`, or `size` when there are no members, plus `leadership` when `count_leadership` is true.

## Model JSON

`GOV-<PID>-TEAM-v<V>.json`, validated against [`team-topology.schema.json`](https://github.com/majlisofai/govkit/blob/main/plugins/govkit/schemas/team-topology.schema.json). Required: `title`, `method`, `chapters`, `teams`.

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Diagram title |
| `subtitle` | string | Generated when absent |
| `organisation` | string | |
| `method` | string | Team-model id |
| `rules` | object | Resolved rules from the method file |
| `chapters[]` | object | `id`, `name` (required); `scope`, `lead` |
| `teams[]` | object | See below |
| `interactions[]` | object | See below |
| `styles` | object | Resolved `notations.team` styles |
| `page` | object | For example `{ "grid": 10 }` |

### `teams[]`

| Field | Required | Description |
|-------|----------|-------------|
| `id` | yes | |
| `type` | yes | `stream-aligned`, `platform`, `enabling`, `complicated-subsystem` |
| `name` | yes | For example `STREAM 1` |
| `short`, `mission` | no | Shown in the matrix |
| `business_stream` | stream-aligned | The value stream or business case owned end to end |
| `source` | no | ArcKit artefact the stream comes from, for example `ARC-001-SOBC-v1.0 §2` |
| `leadership` | no | Role names |
| `members` | no | Chapter id → member count |
| `size` | no | For teams without per-chapter members |
| `capabilities[]` | no | `name` (required), `detail`, `consumers` (team ids; omit for all streams) |
| `focal` | no | Outline in the style's `focal` overlay |

### `interactions[]`

| Field | Required | Description |
|-------|----------|-------------|
| `from` | yes | Team id |
| `to` | yes | Team id, or `*stream` for every stream-aligned team |
| `mode` | yes | `collaboration`, `x-as-a-service`, `facilitating` |
| `purpose` | no | |
| `until` | time-boxed modes | End date, `YYYY-MM-DD` |

## TEAM artefact sections

Executive summary with the embedded matrix; business streams and stream-aligned teams; virtual chapters (matrix with totals); platform teams; enabling and complicated-subsystem teams; interactions; rule check; decision rights; cognitive load and evolution; assumptions.
