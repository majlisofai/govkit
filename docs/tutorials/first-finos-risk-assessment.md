# Your first FINOS AI risk assessment

In this tutorial, we will use GovKit's FINOS module to assess an AI system against the [FINOS AI Governance Framework](https://air-governance-framework.finos.org/). We will install the module and read how FINOS describes a risk and a mitigation. Then we will assess a sample AI system, find two risks above appetite, fix one, accept the other, and assess the system again. Last, we will line FINOS up against ISO/IEC 42001.

The system is invented: *Advisor Copilot*, an assistant that helps an imaginary bank's wealth-management advisers answer questions from the bank's research library. It uses a third-party hosted language model. We will use its evidence pack from the GovKit repository.

By the end, your repository will contain:

```text
.govkit/doc-types.json                          ← now knows FNRA
.govkit/frameworks/finos-aigf.yaml              ← FINOS's 25 mitigations
solutions/advisor-copilot/                      ← the sample evidence pack
projects/003-advisor/
  finos/GOV-003-FNRA-001-v1.0.md                ← first assessment: two risks above appetite
  exceptions/GOV-003-EXCP-001-v1.0.md           ← an accepted risk
  finos/GOV-003-FNRA-002-v1.0.md                ← second assessment
  GOV-003-XWLK-v1.0.md                          ← ISO/IEC 42001 ↔ FINOS crosswalk
```

Your project number may differ.

## Before you start

You need the repository from [Your first governed repository](first-governed-repository.md), with ArcKit and GovKit installed and a GovKit profile. You also need git. You don't need to have done the GovStack tutorial.

Claude writes the artefacts, so their wording, and the exact likelihood and impact scores, will differ from run to run. The applicable risks, and the two risks above appetite described here, should match.

## 1. Install the FINOS module

The module comes from the GovKit marketplace you added in the first tutorial. In a terminal, install it:

```bash
claude plugin install govkit-finos@majlisofai
```

Start Claude Code in your repository and apply the module:

```text
/govkit-finos:apply --activate
```

GovKit reports a table: one doc type created, one file created. Look at what changed.

Open `.govkit/doc-types.json`. It now has an `FNRA` entry, the FINOS AI Risk Assessment. Notice `"subdir": "finos"`: each assessment goes in a `finos/` folder in the project, one per AI system.

Open `.govkit/frameworks/finos-aigf.yaml`. Notice the first line:

```text
# govkit-overlay govkit-finos@0.1.0 — refreshed by /govkit-finos:apply; …
```

This line says the module owns the file. Running `apply` again after an upgrade refreshes it.

Run `/govkit:profile show` and notice that `finos-aigf` is now in `frameworks.active`, next to ISO/IEC 42001.

## 2. Read a mitigation and a risk

FINOS has two catalogues: **risks** (what can go wrong) and **mitigations** (what reduces a risk). GovKit installs the mitigations as a framework, so its existing commands can assess them.

In `finos-aigf.yaml`, search for `id: mi-16`:

```yaml
  - id: mi-16
    group: Detective
    title: "Preserving Source Data Access Controls in AI Systems"
    intent: "Permissions on source data are carried into indexes and retrieval, so users only see content they are already entitled to."
    obligation: recommended
    attributes: { ref: "mi-16", type: DET, mitigates: "ri-2 ri-22" }
    mappings: { iso-iec-42001: [A7, A9] }
```

Notice three things:

- `mitigates` names the FINOS risks this mitigation reduces
- `mappings` comes from FINOS's own references to ISO/IEC 42001, so GovKit doesn't have to guess how the two line up
- the intent is GovKit's one-sentence paraphrase. The `citation_url` field points at FINOS's full text.

Count the mitigations, and the ones FINOS still marks as Draft:

```bash
grep -c "^  - id: " .govkit/frameworks/finos-aigf.yaml
grep -c "obligation: draft" .govkit/frameworks/finos-aigf.yaml
```

You should see `25` and `2`.

The risk catalogue stays inside the module. We need the GovKit repository for the evidence pack anyway, so clone it and look at one risk:

```bash
git clone --depth 1 https://github.com/majlisofai/govkit.git /tmp/govkit
grep -A 8 "id: ri-10" /tmp/govkit/plugins/govkit-finos/references/risk-catalogue.yaml
```

```yaml
  - id: ri-10
    display_id: AIR-SEC-010
    title: "Prompt Injection"
    category: Security
    status: approved
    summary: "Direct or indirect instructions in inputs or retrieved content make the model ignore its intended behaviour."
    triggers: [foundation-model, rag, agentic]
    mitigated_by: [mi-3, mi-17, mi-19]
```

