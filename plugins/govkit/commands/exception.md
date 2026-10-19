---
description: "Record a time-boxed policy or control exception (EXCP, multi-instance) with risk rating, compensating controls, exit plan and approver per the operating model."
doc-type: EXCP
argument-hint: "<project ID or name> <control or principle> <reason>"
effort: medium
handoffs:
  - command: arckit:risk
    description: The residual risk of an approved exception belongs in the risk register.
allowed-tools:
  - Read(/${CLAUDE_PLUGIN_ROOT}/**)
  - Bash(node ${CLAUDE_PLUGIN_ROOT}/scripts/generate-gov-id.mjs *)
---

## User Request

```text
$ARGUMENTS
```

Follow `${CLAUDE_PLUGIN_ROOT}/references/govkit/artefact-procedure.md`. **Type**: EXCP (multi-instance, `exceptions/`). **Template**: `exception`.

**Inputs** (P3). Required: the control or principle being excepted. It must resolve to a CTL in `GOV-*-CTRL-*`, a framework control, or a principle in `projects/000-global/ARC-000-PRIN-*`. Optional: the latest ASMT, and ArcKit `RISK`.

**Content**:

1. If any of these is missing from the request, ask for it: justification, requested-by, and expiry. **An expiry date is mandatory.** Refuse an open-ended exception.
2. Rate the risk under the profile's risk method. If the band is above appetite, state that only the governing body can approve the exception, per the operating model.
3. A compensating control needs evidence or a dated plan.
4. Set the approver from the operating model. Second line approves within appetite and the governing body approves above it. Leave the decision `[PENDING]`.

**Report** (P8): the exception ID, risk band, approver and expiry.
