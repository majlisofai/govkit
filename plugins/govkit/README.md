# GovKit plugin

Governance overlay for ArcKit. It requires the `arckit` core plugin (`arckit@arckit-claude`).

```bash
claude plugin marketplace add tractorjuice/arckit-claude
claude plugin marketplace add majlisofai/govkit
claude plugin install govkit@majlisofai
```

See the [repository README](../../README.md) for commands and setup, and [docs/CUSTOMIZING.md](../../docs/CUSTOMIZING.md) to tailor the approach, methods, frameworks and tools.

## Data

GovKit adds commands, skills, agents, two local hooks and content files. It sends no data of its own and has no MCP servers. `/govkit:framework add` and `refresh` fetch public web pages through Claude's WebSearch and WebFetch tools.