The `triggers` decide when a risk applies. Prompt injection applies to any system that uses a foundation model, retrieves content, or runs agents. The triggers are GovKit's judgement, not FINOS's, and the assessment checks each one against evidence.

## 3. Add the sample AI system

Copy the Advisor Copilot evidence pack into your repository:

```bash
mkdir -p solutions
cp -R /tmp/govkit/examples/finos/advisor-copilot solutions/
git add solutions && git commit -m "Add Advisor Copilot evidence pack"
```

Look inside `solutions/advisor-copilot/`. Open `docs/system-card.md` and find the **Architecture features** table. It says the copilot retrieves from a vector store, but calls no tools, uses no MCP servers, keeps no memory and loads no plugins. That table will decide a third of the triage.

## 4. Assess the system

```text
/govkit-finos:risk-assess advisor "Advisor Copilot" — evidence is in solutions/advisor-copilot
```

GovKit reads the evidence pack and decides each trigger. If it asks about something the pack doesn't settle, give these answers:

| GovKit asks about | Answer |
|-------------------|--------|
| Whether outputs reach clients | Advisers sometimes paste edited drafts into client letters |
| Whether the copilot informs decisions about individual clients | No. Suitability stays in the existing advice process. |
| Whether a regulator supervises the activity | Yes. Advisers give regulated investment advice. |

GovKit writes `projects/003-advisor/finos/GOV-003-FNRA-001-v1.0.md`. Open it.

**AI System Profile.** In the **Triggers** table, notice that `hosted-model`, `rag`, `confidential-data`, `regulated-activity` and `generated-content` are present, each citing a file in the pack. `agentic`, `mcp`, `multi-agent`, `persistent-memory` and `plugins` are absent, citing the system card.

**Risk Triage.** Every FINOS risk has a row: **16 applicable** and **8 not applicable**. The not-applicable ones are the seven agent, MCP and plugin risks (`ri-24` to `ri-30`) and `ri-16` Bias and Discrimination, because the copilot makes no decisions about individuals. Dropping a risk without a row would hide the reasoning, so GovKit never does.

**Mitigation Results.** Look at three kinds of rating:

| Mitigation | Rating | Why |
|------------|--------|-----|
| `mi-10` AI Model Version Pinning | Implemented | `config/model.yaml` pins the version, and `docs/operations.md` describes change control |
| `mi-16` Preserving Source Data Access Controls | Not implemented | `docs/architecture.md` says retrieval ignores source permissions, and `test-reports/access-test-2026-10-16.md` shows the result |
| `mi-18` Agent Authority Least Privilege | Not relevant | It mitigates `ri-18`, which applies, but only for agents, and the copilot has none |

Find `mi-3` and `mi-17`, the input/output filtering and AI firewall mitigations. `mi-17` is Not implemented. `mi-3` is at best Partly implemented: the provider's content filter is on, but the bank filters nothing itself.

**Residual Risk.** Two risks are **Above appetite**:

| Risk | Why it stays high |
|------|-------------------|
| `ri-10` Prompt Injection | `test-reports/red-team-2026-10-16.md`: 14 of 40 instructions hidden in research-feed documents changed the copilot's drafts, 9 of them into a planted "buy" recommendation. Neither filtering mitigation is in place. |
| `ri-2` Information Leaked to Vector Store | The access test shows Restricted research reaching advisers who cannot open it in the research library. Encryption and labels don't help when retrieval ignores them. |

Every other applicable risk should be within the default Medium appetite. If your run rates another risk above appetite, read its rationale in **Residual Risk**. It names the evidence it found missing.

Look at **Risks Raised**. GovKit proposes both risks for the ArcKit risk register, with their FINOS identifiers, but doesn't write the register itself. That is `/arckit:risk`'s job.

## 5. Fix the vector store leak

The fix for `ri-2` is to make retrieval respect source permissions, then prove it with a test.

In `solutions/advisor-copilot/config/model.yaml`, change the retrieval block:

```yaml
retrieval:
  index: research-all                 # single index, all research teams
  top_k: 8
  filter: source-acl                  # only chunks the adviser can open in the research library
```

In `solutions/advisor-copilot/docs/architecture.md`, replace the **Retrieval access** bullet with:

```markdown
- **Retrieval access.** Each chunk carries its source document's access list as well as its classification. At query time the orchestrator looks up the adviser's research-library entitlements and filters retrieval to chunks the adviser can open in the library. Entitlement changes apply within 15 minutes. If the entitlement lookup fails, retrieval returns nothing and the copilot says it cannot answer.
```

Create `solutions/advisor-copilot/test-reports/access-test-2026-10-23.md`:

