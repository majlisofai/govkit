# Example — FINOS AI risk assessment

A small, fictional AI system for the tutorial [Your first FINOS AI risk assessment](../../docs/tutorials/first-finos-risk-assessment.md).

`advisor-copilot/` is the evidence pack for an imaginary bank's adviser assistant: retrieval over a research library, a third-party hosted model, advisory output reviewed by a human. It contains no runnable code: only the documents, configuration and test reports that `/govkit-finos:risk-assess` reads as evidence.

The pack is built to teach triage and residual risk:

| What | Why | Rule it teaches |
|------|-----|-----------------|
| 16 of the 24 FINOS risks apply. The 7 agent, MCP and plugin risks (`ri-24`–`ri-30`) don't, and neither does bias (`ri-16`). | The system card says there are no agents, tools, MCP servers, memory or plugins, and no decisions about individuals | Triggers decide applicability, and every risk still gets a row |
| `mi-18`–`mi-21`, `mi-24` and `mi-25` are **Not relevant** | They mitigate applicable risks, but only for agentic systems | A mitigation can be out of reach for a design, with a rationale |
| `ri-10` Prompt Injection is **above appetite** | The red-team report shows 14 of 40 indirect injections through research feeds succeeded, and there is no AI firewall or filtering of the bank's own (`mi-3`, `mi-17`) | Test evidence of failure outweighs design intent |
| `ri-2` Information Leaked to Vector Store is **above appetite** | The access test shows Restricted research reaching unentitled advisers, because retrieval ignores source permissions (`mi-16`) | A mitigation that is missing never lowers residual risk |

Every other applicable risk has strong evidence and should land within the default Medium appetite.

The organisation, system, model and people are invented.
