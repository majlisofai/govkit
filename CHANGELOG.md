# Changelog

## 0.1.0 — 2026-10-19

Initial release. Tested against ArcKit 6.18.2.

- Plugin `govkit` with 15 commands, 2 skills, 3 agents, 2 hooks.
- Profile-driven approach, methods, frameworks and tools (`.govkit/profile.yaml`, project-first override of every method, framework and template).
- Built-in: Three Lines operating model, five-gate lifecycle, maturity 0–5 and RAG scales, ISO 31000-aligned 5×5 risk method, ISO/IEC 42001, NIST AI RMF 1.0 and ISO/IEC 38500 frameworks (paraphrased).
- `GOV-*` doc types: GMOD, APPL, ASMT, XWLK, CTRL, EVID, GATE, EXCP, BRPT.
- ArcKit integration through `.arckit/templates-custom/` and `.arckit/recipes/` (`govkit-baseline` recipe).
- Upstream tooling: `sync-arckit.mjs`, `check-compat.mjs`, `validate-content.py`, weekly upstream-watch workflow.
