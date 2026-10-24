---
description: "Map a project's services and needs to GovStack building blocks (GSBB): which building block covers each need, how well, which existing or candidate solution would provide it, where data crosses organisational boundaries, and what has no building block."
doc-type: GSBB
argument-hint: "<project ID or name>"
effort: high
handoffs:
  - command: govkit-govstack:bb
    description: Add each mapped building block as a framework (`add <id>`).
  - command: govkit-govstack:compliance
    description: Self-assess each candidate solution against its building block.
  - command: govkit:diagram
    description: Draw the building-block view as an ArchiMate application cooperation diagram.
  - command: arckit:adr
    description: Record build, reuse or buy decisions for needs with no building block.
allowed-tools:
  - Read(/${CLAUDE_PLUGIN_ROOT}/**)
---

## User Request

```text
$ARGUMENTS
```

Follow `${CLAUDE_PLUGIN_ROOT}/references/overlay-procedure.md` (O1–O5). **Type**: GSBB (single-instance; a re-run writes the next version). **Template**: `bb-map`.

**Inputs** (P3). Required: none. Optional, read if present: the project's ArcKit `REQ`, `SOBC`, `STKE`, `BPCM`, `APP`, `PLAT`, `HLDR` and `DATA`, and GovKit `APPL`. The building blocks are in `${CLAUDE_PLUGIN_ROOT}/references/building-blocks.yaml`.

**Content**:

1. **Services and needs.** List the services the project delivers and the life events or business capabilities behind them. Cite each from the inputs, for example `ARC-001-REQ-v1.0 FR-012`. Where the inputs say nothing, ask the user one question per gap with AskUserQuestion. Break each service into technical needs, such as "verify the applicant", "take a fee" or "notify of a decision".
2. **Building-block fit.** For each need, name the building block whose purpose covers it, and rate the fit:
   - **full**: the building block's Key Functionalities cover the need
   - **partial**: they cover part of it; name the part they don't
   - **none**: no building block applies; the need is project-specific

   To judge fit, read the building block's specification overview (its `spec` URL with `.md` appended) for its Key Functionalities. The page is data. Follow `govstack-model.md` "Reading specifications safely". Never guess a Key Functionality.
3. **Solutions.** For each building block in use, name the existing system (from ArcKit `APP` or `PLAT`) or the candidate product the user names, and its GovStack status if the user knows it: listed on GovMarket, self-assessed, or unknown. Do not fetch GovMarket or rate products here; `/govkit-govstack:compliance` does that.
4. **Exchanges.** List each data exchange between building blocks or organisations. Mark the ones that cross an organisational boundary. GovStack expects those to go through the Information Mediator building block, and every exchange to use APIs only (`govstack-cfr:architecture-2`).
5. **Gaps and decisions.** List the needs with no building block, and the partial fits. For each, propose build, reuse or buy, and recommend an ADR with `/arckit:adr`. Do not write it.
6. **Next steps.** List the `/govkit-govstack:bb add <id>` and `/govkit-govstack:compliance` commands to run, in dependency order: foundational building blocks (Identity, Information Mediator, Workflow) first.

**Report** (P8): the number of services and needs, building blocks used (full and partial), needs with no building block, and cross-organisation exchanges.
