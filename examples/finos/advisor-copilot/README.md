# Advisor Copilot

> **Sample evidence pack for the GovKit tutorial [Your first FINOS AI risk assessment](https://majlisofai.github.io/govkit/tutorials/first-finos-risk-assessment/).** Lantern Bank, its people and its systems are invented. Nothing here describes a real organisation, product or model.

Advisor Copilot is an internal assistant for Lantern Bank's wealth-management advisers. An adviser asks a question about a client's portfolio or the bank's investment research. The copilot retrieves passages from the research library and the client's holdings, and a hosted large language model drafts an answer with citations. The adviser reviews the draft, edits it and decides what, if anything, to tell the client.

| Item | Value |
|------|-------|
| Owner | Head of Wealth Advisory Technology |
| Version | 1.4.0, in staging. Production go-live planned for 2026-11-30. |
| Users | About 300 wealth-management advisers. No customer access. |
| Model | Third-party hosted LLM, pinned version (see `config/model.yaml`) |

## Contents

| Path | What it shows |
|------|---------------|
| `docs/system-card.md` | Use case, users, output use, deployment model, data, and what the system does **not** do |
| `docs/architecture.md` | Components, data flows and security controls |
| `docs/data.md` | Data classification, ingestion, quality and retention |
| `docs/operations.md` | Monitoring, alerting, capacity, spend, feedback and change control |
| `docs/compliance.md` | Regulatory position, oversight, record-keeping and explainability |
| `docs/supplier-agreement-summary.md` | Terms agreed with the model provider |
| `config/model.yaml` | Model, version pin, parameters, rate limits and budget |
| `test-reports/` | Acceptance evaluation, red-team test and access-control test from staging |
