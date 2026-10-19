# How to add a framework

This guide shows you how to assess against a framework that GovKit doesn't ship: a regulation, a standard or your organisation's own policy.

## If the framework is published

1. Ask GovKit to research it and draft the file:

    ```text
    /govkit:framework add "Singapore Model AI Governance Framework"
    ```

    You can give a URL instead of a name. A research agent fetches the primary source and drafts every control with a citation.

2. Review the draft that GovKit shows you. Check the control ids, groups and intents. Confirm to write `.govkit/frameworks/<id>.yaml`.
3. GovKit runs `validate` on the file. Fix anything that fails.

For a licensed standard (ISO, IEC, BSI and similar), GovKit writes a one-sentence paraphrase of each control's intent and never pastes licensed text. Assess against your licensed copy.

If an installed ArcKit overlay already covers the framework, GovKit sets `related_arckit.overlay_commands` and hands off to that command instead of duplicating it. For example, the EU AI Act is covered by `arckit-eu:eu-ai-act`.

## If the framework is your own policy

1. Copy [`frameworks/_template.yaml`](https://github.com/majlisofai/govkit/blob/main/plugins/govkit/frameworks/_template.yaml) to `.govkit/frameworks/<id>.yaml`.
2. Fill in the header fields and one entry per control. For each field, see the [framework file reference](../reference/frameworks.md).
3. Check it:

    ```text
    /govkit:framework validate acme-ai-policy
    ```

## Use licensed ISO text

If your organisation holds a licence, copy the built-in file with the same id, for example `.govkit/frameworks/iso-iec-42001.yaml`, and replace the intents. Your file overrides the built-in one. Update `text_policy` to say the text is licensed.

## Activate the framework

```text
/govkit:profile set frameworks.active "[iso-iec-42001, nist-ai-rmf, acme-ai-policy]"
/govkit:profile validate
```

To make it the framework whose controls drive the unified control register, also set `frameworks.primary`. Then run `/govkit:crosswalk <project>` to map it onto the frameworks already active.

## Keep a built-in framework current

```text
/govkit:framework refresh nist-ai-rmf
```

GovKit re-researches the source, shows a diff of added, removed and retitled controls, and writes the result to `.govkit/frameworks/`. The built-in file stays untouched.
