# Doc types and filenames

## Filename pattern

```text
projects/{NNN-name}/[subdir/]GOV-{PID}-{TYPE}[-{SEQ}]-v{N.N}{ext}
```

| Part | Description |
|------|-------------|
| `NNN-name` | The project folder, in ArcKit's layout. Organisation-wide artefacts use `000-global`. |
| `subdir` | For multi-instance types only |
| `PID` | The project number, for example `001` |
| `TYPE` | The doc-type code |
| `SEQ` | Three-digit sequence, for multi-instance types only |
| `N.N` | Version. A re-run writes the next version beside the earlier file. |
| `ext` | `.md`, or a companion extension the type declares |

Companion files share the `.md` file's stem, for example `GOV-001-DGRM-001-v1.0.drawio` beside `GOV-001-DGRM-001-v1.0.md`.

## Built-in types

| Code | Name | Category | Command | Multi-instance | Subdir | Extensions |
|------|------|----------|---------|----------------|--------|------------|
| GMOD | Governance Operating Model | Governance | `operating-model` | | | `.md` |
| APPL | Framework Applicability | Governance | `applicability` | | | `.md` |
| ASMT | Framework Assessment | Assurance | `assess` | yes | `assessments` | `.md` |
| XWLK | Framework Crosswalk | Governance | `crosswalk` | | | `.md` |
| CTRL | Control Register | Assurance | `controls` | | | `.md` |
| EVID | Evidence Register | Assurance | `evidence` | | | `.md` |
| GATE | Stage Gate Review | Assurance | `gate` | yes | `gates` | `.md` |
| EXCP | Policy Exception | Governance | `exception` | yes | `exceptions` | `.md` |
| BRPT | Governance Board Report | Reporting | `board-report` | yes | `board-reports` | `.md` |
| DGRM | Architecture Diagram (draw.io) | Architecture | `diagram` | yes | `diagrams` | `.md`, `.drawio`, `.drawio.svg`, `.drawio.png` |
| TEAM | Team Topology Design | Governance | `team-design` | | | `.md`, `.json`, `.drawio`, `.drawio.svg`, `.drawio.png` |

The registry is [`plugins/govkit/config/doc-types.mjs`](https://github.com/majlisofai/govkit/blob/main/plugins/govkit/config/doc-types.mjs). No GovKit code may equal an ArcKit code.

## Custom types

`.govkit/doc-types.json` at the repository root adds codes. A built-in code wins over a custom one with the same name. GovKit modules register their codes here too: see the [GovStack module](govstack-overlay.md#doc-types) for GSBB and GSCA, and the [FINOS module](finos-module.md#doc-types) for FNRA.

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Display name |
| `category` | string | Grouping for reports |
| `multiInstance` | boolean | Allocates a `-NNN-` sequence |
| `subdir` | string | Folder for multi-instance types |
| `command` | string | The command or skill that writes it |
| `extensions` | string[] | Allowed extensions. Default `[".md"]`. |

## Examples

| Command | Output |
|---------|--------|
| `generate-gov-id.mjs 001 CTRL` | `GOV-001-CTRL-v1.0` |
| `generate-gov-id.mjs 001 CTRL 1.1 --filename` | `GOV-001-CTRL-v1.1.md` |
| `generate-gov-id.mjs 001 ASMT --relpath --next-num projects/001-x/assessments` | `assessments/GOV-001-ASMT-001-v1.0.md` |
