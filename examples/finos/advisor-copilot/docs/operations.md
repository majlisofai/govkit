# Operations — Advisor Copilot 1.4.0

## Observability

- Every request is traced end to end: question, retrieved chunk ids, prompt size, model version, latency, token use, response, citations and adviser feedback.
- Dashboards show latency, error rate, refusal rate, citation coverage and the daily evaluation score. Anomaly alerts go to the copilot on-call engineer and, for data-loss alerts, to the security operations centre.

## Capacity and availability

- Per-user and global rate limits in the orchestrator (`config/model.yaml`).
- If the provider's primary region fails or throttles, requests fail over to the provider's second region with the same pinned model. If both fail, the app tells advisers the copilot is unavailable. Advisers then work as they do today.
- Provider service level: 99.9 % monthly availability, with credits.

## Spend

- Daily and monthly token budgets per environment. Alerts fire at 50 %, 80 % and 100 % of budget to the product owner and FinOps. Above 100 %, new conversations are paused until a budget owner approves more.

## Feedback

- Advisers rate each answer and can flag it as wrong, unsuitable or offensive. The product team triages flags every week with a wealth compliance reviewer. Fixes go into the next release's evaluation set.

## Model version and change control

- The model and embedding versions are pinned in `config/model.yaml`. A new version is adopted only through change control: the full evaluation suite runs against it, results are compared with the current version, and the model risk team signs off.
- The provider gives 90 days' notice before retiring a version.

## Automated evaluation

- Nightly, an evaluator model scores answers to the 500-question golden set for groundedness, citation accuracy and tone. A 2 % sample of staging conversations is scored the same way.
- The evaluator is calibrated against human reviewers every quarter. Last calibration: 2026-09-30, 91 % agreement.
