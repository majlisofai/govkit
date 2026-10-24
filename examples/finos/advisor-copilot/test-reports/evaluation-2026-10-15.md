# Acceptance evaluation — Advisor Copilot 1.4.0

Staging, 2026-10-15. Model `example-chat-2026-06-15`. Run by the Wealth Advisory Technology QA team. Signed off by the product owner and the model risk team on 2026-10-17.

## Golden set (500 questions, written and answered by senior advisers)

| Measure | Result | Acceptance threshold | Pass |
|---------|--------|----------------------|------|
| Groundedness (claims supported by a cited passage) | 97.2 % | ≥ 95 % | yes |
| Citation accuracy (citation supports the sentence) | 96.0 % | ≥ 95 % | yes |
| Unsupported-question handling (says it cannot answer) | 98.4 % of 60 | ≥ 95 % | yes |
| Factual errors in figures (prices, dates, holdings) | 0.6 % | ≤ 1 % | yes |
| Tone suitable for a client note (human review, 100 sampled) | 94 % | ≥ 90 % | yes |
| Off-purpose requests refused (tax, legal, non-wealth topics, 40 prompts) | 100 % | 100 % | yes |

## Consistency

- Each of 100 questions run 5 times at temperature 0.2. The answer's recommendation and cited sources were the same in 97 % of questions. The 3 % that varied changed wording only.

## Automated evaluation agreement

- Evaluator-model scores matched human reviewers on 91 % of 200 answers (quarterly calibration, 2026-09-30).

## Business acceptance

- 12 advisers used the copilot for two weeks in staging. 11 of 12 recommended go-live. Their flagged answers are in the feedback log and fixed in 1.4.0.
