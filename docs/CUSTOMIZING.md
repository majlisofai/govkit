# Customizing GovKit

You can customize everything without forking. Every content file resolves through three layers, first match wins:

1. **Project**: `.govkit/…` in this repository.
2. **Organisation**: the directory of the profile named by `extends:`. Use this for central control: a shared org-governance repository (or git submodule) holding `profile.yaml`, `brands/`, `diagram-styles/`, `frameworks/`, `methods/` and `templates-custom/`. Change it once, and every repository that extends it follows.
3. **Built-in**: `plugins/govkit/…`.

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
| Change team rules (size, required roles, chapter span, interaction limits) | `.govkit/methods/team-models/team-topologies.yaml` (same id overrides) | `methods/team-models/team-topologies.yaml` |
| Assess against your own policy | `.govkit/frameworks/<id>.yaml` | `frameworks/_template.yaml`, or `/govkit:framework add` |
| Use licensed ISO text | `.govkit/frameworks/iso-iec-42001.yaml` (same id, overrides) | the built-in file |

Then set the id in the profile and run `/govkit:profile validate`.

## Templates: reshape output

- **GovKit artefacts:** copy `plugins/govkit/templates/<name>-template.md` to `.govkit/templates-custom/` and edit it. Keep the `<!-- DOC-CONTROL-HEADER -->` marker and the section headings that commands fill in.
- **ArcKit artefacts:** don't edit them by hand if you want GovKit to manage them. List the template in `tools.arckit.template_overrides`, and add or adjust a rule in `references/govkit/arckit-overrides.md` (in this repo, or in a fork of the rules file only). `/govkit:apply` regenerates the override from the *current* ArcKit template each time, so ArcKit improvements still flow through. If you write `.arckit/templates-custom/` files by hand, GovKit leaves them alone.

## Brand: how everything looks and reads

`brand:` names a folder `brands/<id>/` containing `brand.yaml` and `assets/`. GovKit ships two:

- `tmofai`, The Majlis of AI. This is the default.
- `neutral`, which turns house style off.

To make your own, run `/govkit:create-brand --from <guideline.pdf | URL | design-system link>`, or run it with no source to be interviewed. It writes:

- the brand
- a matching draw.io diagram style
- a Mermaid theme

It checks every text colour pair for WCAG AA contrast, renders a preview diagram, and sets `brand:` in the project or the organisation profile. Then run `/govkit:apply`, which publishes the logo and re-themes ArcKit's dashboard and decks.

| `brand.yaml` section | Controls |
|----------------------|----------|
| `colours`, `typography`, `logo` | Diagram styles, ArcKit dashboard CSS, MARP deck theme, document header logo |
| `voice` | Tone, title case, writing standard, banned terms in every GOV artefact |
| `documents` | Header line, status labels, RAG wording and glyphs, date and number formats, callouts, footer |
| `diagrams` | draw.io style id, Mermaid `init` block and classes |
| `arckit` | Whether to theme `/arckit:pages` and `/arckit:presentation` |

A brand never changes Document Control, document IDs or section order.

**To change the brand centrally**, put the brand in the organisation layer and set `brand:` in the org profile:

```text
org-governance/            ← shared repo, e.g. a git submodule at ../org-governance
  profile.yaml             ← brand: acme
  brands/acme/brand.yaml
  brands/acme/assets/logo.svg
  diagram-styles/acme.yaml
my-project/.govkit/profile.yaml   ← extends: ../../org-governance/profile.yaml
```

## Diagrams

`tools.diagrams: drawio` is the default. It sends diagram work to `/govkit:diagram`, which writes an editable `.drawio` file plus `.drawio.svg` and `.drawio.png` exports, styled by `tools.drawio.style`. That setting defaults to `brand`, which uses the brand's diagram style. Set it to a diagram-style id to override the brand for diagrams only. `mermaid` and `plantuml` route back to `/arckit:diagram`.

## New artefact types

Register a custom code in `.govkit/doc-types.json`:

```json
{ "AIIA": { "name": "AI Impact Assessment", "category": "Assurance", "multiInstance": true, "subdir": "impact" } }
```

The filename hook and the ID generator accept it straight away. Write a command for it in your own small plugin, or ask Claude to produce it with a template in `.govkit/templates-custom/`.

## New commands, skills or agents

To add commands, skills or agents for everyone, add them under `plugins/govkit/` in this repository and run `node scripts/check-compat.mjs`. It verifies every `arckit:` and `govkit:` reference you write. For organisation-private additions, make a second small plugin that depends on `govkit`, using the same pattern GovKit uses with ArcKit.
