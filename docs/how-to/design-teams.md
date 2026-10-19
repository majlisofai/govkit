# How to design teams for a project

This guide shows you how to produce a governed team design (a TEAM artefact with a draw.io team matrix) using Team Topologies, business streams and virtual chapters.

## Prepare

Have these in place if you can. GovKit proposes streams, owners and platform capabilities from them:

| Artefact | Gives |
|----------|-------|
| ArcKit business case (`SOBC`), strategy (`STRAT`), roadmap (`ROAD`) | Candidate business streams |
| ArcKit requirements (`REQ`) | The load per stream |
| ArcKit stakeholders (`STKE`) | Product Owners |
| ArcKit Wardley value chain or map (`WVCH`, `WARD`) | Platform candidates, from commodity components |
| ArcKit platform design (`PLAT`) | The existing platform strategy |
| `GOV-000-GMOD` | Decision rights the design must respect |

Without them, GovKit interviews you.

## Design

1. Run:

    ```text
    /govkit:team-design 001 "AI Innovation Hub"
    ```

    To start from an existing model, add `--from model.json`.

2. Answer each question. GovKit proposes an answer from the inputs, and you correct it:
    1. **Business streams.** Confirm each stream and its source. If two streams should be split or merged, say which fracture plane applies, for example business domain, regulatory compliance, change cadence or risk.
    2. **Chapters.** Confirm the crafts and name each chapter's lead. The lead works in a team.
    3. **Staffing.** Give the members per chapter for each stream. If you don't know the demand yet, accept balanced numbers. They are recorded as assumptions.
    4. **Platform.** Confirm the shared capabilities and, where one serves only some streams, its consumers.
    5. **Enabling and complicated-subsystem teams.** Add one only with a reason, and give every collaboration or facilitating interaction an end date.
    6. **Focal team.** Optionally, name the team the decision is about. It is outlined in the brand's accent colour.

## Resolve the rule check

GovKit validates the model against the team-model rules.

- **If a rule FAILs**, change the design: resize a team, name a missing lead, add an end date. GovKit won't weaken a rule to get a pass.
- **If your organisation genuinely wants a different rule**, [change the team rules](change-the-team-rules.md), then run the skill again.
- **If a rule WARNs**, either accept it with a reason or record an action. Both go into the artefact.

## Check the result

GovKit writes, in the project folder:

```text
GOV-001-TEAM-v1.0.md          ← the governed document
GOV-001-TEAM-v1.0.json        ← the model, the source of truth
GOV-001-TEAM-v1.0.drawio      ← the team matrix
GOV-001-TEAM-v1.0.drawio.svg  ← exports, when draw.io desktop is installed
```

If labels overflow in the matrix, ask GovKit to shorten the team's short name or mission. Don't edit the `.drawio` file: it is rendered from the JSON and your edits would be lost on the next version.

Then run `/govkit:gate` if a gate needs the team design, or `/arckit:roadmap` to phase the build-up.
