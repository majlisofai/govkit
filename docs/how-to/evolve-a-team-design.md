# How to evolve a team design

This guide shows you how to change an existing team design and record the change as a new version.

1. Run the skill with `--evolve`:

    ```text
    /govkit:team-design 001 --evolve
    ```

    GovKit loads the latest `GOV-*-TEAM-*.json` in the project.

2. Say what changes. GovKit changes only that. Typical changes:

    | Change | Say, for example |
    |--------|------------------|
    | Add or split a stream | "Split stream 4 by regulatory compliance into retail and institutional" |
    | Move people | "Move one data scientist from stream 2 to stream 6" |
    | End a collaboration | "The evaluation enablers finish with stream 2 on 31 March" |
    | Grow the platform | "Promote the feature store from stream 3 into the platform" |

3. Resolve the rule check as for a [new design](design-teams.md#resolve-the-rule-check).
4. Check the revision history in the new `GOV-<PID>-TEAM-v<V>.md`. It states what changed and why. The previous version's files stay beside the new ones.

When a collaboration ends, consider whether what the stream learned should move to the platform as X-as-a-Service. The artefact's cognitive-load and evolution notes record this.
