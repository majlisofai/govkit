# GovKit GovStack overlay

A [GovKit](../govkit/README.md) overlay for [GovStack](https://govstack.global/) building-block specifications. It requires `govkit@majlisofai`, which requires ArcKit.

```bash
claude plugin marketplace add majlisofai/govkit
claude plugin install govkit-govstack@majlisofai
```

Then, in a GovKit-governed repository:

```text
/govkit-govstack:apply --activate          # register GSBB/GSCA, install govstack-cfr
/govkit-govstack:map my-project            # services → building blocks
/govkit-govstack:bb add identity           # building-block requirements as a framework
/govkit-govstack:compliance my-project identity "National ID platform"
```

| Command | Produces | Purpose |
|---------|----------|---------|
| `/govkit-govstack:apply` | `.govkit/doc-types.json` entries, `.govkit/frameworks/govstack-cfr.yaml` | Install the overlay through GovKit's extension points |
| `/govkit-govstack:bb` | `.govkit/frameworks/govstack-bb-<id>.yaml` | List, show, add or refresh building-block frameworks |
| `/govkit-govstack:map` | `GOV-NNN-GSBB-vN.N` | Map services and needs to building blocks |
| `/govkit-govstack:compliance` | `govstack/GOV-NNN-GSCA-NNN-vN.N` | Self-assess a solution: every REQUIRED met, RECOMMENDED share, runtime evidence for OBSERVABLE |

It also ships the `govstack-method` skill and the `govstack-spec-reader` agent, and reuses GovKit's evidence-reader and control-assessor agents.

New to the overlay? Follow the tutorial [Your first GovStack self-assessment](https://majlisofai.github.io/govkit/tutorials/first-govstack-self-assessment/), which uses the sample evidence pack in [`examples/govstack/`](../../examples/govstack/). For details, see the [GovStack overlay reference](https://majlisofai.github.io/govkit/reference/govstack-overlay/).

## Data

The overlay reads public pages on `specs.govstack.global` through Claude's WebFetch tool when you run `/govkit-govstack:bb` or `/govkit-govstack:map`. It sends no project data anywhere.

GovStack specifications © their authors. The overlay keeps GovStack's requirement titles and identifiers, and paraphrases their intents.
