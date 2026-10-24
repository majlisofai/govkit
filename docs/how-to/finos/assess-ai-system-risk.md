# How to assess an AI system against the FINOS risks

This guide shows you how to triage one AI system against the FINOS AI Governance Framework, before a gate, a model risk review or go-live. For a guided first run with a sample system, follow the tutorial [Your first FINOS AI risk assessment](../../tutorials/first-finos-risk-assessment.md).

1. Make sure the module is set up: `.govkit/doc-types.json` has FNRA and `.govkit/frameworks/finos-aigf.yaml` exists. If not, [set up the FINOS module](set-up-the-finos-module.md).

2. Gather what describes the system. GovKit decides the risk triggers from it:

    | To settle | Bring |
    |-----------|-------|
    | Use case, users, whether outputs are acted on automatically | ArcKit `REQ`, `AIPB`, `ATRS`, or answer GovKit's questions |
    | Model, provider, hosting, RAG, agents, MCP, plugins | ArcKit `HLDR`, `DLDR`, `AAGR`, `AAGI` |
    | Data classification | ArcKit `DATA`, `DPIA` |
    | Mitigations in place | `SECD`, `AASE`, `OPS`, `MLOPS`, evaluation reports, guardrail and logging configuration, provider contracts |

3. Run the assessment, naming the AI system:

    ```text
    /govkit-finos:risk-assess 001 "Advisor copilot"
    ```

    GovKit asks about any trigger the artefacts do not settle. Name any evidence paths outside the project. If the project has an evidence register (`/govkit:evidence`), GovKit uses it.

4. Read `finos/GOV-001-FNRA-001-v1.0.md`:
    - **Risk triage** lists every FINOS risk as applicable or not, with the triggers behind it.
    - **Mitigation results** rate each FINOS mitigation in scope from the evidence.
    - **Residual risk** shows, per applicable risk, whether it is within your risk appetite.

5. Act on the risks above appetite:
    - **If you will treat a risk**, assign the owner and action in the artefact. Re-run the assessment when the mitigation's evidence exists. GovKit writes the next FNRA in sequence.
    - **If you accept a risk for now**, record it with `/govkit:exception`. Its residual rating does not change.
    - **Add it to the risk register** with `/arckit:risk`. GovKit proposes the entry, and ArcKit writes the register.
    - **For regulatory and agentic risks**, run the ArcKit command the assessment names, for example `/arckit-eu:eu-ai-act` or `/arckit-agent-architecture:agent-security`.

6. Use the assessment at the next gate with `/govkit:gate`.

## If the system uses agents

An agent that calls tools, uses MCP servers, keeps memory, works with other agents or loads plugins brings FINOS's agentic risks into scope (`ri-24` to `ri-30`). Their mitigations need evidence about the agents themselves. Before you run the assessment, produce ArcKit's agent artefacts, so GovKit has something to read:

| Run | Produces | Evidence for |
|-----|----------|--------------|
| `/arckit-agent-architecture:agent-inventory` | AAGI | Which agents exist, and their tools and MCP servers |
| `/arckit-agent-architecture:agent-design` | AAGR | Authority, isolation between agents, memory and human approval points |
| `/arckit-agent-architecture:agent-security` | AASE | Credentials, tool-call validation, MCP and plugin supply chain |
| `/arckit-agent-architecture:agent-governance` | AAOV | Decision audit and oversight |

Without them, most agentic mitigations come out Not implemented — no evidence.

## Other views

Run one assessment per AI system. For the project's maturity on each FINOS mitigation instead, run `/govkit:assess 001 finos-aigf`. To line FINOS up against ISO/IEC 42001, run `/govkit:crosswalk 001` with both frameworks active.

!!! warning "Self-assessment only"
    FINOS publishes guidance, not a certification scheme. The assessment is GovKit's self-assessment against the FINOS catalogue.
