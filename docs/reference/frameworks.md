# Frameworks

Framework files are YAML in `frameworks/<id>.yaml`, validated against [`framework.schema.json`](https://github.com/majlisofai/govkit/blob/main/plugins/govkit/schemas/framework.schema.json). Start from [`_template.yaml`](https://github.com/majlisofai/govkit/blob/main/plugins/govkit/frameworks/_template.yaml).

## Header fields

Required: `id`, `kind`, `name`, `version`, `publisher`, `url`, `type`, `verified`, `text_policy`, `controls`.

| Field | Description |
|-------|-------------|
| `id` | Lowercase and hyphenated. Must equal the file name. |
| `kind` | `framework` |
| `name`, `version`, `publisher`, `url` | |
| `type` | `regulation`, `management-system`, `risk-framework`, `principles`, `policy`, `standard` |
| `verified` | Date the source was last checked. `validate` warns after 12 months. |
| `text_policy` | Whether intents are verbatim (only where the licence allows) or paraphrased |
| `related_arckit.overlay_commands` | ArcKit overlay commands that cover this framework, for example `["arckit-uae:uae-ai-charter"]`. GovKit hands off to them. |
| `structure` | Grouping levels, for example `[domain]` |

## Control fields

| Field | Required | Description |
|-------|----------|-------------|
| `id` | yes | Unique within the framework |
| `group` | yes | |
| `title` | yes | |
| `intent` | yes | One-sentence statement of what must be true |
| `evidence_hints` | no | ArcKit or GovKit doc-type codes likely to evidence it |
| `target` | no | Overrides the scale's `default_target` |
| `mappings` | no | Framework id → control ids. Feeds `/govkit:crosswalk`. |
| `citation_url` | no | Source of the control, set by the framework researcher |

```yaml
controls:
  - id: D1-01
    group: Domain 1
    title: Short title
    intent: One-sentence paraphrase of what must be true.
    evidence_hints: [PRIN, RISK]
    mappings: { nist-ai-rmf: [GOVERN-1], iso-iec-42001: [A2] }
```

## Built-in frameworks

| Id | Name | Version | Publisher | Type |
|----|------|---------|-----------|------|
| `iso-iec-42001` | ISO/IEC 42001 — AI management system | 2023 | ISO/IEC JTC 1/SC 42 | management-system |
| `nist-ai-rmf` | NIST AI Risk Management Framework | 1.0 | National Institute of Standards and Technology | risk-framework |
| `iso-iec-38500` | ISO/IEC 38500 — Governance of IT for the organisation | 2015 | ISO/IEC JTC 1/SC 40 | principles |

The built-in frameworks hold paraphrased control intents only. For jurisdiction-specific regulation (EU AI Act, UAE AI Charter, NIST 800-53 and others), GovKit hands off to ArcKit's overlay plugins.
