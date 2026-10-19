# Methods

Method files are YAML in `methods/<kind>/<id>.yaml`. The `id` must equal the file name. For the team model, see the [team model reference](team-model.md).

## Operating model

`kind: operating-model`. Built-in: [`three-lines`](https://github.com/majlisofai/govkit/blob/main/plugins/govkit/methods/operating-models/three-lines.yaml) (IIA Three Lines Model, 2020).

| Key | Description |
|-----|-------------|
| `roles[]` | `id`, `name`, `responsibilities[]` |
| `artefact_ownership` | Doc-type code → accountable role id |

| Role | Responsibilities |
|------|------------------|
| `governing-body` | Accountability to stakeholders, sets risk appetite, approves G0 and G4, receives board reports |
| `first-line` | Owns controls, produces evidence, raises exceptions |
| `second-line` | Defines frameworks and methods, reviews assessments, maintains the control register, approves exceptions within appetite |
| `third-line` | Independent assurance over the control register and evidence, samples assessments |

## Lifecycle

`kind: lifecycle`. Built-in: [`stage-gate`](https://github.com/majlisofai/govkit/blob/main/plugins/govkit/methods/lifecycles/stage-gate.yaml).

| Key | Description |
|-----|-------------|
| `decisions` | `[GO, GO-WITH-CONDITIONS, NO-GO]` |
| `gates[].id`, `name`, `question` | |
| `gates[].approver` | A role id in the operating model |
| `gates[].required.arckit` / `.govkit` | Doc-type codes that must exist |
| `gates[].criteria` | Statements the gate review judges from evidence |

| Gate | Name | Approver | ArcKit required | GovKit required |
|------|------|----------|-----------------|-----------------|
| G0 | Mandate | governing-body | PRIN, STKE | GMOD, APPL |
| G1 | Discovery complete | second-line | REQ, RISK, SOBC | CTRL |
| G2 | Design approved | second-line | HLDR, ADR, DPIA | ASMT |
| G3 | Ready for service | governing-body | TRAC, OPS | EVID, ASMT |
| G4 | Benefits and assurance review | governing-body | — | BRPT, EVID |

## Assessment scale

`kind: assessment-scale`.

| Key | Description |
|-----|-------------|
| `levels[]` | `value`, `label`, `meaning` |
| `default_target` | Target level when neither the control nor APPL sets one |
| `gap_severity` | Gap (target − rating) → `none`, `minor`, `major`, `critical`. A key such as `"3+"` covers that gap and above. |

=== "maturity-0-5"

    | Value | Label | Meaning |
    |-------|-------|---------|
    | 0 | Non-existent | No control and no awareness of the need |
    | 1 | Initial | Ad hoc; depends on individuals; no evidence |
    | 2 | Repeatable | Practised but undocumented; evidence partial |
    | 3 | Defined | Documented, owned, evidenced |
    | 4 | Managed | Measured and reviewed against targets |
    | 5 | Optimising | Continuously improved from measurement |

    `default_target: 3`. Gap severity: 0 none, 1 minor, 2 major, 3+ critical.

=== "rag"

    | Value | Label | Meaning |
    |-------|-------|---------|
    | 0 | Red | Not met, or no evidence |
    | 1 | Amber | Partially met, or evidence incomplete or stale |
    | 2 | Green | Met with current evidence |

    `default_target: 2`. Gap severity: 0 none, 1 minor, 2+ critical.

## Risk method

`kind: risk-method`. Built-in: [`iso31000-5x5`](https://github.com/majlisofai/govkit/blob/main/plugins/govkit/methods/risk/iso31000-5x5.yaml). The scales and bands are GovKit defaults, not text from ISO 31000.

| Key | Description |
|-----|-------------|
| `likelihood[]`, `impact[]` | `value`, `label` |
| `bands[]` | `min`, `max` (score = likelihood × impact), `label`, `treatment` |
| `appetite_default` | A band label |
| `treatments` | ArcKit's 4Ts → ISO 31000 treatment options |

| Score | Band | Treatment |
|-------|------|-----------|
| 1–4 | Low | Accept and monitor |
| 5–9 | Medium | Treat within the delivery plan |
| 10–16 | High | Treat before next gate; owner at second line |
| 17–25 | Critical | Escalate to governing body; NO-GO until treated |

Likelihood: Rare, Unlikely, Possible, Likely, Almost certain. Impact: Negligible, Minor, Moderate, Major, Severe. `appetite_default: Medium`.
