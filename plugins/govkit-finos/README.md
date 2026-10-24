# GovKit FINOS module

[GovKit](../govkit/README.md)'s module for the [FINOS AI Governance Framework](https://air-governance-framework.finos.org/), a catalogue of AI risks and mitigations for financial services. You add it from the GovKit marketplace. It requires `govkit@majlisofai`, which requires ArcKit.

```bash
claude plugin marketplace add majlisofai/govkit
claude plugin install govkit-finos@majlisofai
```

Then, in a GovKit-governed repository:

```text
/govkit-finos:apply --activate                        # register FNRA, install finos-aigf
/govkit-finos:risk-assess my-project "Advisor copilot"  # one AI system against the FINOS risks
/govkit:assess my-project finos-aigf                  # mitigation-by-mitigation maturity
/govkit:crosswalk my-project                          # FINOS ↔ ISO/IEC 42001
```

| Command | Produces | Purpose |
|---------|----------|---------|
| `/govkit-finos:apply` | `.govkit/doc-types.json` entry, `.govkit/frameworks/finos-aigf.yaml` | Install the module through GovKit's extension points |
| `/govkit-finos:risk-assess` | `finos/GOV-NNN-FNRA-NNN-vN.N` | Profile an AI system, triage the FINOS risks, check mitigation evidence, rate residual risk against appetite |

It also ships the `finos-method` skill, and reuses GovKit's evidence-reader and control-assessor agents.

## What it installs

- **`finos-aigf` framework**: the 25 FINOS mitigations as GovKit controls, grouped Preventative or Detective, each with the FINOS risks it mitigates and FINOS's own ISO/IEC 42001 references as `mappings`. `/govkit:assess`, `/govkit:crosswalk` and `/govkit:controls` work with it like any other framework.
- **Risk catalogue** (read in place, not installed): the 24 FINOS risks (operational, security, regulatory, and the agentic and MCP risks), with GovKit's applicability triggers.

New to the module? Follow the tutorial [Your first FINOS AI risk assessment](https://majlisofai.github.io/govkit/tutorials/first-finos-risk-assessment/), which uses the sample evidence pack in [`examples/finos/`](../../examples/finos/). For details, see the [FINOS module reference](https://majlisofai.github.io/govkit/reference/finos-module/).

## Data

The module sends no project data anywhere. Its catalogue is pinned to a FINOS commit in [`upstream/finos.lock.json`](../../upstream/finos.lock.json). Maintainers check it for drift with `scripts/check-finos.py`.

FINOS AI Governance Framework © FINOS, licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The module keeps FINOS's identifiers, titles, types and risk-to-mitigation links, and paraphrases their descriptions.
