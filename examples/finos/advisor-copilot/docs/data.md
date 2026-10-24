# Data — Advisor Copilot 1.4.0

## Classification

| Data | Classification | Where it goes |
|------|----------------|---------------|
| Client holdings | Confidential | Prompt (pseudonymised), never the vector store |
| Internal research notes | Internal | Vector store, prompt |
| Restricted research: pre-publication notes, desk-only deal commentary | Restricted | Vector store, prompt. Source access is limited to named desks. |
| Third-party research feeds | Internal (licensed) | Vector store, prompt |
| Prompts, responses, feedback | Confidential | Logs (encrypted, 7 years) |

## Ingestion and quality

- Each source document carries a classification label from the research library. The pipeline copies the label onto every chunk.
- Client identifiers and personal data are removed at ingestion by the bank's standard redaction service. Redaction is tested monthly against a seeded sample.
- Quality checks reject empty, duplicated or unreadable documents, and documents with no author or publication date.
- Freshness: research older than 18 months is removed from the index nightly. The research team reviews ingestion exceptions weekly.
- Third-party feed documents are checked for licence and format. Their content is not otherwise inspected.

## Licences and IP

- Third-party research is licensed for internal use and quotation in client communications with attribution. The licence terms are in the bank's contract register.
- Copilot drafts quote research only with a citation.
