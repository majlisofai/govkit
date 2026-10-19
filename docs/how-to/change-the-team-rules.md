# How to change the team rules

This guide shows you how to change the rules that a team design is checked against, for example to allow teams of nine or to require a data chapter in every stream.

1. Copy [`methods/team-models/team-topologies.yaml`](https://github.com/majlisofai/govkit/blob/main/plugins/govkit/methods/team-models/team-topologies.yaml) to `.govkit/methods/team-models/team-topologies.yaml`. Keep the same id, so that your file replaces the built-in one.

    To apply the rules to every repository, put the file in the organisation layer's `methods/team-models/` instead.

2. Edit only the rules you want to change. For example:

    ```yaml title=".govkit/methods/team-models/team-topologies.yaml"
    rules:
      team_size:         { severity: error, min: 5, max: 9, count_leadership: false }
      required_chapters: { severity: warn, chapters: [data, mlops] }
      chapter_span:      { severity: warn, min_streams: 3 }
    ```

    Set `severity` to `error` to block a design, or `warn` to record a finding without blocking. For every rule and setting, see the [team model reference](../reference/team-model.md#rules).

3. Run `/govkit:team-design <project> --evolve`. GovKit copies the new rules into the model and validates against them.

## Use a different team model

To define a different method entirely, give the file a new id, for example `.govkit/methods/team-models/acme-squads.yaml`, and select it:

```text
/govkit:profile set approach.team_model acme-squads
```

The validator implements the rule ids listed in the reference. A rule id it doesn't know is ignored.
