# GovKit modules

GovKit can be extended by modules: add-ons in the GovKit marketplace, named `govkit-<name>`, that bring a body of standards into GovKit governance. There are two: the GovStack module, `govkit-govstack`, and the FINOS module, `govkit-finos`. GovKit's runtime contract and tooling call modules *overlays*, which is why some file names say `govkit-overlay`. This page explains why modules are kept apart from GovKit core and why they're limited the way they are. It then explains why the GovStack module judges compliance as it does, and why the FINOS module starts from risks.

<figure markdown>
  ![Integration view: GovStack specifications feed GovKit's GovStack module, govkit-govstack, which reaches GovKit only through its extension points; ArcKit core stays unmodified beneath](../assets/diagrams/govkit-govstack-integration.drawio.png){ .diagram loading=lazy }
  <figcaption>Sheet A1.1, integration view. Edit the <a href="../../assets/diagrams/govkit-govstack-integration.drawio">.drawio source</a> in draw.io; the PNG also opens for editing.</figcaption>
</figure>

## Why a separate module

GovKit's built-in frameworks are governance frameworks: ISO/IEC 42001, the NIST AI RMF, ISO/IEC 38500. Each is a single file of control intents that slots into GovKit's existing commands. GovStack is a different kind of thing. It is a family of technical specifications with its own vocabulary (building blocks, key functionalities), its own requirement classifiers, its own compliance rule, and fourteen specifications that version independently. Fitting all of that into GovKit core would make every GovKit user carry concepts that only some need, and tie GovKit's releases to GovStack's.

The FINOS AI Governance Framework is different again: a catalogue of AI risks for financial services, with a separate catalogue of mitigations linked to them. It changes often, as FINOS adds risks for agents, MCP servers and plugins. It matters to banks and their suppliers, not to every GovKit user.

ArcKit faced the same choice with jurisdictions and answered it with overlay plugins such as `arckit-uae` and `arckit-eu`. GovKit uses the same answer one level up. An organisation that adopts GovStack adds the GovStack module from the GovKit marketplace, and a bank adds the FINOS module. An organisation that needs neither never sees them.

## Why only extension points

A module reaches GovKit exactly the way [GovKit reaches ArcKit](overlay-model.md): only through mechanisms GovKit already supports.

- **Doc types** go into `.govkit/doc-types.json`, the documented way to add artefact types. GovKit's filename hook and ID generator then accept them without knowing the module exists.
- **Frameworks** go into GovKit's project or organisation layer, so every GovKit command can resolve them.
- **Commands** live in the module's own namespace and follow GovKit's runtime contract and artefact procedure, so their artefacts look and behave like GovKit's.

The rule is deliberately the same in both directions. It means GovKit can change its internals without breaking modules, and a module can release without a GovKit release. GovKit's part of the bargain is small: a schema field (`related_govkit.overlay_commands`) so frameworks can hand off to module commands, generic `obligation` and `attributes` fields for source classifiers, and compatibility checks that cover modules as they cover GovKit.

## Why `apply` copies files

The module's frameworks could be read in place from the module's own folder, but that would need a fourth content layer, and GovKit's zero-dependency hook would have to discover installed modules. Instead, a module's `apply` command, such as `/govkit-govstack:apply`, copies them into a layer GovKit already reads, marked with a provenance line. This is the same pattern `/govkit:apply` uses for ArcKit template overrides:

- Re-running `apply` after an upgrade refreshes what the module owns.
- A file without the provenance line belongs to you and is never overwritten.
- The copy is visible and reviewable in the repository, like every other piece of governance configuration.

Only files that GovKit's own commands read are copied. The FINOS risk catalogue is read only by `/govkit-finos:risk-assess`, so it stays in the module, and upgrading the module updates it.

## The GovStack module

### Why the verdict is binary and strict

GovStack decides compliance with one rule: a solution must meet every REQUIRED requirement. GovKit's usual assessments rate maturity on a scale and talk about gaps. Applying a maturity scale to GovStack would invent nuance the standard doesn't have: a solution can't be "mostly compliant" with transport security. So the module rates each requirement Met or Not met, and reports RECOMMENDED coverage separately, as GovMarket does.

The same logic explains why an exception doesn't change the verdict. An exception is a governance decision to live with a gap for a while. It isn't evidence that the requirement is met, and treating it as such would make the self-assessment say something GovStack's own process would not.

### Why OBSERVABLE requirements need runtime evidence

GovStack classifies each requirement by how compliance can be verified. An OBSERVABLE requirement can be checked from outside the running system, through API calls, tests or telemetry. An AUDITABLE one needs inspection of internals. A design document that says "we use TLS 1.3" is a claim about an OBSERVABLE property, not a verification of it. GovStack's compliance testing would test the running system, so the self-assessment holds itself to the same standard. That also makes the gap list useful: it shows what to test before GovStack does.

## The FINOS module

### Why mitigations become the framework, and risks drive the assessment

A GovKit framework is a list of controls to rate. FINOS's mitigations fit that shape exactly, so the module installs them as `finos-aigf`, and `/govkit:assess`, `/govkit:crosswalk` and `/govkit:controls` work with them unchanged. FINOS also publishes which ISO/IEC 42001 controls each mitigation relates to. GovKit keeps those as `mappings`, so the crosswalk uses FINOS's own mapping where it has one and doesn't have to rely on judgement.

But a list of 25 mitigations rated one by one answers the wrong question for an AI system. A model risk committee wants to know which risks this system carries and whether they are under control. A missing agent-isolation control is serious for a multi-agent system, and has nothing to do with a retrieval assistant. So the module's own command starts from risks: it profiles the system, decides which risks apply, and only then checks the mitigations for those risks. Both views exist because both questions get asked.

### Why triggers, and why every risk gets a row

FINOS describes risks, not when they apply. The module adds triggers, the system features that make each risk relevant, such as a hosted model, retrieval, agents or regulated use. Triggers are GovKit's judgement, so the catalogue labels them as such. The assessment decides each trigger from evidence, never from a guess.

Every risk gets a triage row, including those that don't apply. A reviewer can then check the reasoning: "no agents, so `ri-24` to `ri-30` don't apply" is a claim they can test against the system card. A risk that silently disappears can't be checked.

### Why residual risk only falls on evidence

The module rates each risk twice with the profile's risk method: before mitigation (inherent) and after (residual). Residual risk falls only for mitigations that evidence shows are in place. A design document that promises a control, or a contract clause not yet in force, doesn't lower it. Test evidence decides when it exists: a red-team report showing that injections succeed outweighs an architecture document that says they are filtered.

For the same reason as in the GovStack module, an exception doesn't lower residual risk. Accepting a risk is a decision about the risk, and it doesn't change the risk. The assessment shows the risk above appetite and links to the exception, so a board sees both the risk and who accepted it.

### Why the module pins a commit

FINOS tags releases rarely, and its published site runs ahead of the last tag. The module pins the commit that matches the site, so the risks users read online are the ones GovKit assesses. `scripts/check-finos.py` compares the module with FINOS field by field, so moving to newer content is a reviewed change, not a silent one.

## Why self-assessment only

GovStack runs its own compliance process, with test suites and a marketplace listing. FINOS publishes guidance, with no certification scheme at all. Neither module replaces or imitates those. Each answers a governance question that comes earlier and more often: is this solution, AI system or supplier's claim ready? Labelling every verdict as a self-assessment keeps that distinction clear for a board reading a gate pack.
