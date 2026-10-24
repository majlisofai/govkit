# FINOS module

GovKit's FINOS AI Governance Framework module, `govkit-finos` 0.1.0, namespace `/govkit-finos:*`. Installed from the GovKit marketplace (`majlisofai`). Requires GovKit 0.4.0 or later and below 1.0.0. Source: [`plugins/govkit-finos/`](https://github.com/majlisofai/govkit/tree/main/plugins/govkit-finos).

It reaches GovKit only through its extension points, like the [GovStack module](govstack-overlay.md). For why the module is built this way, see [GovKit modules](../explanation/overlays.md#the-finos-module). To learn it step by step, follow the tutorial [Your first FINOS AI risk assessment](../tutorials/first-finos-risk-assessment.md).

## Commands

| Command | Arguments | Produces |
|---------|-----------|----------|
| `apply` | `[--central] [--activate] [--dry-run]` | `.govkit/doc-types.json` entry; `finos-aigf.yaml` in `.govkit/frameworks/` or, with `--central`, the organisation layer |
| `risk-assess` | `<project> <AI system name> [evidence paths]` | `finos/GOV-<PID>-FNRA-<NNN>-v<V>.md` |

| Command | Handoffs |
|---------|----------|
| `apply` | `govkit-finos:risk-assess`, `govkit:profile` |
| `risk-assess` | `arckit:risk`, `govkit:exception`, `arckit-agent-architecture:agent-security`, `govkit:gate` |

## Skill and agents

| Name | Kind | Purpose |
|------|------|---------|
| `finos-method` | Skill, model-invoked | FINOS vocabulary and routing. Not for contributing to the FINOS framework. |
| `govkit-evidence-reader` | GovKit agent, reused by `risk-assess` | Extracts evidence for each mitigation |
| `govkit-control-assessor` | GovKit agent, reused by `risk-assess` | Rates each mitigation Not implemented (0), Partly implemented (1) or Implemented (2) |

## Doc types

Registered in `.govkit/doc-types.json` by `apply`. Defined in the module's `govkit-overlay.json`.

| Code | Name | Category | Command | Multi-instance | Subdir |
|------|------|----------|---------|----------------|--------|
| FNRA | FINOS AI Risk Assessment | Assurance | `govkit-finos:risk-assess` | yes, one per AI system | `finos` |

## The `finos-aigf` framework

The 25 FINOS mitigations as GovKit controls. `type: risk-framework`.

| Group | Mitigations |
|-------|-------------|
| Preventative | `mi-2`, `-3`, `-5`, `-6`, `-7`, `-8`, `-10`, `-12`, `-14`, `-17`, `-18`, `-19`, `-20`, `-22`, `-23`, `-24`, `-25` |
| Detective | `mi-1`, `-4`, `-9`, `-11`, `-13`, `-15`, `-16`, `-21` |

`mi-24` (Human-in-the-loop action approval gate) and `mi-25` (Skill/plugin integrity and governance) are Draft at FINOS: `obligation: draft`.

In GovKit citations, use `finos-aigf:mi-3`.

| FINOS field | GovKit field |
|-------------|--------------|
| `mi-<n>`, title | `id`, `title`, `attributes.ref` |
| PREV / DET | `group` Preventative / Detective, `attributes.type` |
| `mitigates` | `attributes.mitigates`, space-separated risk ids |
| `doc-status` Approved / Draft | `obligation` `recommended` / `draft` |
| `iso-42001_references`, for example `A-6-2-6` | `mappings.iso-iec-42001`, at GovKit's Annex A area (`A6`) |
| Mitigation page | `citation_url` |

Intents are paraphrased for GovKit. Evidence hints point at ArcKit artefacts: SECD, DATA, OPS, MLOPS, the agent artefacts AASE, AAGR, AAOV and AAIN, and others.

Because of the `mappings`, `/govkit:crosswalk` lines FINOS up against ISO/IEC 42001 from FINOS's own references, not judgement. `/govkit:assess <project> finos-aigf` rates each mitigation on the profile's assessment scale.

## The risk catalogue

[`references/risk-catalogue.yaml`](https://github.com/majlisofai/govkit/blob/main/plugins/govkit-finos/references/risk-catalogue.yaml), read by `risk-assess` in place. It is not installed into the project.

| Category | Risks |
|----------|-------|
| Operational | `ri-4`, `-5`, `-6`, `-7`, `-14`, `-16`, `-17`, `-18`, `-19`, `-20`, `-28` |
| Security | `ri-2`, `-8`, `-9`, `-10`, `-24`, `-25`, `-26`, `-27`, `-29`, `-30` (Draft) |
| Regulatory and compliance | `ri-1`, `-22`, `-23` |

| Field | Source |
|-------|--------|
| `id`, `display_id` (`AIR-SEC-010`), `title`, `category`, `status` | FINOS |
| `mitigated_by` | FINOS, inverted from each mitigation's `mitigates` |
| `external_refs` (OWASP LLM, OWASP agentic, EU AI Act), `related_risks`, `citation_url` | FINOS |
| `summary` | GovKit paraphrase |
| `triggers` | GovKit judgement: the AI system features that make the risk applicable |

Triggers: `foundation-model`, `hosted-model`, `confidential-data`, `rag`, `fine-tuning`, `agentic`, `mcp`, `multi-agent`, `persistent-memory`, `plugins`, `customer-facing`, `decisions-about-people`, `regulated-activity`, `generated-content`. They are defined at the top of the file.

## Assessment rules

| Step | Rule |
|------|------|
| Profile | Every trigger is decided present or absent, with evidence, before any risk is judged |
| Triage | Every catalogue risk gets a row. Applicable when any trigger is present, unless the evidence shows the risk cannot arise. |
| Inherent risk | Likelihood × impact on the profile's risk method (`methods.risk`, default `iso31000-5x5`) |
| Mitigations | Each mitigation in scope is rated once: Implemented, Partly implemented, Not implemented, or Not relevant (with a rationale). No evidence means Not implemented. |
| Residual risk | Re-rated after Implemented and Partly implemented mitigations only |
| Verdict per risk | Within appetite, or Above appetite against the risk method's appetite |
| Gaps | Severity from the residual band: Critical → critical, High → major, Medium → moderate. Proposed for `/arckit:risk`. An acceptance is a `/govkit:exception`, and the residual rating stays. |
| Regulatory risks | Hand off to `/arckit-eu:eu-ai-act`, `/arckit-eu:eu-dora` and other ArcKit regime commands in scope |
| Agentic risks | Cite AAGR, AAGI, AASE, AAOV. Recommend `/arckit-agent-architecture:agent-security` when no AASE exists. |

Every FNRA states that it is a self-assessment against the FINOS catalogue. FINOS publishes guidance, not a certification scheme.

## Upstream pin

[`upstream/finos.lock.json`](https://github.com/majlisofai/govkit/blob/main/upstream/finos.lock.json) pins the FINOS commit behind the module. The `v2` tag predates the agentic additions (`ri-29`, `ri-30`, `mi-24`, `mi-25`) that the published site shows, so the module pins a `main` commit.

```bash
python3 scripts/check-finos.py             # drift against the pinned commit
python3 scripts/check-finos.py --ref main  # what a re-pin would change
```

The script compares identifiers, titles, types, status, links, ISO areas, external references and URLs. It needs network access, so it is not part of the commit checks. To re-pin, see [Take a new FINOS release](../how-to/maintainers/take-a-finos-release.md).

## Provenance and licence

Files that `apply` writes start with:

```text
# govkit-overlay govkit-finos@0.1.0 — refreshed by /govkit-finos:apply; delete this line to take ownership
```

FINOS AI Governance Framework © FINOS, licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The module keeps FINOS's identifiers, titles, types and links, and paraphrases descriptions.
