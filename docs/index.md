# GovKit

**A customizable governance overlay for [ArcKit](https://github.com/tractorjuice/arc-kit).** GovKit is a Claude Code plugin that adds commands, skills and agents under the `/govkit:*` namespace.

ArcKit produces the architecture artefacts: principles, requirements, risk, designs, ADRs and more. GovKit governs them the way your organisation does. You choose:

| You choose | Examples |
|------------|----------|
| **Approach** | Operating model, lifecycle, posture |
| **Methods** | Assessment scale, risk method, evidence rules, team model |
| **Frameworks** | ISO/IEC 42001, NIST AI RMF, ISO/IEC 38500, your own policies |
| **Tools** | Which ArcKit commands and overlays to use, the diagram tool, the tracker |
| **Brand** | How every output looks and reads |

GovKit then runs assessments, crosswalks, control and evidence registers, stage gates, exceptions, board reports, team designs and diagrams on top of ArcKit. It never forks or edits ArcKit, so you can take every future ArcKit release.

## Install

```bash
claude plugin marketplace add tractorjuice/arckit-claude
claude plugin marketplace add majlisofai/govkit
claude plugin install arckit@arckit-claude
claude plugin install govkit@majlisofai
```

## Find your way

The documentation follows the [Diátaxis](https://diataxis.fr/) framework. Choose by what you need right now:

<div class="grid cards" markdown>

-   **[Tutorials](tutorials/index.md)**

    *Learning.* Lessons that take you step by step through your first governed repository and your first team matrix.

-   **[How-to guides](how-to/index.md)**

    *Doing.* Directions for a specific task: create a brand, draw a diagram, design teams, add a framework, take an ArcKit release.

-   **[Reference](reference/index.md)**

    *Looking up.* Every command, profile key, file format and script, described exactly.

-   **[Explanation](explanation/index.md)**

    *Understanding.* Why GovKit is an overlay, why brands are central, why diagrams are draw.io, why teams are designed this way.

</div>
