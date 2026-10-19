# Example — AI Innovation Hub team matrix

A team topology model for `/govkit:team-design`. It has 8 stream-aligned teams (one per business stream) × 5 virtual chapters, plus a platform team serving every stream X-as-a-Service.

| File | What it is |
|------|------------|
| `ai-innovation-hub.json` | The model, which is the source of truth (`plugins/govkit/schemas/team-topology.schema.json`) |
| `ai-innovation-hub.drawio` | The team matrix, rendered by `render-team-matrix.mjs` in the `standard` diagram style |
| `ai-innovation-hub.drawio.svg` / `.png` | Editable exports |

Reproduce it:

```bash
node plugins/govkit/scripts/validate-team.mjs examples/teams/ai-innovation-hub.json
node plugins/govkit/scripts/render-team-matrix.mjs examples/teams/ai-innovation-hub.json -o examples/teams/ai-innovation-hub.drawio
bash plugins/govkit/scripts/export-drawio.sh examples/teams/ai-innovation-hub.drawio svg png
```

In a project, the skill writes the same files as `projects/<NNN-name>/GOV-<NNN>-TEAM-v<N.N>.{json,drawio,md}`, styled by the profile's brand.
