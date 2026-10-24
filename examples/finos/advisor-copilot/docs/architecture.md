# Architecture — Advisor Copilot 1.4.0

## Components

1. **Adviser web app.** Single sign-on. Access requires the `wealth-adviser` group. Administrators need `copilot-admin` (role-based access control, reviewed quarterly).
2. **Orchestrator** (bank cloud tenancy). Builds the prompt from the question, the client's holdings and retrieved passages, calls the model, and returns the answer with citations.
3. **Research ingestion pipeline.** Nightly. Pulls documents from the internal research library and two third-party research feeds, removes client identifiers and personal data, labels each chunk with its source document's classification, embeds it and writes it to the vector store.
4. **Vector store.** One index holds every research chunk, Internal and Restricted, from every research team.
5. **Hosted LLM API.** Third-party provider, pinned model version, reached over TLS 1.3 through the bank's egress proxy.

## Security controls

- **Retrieval access.** The orchestrator queries the single index for every adviser. Chunks carry their source classification label, but retrieval does **not** filter on it or on the source document's access list. Restricted research is meant for named desks only.
- **Prompt and output handling.** Client account numbers and names are pseudonymised before the prompt leaves the tenancy and restored in the answer. A data-loss-prevention scanner checks every response and log line for client identifiers and alerts the security operations centre.
- **Input and output filtering.** The provider's built-in content-safety filter is on. The bank runs no input or output filtering of its own and has no AI firewall. Text from the third-party research feeds reaches the prompt as ingested.
- **Encryption at rest.** The vector store, prompt and response logs, and caches are encrypted with keys in the bank's key management service.
- **Citations.** Every answer cites the research passages and holdings it used, with links to the source documents. An answer with no supporting passage says so instead of answering.
