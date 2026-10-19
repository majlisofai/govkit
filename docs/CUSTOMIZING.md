# Customizing GovKit

You can customize everything without forking. Each kind of customization has its own layer, and project files always win over built-in ones.

## The profile: choose

`.govkit/profile.yaml` selects what is used. `/govkit:init` writes it, and `/govkit:profile set` edits it. Only the keys that differ from [`profile.default.yaml`](../plugins/govkit/config/profile.default.yaml) need to be in the file.

```yaml
govkit_profile: 1
extends: ../org-governance/profile.yaml   # optional organisation-wide layer
organisation: { name: "Example Authority", jurisdictions: [UAE] }
approach:  { operating_model: three-lines, lifecycle: stage-gate, posture: compliance-led }
methods:   { assessment_scale: rag, risk: acme-risk-4x4 }
frameworks:
  active: [iso-iec-42001, nist-ai-rmf, acme-ai-policy]
  primary: acme-ai-policy
tools:
  arckit:
    overlays: [arckit-uae]
    commands: { exclude: [tcop, service-assessment], substitute: { conformance: "govkit:assess" } }
    template_overrides: [risk-register, requirements]
```

## Methods and frameworks: define

To define your own, add YAML files with the same structure as the built-in ones:

| You want to… | Add | Start from |
|--------------|-----|------------|
| Use your own risk matrix | `.govkit/methods/risk/<id>.yaml` | `methods/risk/iso31000-5x5.yaml` |
| Use a different rating scale | `.govkit/methods/scales/<id>.yaml` | `methods/scales/maturity-0-5.yaml` |
| Run your own gates | `.govkit/methods/lifecycles/<id>.yaml` | `methods/lifecycles/stage-gate.yaml` |
| Model your governance roles | `.govkit/methods/operating-models/<id>.yaml` | `methods/operating-models/three-lines.yaml` |
| Assess against your own policy | `.govkit/frameworks/<id>.yaml` | `frameworks/_template.yaml`, or `/govkit:framework add` |
| Use licensed ISO text | `.govkit/frameworks/iso-iec-42001.yaml` (same id, overrides) | the built-in file |

Then set the id in the profile and run `/govkit:profile validate`.

## Templates: reshape output

- **GovKit artefacts:** copy `plugins/govkit/templates/<name>-template.md` to `.govkit/templates-custom/` and edit it. Keep the `<!-- DOC-CONTROL-HEADER -->` marker and the section headings that commands fill in.
- **ArcKit artefacts:** don't edit them by hand if you want GovKit to manage them. List the template in `tools.arckit.template_overrides`, and add or adjust a rule in `references/govkit/arckit-overrides.md` (in this repo, or in a fork of the rules file only). `/govkit:apply` regenerates the override from the *current* ArcKit template each time, so ArcKit improvements still flow through. If you write `.arckit/templates-custom/` files by hand, GovKit leaves them alone.

## New artefact types

Register a custom code in `.govkit/doc-types.json`:

```json
{ "AIIA": { "name": "AI Impact Assessment", "category": "Assurance", "multiInstance": true, "subdir": "impact" } }
```

The filename hook and the ID generator accept it straight away. Write a command for it in your own small plugin, or ask Claude to produce it with a template in `.govkit/templates-custom/`.

## New commands, skills or agents

To add commands, skills or agents for everyone, add them under `plugins/govkit/` in this repository and run `node scripts/check-compat.mjs`. It verifies every `arckit:` and `govkit:` reference you write. For organisation-private additions, make a second small plugin that depends on `govkit`, using the same pattern GovKit uses with ArcKit.