```markdown
# Access-control retest — Advisor Copilot 1.4.1

Staging, 2026-10-23. Information Security, with the research compliance team. Retest of finding AC-1 after permission-aware retrieval (`filter: source-acl`).

| Test adviser | Desk | Answers citing Restricted passages | Restricted documents exposed |
|--------------|------|------------------------------------|------------------------------|
| A | Retail wealth | 0 of 30 | 0 |
| B | Private clients | 0 of 30 | 0 |
| C | Intermediary | 0 of 30 | 0 |
| D (entitled, equity desk) | Equity research | 9 of 30 | as entitled |

Adviser C's entitlement was removed during the test. Restricted passages stopped appearing within 11 minutes. With the entitlement service stopped, every query returned "cannot answer".

AC-1 is closed.
```

Commit the three files.

## 6. Accept the prompt-injection risk

The real fix for `ri-10` is an AI firewall, and the bank is buying one for every AI system. It won't be live before the copilot's go-live. Until then, the service owner decides to accept the risk with a compensating control. That is a governance decision, so we record it as an exception against the missing mitigation:

```text
/govkit:exception advisor finos-aigf:mi-17 "No AI firewall until the bank-wide AI gateway goes live; prompt injection through research feeds stays above appetite until then"
```

GovKit asks for what it needs. Answer that the request comes from the Head of Wealth Advisory Technology, that the exception expires on **2027-03-31**, and that the compensating control is: third-party feed documents are quarantined and checked for hidden text by research operations before ingestion, and advisers must verify any recommendation against the cited source before using it.

Open `projects/003-advisor/exceptions/GOV-003-EXCP-001-v1.0.md`. Notice that the decision is **PENDING**: GovKit records the request, and the approver named by your operating model decides.

## 7. Assess again

```text
/govkit-finos:risk-assess advisor "Advisor Copilot" — evidence is in solutions/advisor-copilot
```

GovKit writes the next assessment, `finos/GOV-003-FNRA-002-v1.0.md`, beside the first. Open it and compare:

- `mi-16` is now **Implemented**, citing the retest report
- `ri-2` is now **Within appetite**. Its residual likelihood dropped, because a mitigation is now evidenced.
- `ri-10` is still **Above appetite**, with the same residual rating. In **Gaps and Actions**, it links to `GOV-003-EXCP-001`.

An exception records that the organisation accepts a risk for a while. It doesn't reduce the risk. The residual rating falls when the firewall is live and a new red-team test shows it working.

## 8. Line FINOS up against ISO/IEC 42001

Your profile's primary framework is ISO/IEC 42001. A crosswalk shows which FINOS mitigations give evidence for which ISO areas, so one piece of evidence can serve both:

```text
/govkit:crosswalk advisor iso-iec-42001 finos-aigf
```

Open `projects/003-advisor/GOV-003-XWLK-v1.0.md`:

- Find the row for ISO **A7 Data for AI systems**. Its FINOS cell lists `mi-1`, `mi-2`, `mi-6`, `mi-12`, `mi-14` and `mi-16`. These come from the `mappings` field we read in step 2, which is FINOS's own mapping, so the crosswalk doesn't mark them as judgement.
- Look for `mi-19`, `mi-20`, `mi-22`, `mi-23` and `mi-25`, the agent, MCP and plugin mitigations. FINOS gives no ISO reference for them, so each is either under **Unmapped Controls** or mapped with a one-line `judgement` rationale.

## What you have done

You have:

- installed GovKit's FINOS module through GovKit's own extension points
- read how FINOS links a mitigation to the risks it reduces and to ISO/IEC 42001
- profiled an AI system and seen its architecture decide which risks apply
- seen three kinds of mitigation rating: implemented, missing, and not relevant to the design
- found two risks above appetite from test evidence, not from documents
- fixed one with a design change and a retest, and accepted the other as an exception that leaves the residual rating unchanged
- lined FINOS up against ISO/IEC 42001 using FINOS's own references

The assessment you produced is a self-assessment against the FINOS catalogue. FINOS publishes guidance, not a certification scheme.

## Next steps

- Add the two risks to the ArcKit risk register with `/arckit:risk advisor`.
- See the copilot's maturity on every FINOS mitigation with `/govkit:assess advisor finos-aigf`.
- Assess an agentic system and watch `ri-24` to `ri-30` apply. See [Assess an AI system against the FINOS risks](../how-to/finos/assess-ai-system-risk.md).
- Look up every field and rule in the [FINOS module reference](../reference/finos-module.md).
- Read [about GovKit modules](../explanation/overlays.md) to see why the module triages risks first and never lets an exception lower a residual rating.
