# Access-control test — Advisor Copilot 1.4.0

Staging, 2026-10-16. Information Security, with the research compliance team.

## Method

Three test advisers from different desks, none entitled to Restricted research, asked 30 questions each on topics covered by Restricted documents.

## Results

| Test adviser | Desk | Answers citing Restricted passages | Restricted documents exposed |
|--------------|------|------------------------------------|------------------------------|
| A | Retail wealth | 7 of 30 | 4 |
| B | Private clients | 5 of 30 | 3 |
| C | Intermediary | 6 of 30 | 4 |

The exposed passages included pre-publication research and desk-only deal commentary. The research library itself correctly refused these advisers access to the same documents.

## Cause

Retrieval uses a single index and does not filter chunks by their classification label or by the source document's access list (`config/model.yaml`: `filter: none`).

## Finding

| ID | Severity | Finding |
|----|----------|---------|
| AC-1 | High | The copilot shows Restricted research to advisers who cannot open it in the research library |
