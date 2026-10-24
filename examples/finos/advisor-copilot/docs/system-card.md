# System card — Advisor Copilot 1.4.0

## Purpose and use

- **Task.** Answer advisers' questions about a client's holdings and Lantern Bank's investment research, and draft a short summary or client note.
- **Users.** Wealth-management advisers, authenticated through the bank's single sign-on. Clients never see or use the copilot.
- **Output use.** Advisory only. Every answer is a draft for the adviser. The adviser is accountable for any advice and checks suitability through the bank's existing advice process. Advisers sometimes paste edited drafts into client letters.
- **Out of scope.** The copilot does not make or record suitability decisions, credit, pricing or eligibility decisions, place orders, or contact clients.

## Model and deployment

- A third-party hosted large language model, reached over the provider's API from the bank's cloud tenancy. The version is pinned (`config/model.yaml`).
- No fine-tuning or training on bank data. The bank sends prompts only.
- Embeddings are produced by the same provider's pinned embedding model.

## Architecture features

| Feature | Present |
|---------|---------|
| Retrieval-augmented generation over a vector store | Yes |
| Agents, tool calling or actions on other systems | **No.** The copilot calls no tools and takes no actions. |
| Model Context Protocol (MCP) servers | **No** |
| Multiple cooperating agents | **No** |
| Memory across sessions | **No.** Each conversation starts empty. |
| Third-party skills, plugins or extensions | **No** |

## Data

- Inputs: adviser questions, client holdings (Confidential), research library passages (Internal or Restricted).
- Outputs: draft answers with citations (Confidential).
- See `data.md` for classification and handling.
