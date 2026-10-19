# How to use your own method

This guide shows you how to replace a built-in method (a risk matrix, rating scale, lifecycle, operating model or team model) with your organisation's own.

1. Copy the built-in file that is closest to what you want:

    | You want | Copy | To |
    |----------|------|----|
    | Your own risk matrix | `methods/risk/iso31000-5x5.yaml` | `.govkit/methods/risk/<id>.yaml` |
    | A different rating scale | `methods/scales/maturity-0-5.yaml` or `rag.yaml` | `.govkit/methods/scales/<id>.yaml` |
    | Your own gates | `methods/lifecycles/stage-gate.yaml` | `.govkit/methods/lifecycles/<id>.yaml` |
    | Your own governance roles | `methods/operating-models/three-lines.yaml` | `.govkit/methods/operating-models/<id>.yaml` |
    | Different team rules | `methods/team-models/team-topologies.yaml` | see [Change the team rules](change-the-team-rules.md) |

    The built-in files are in [`plugins/govkit/methods/`](https://github.com/majlisofai/govkit/tree/main/plugins/govkit/methods). To share the method across repositories, put it in the organisation layer instead of `.govkit/`.

2. Set `id:` in the file to match the file name, and edit the values. Keep every top-level key. For the fields of each kind, see the [methods reference](../reference/methods.md).
3. Select it in the profile:

    ```text
    /govkit:profile set methods.risk acme-risk-4x4
    ```

    The keys are `methods.risk`, `methods.assessment_scale`, `approach.lifecycle`, `approach.operating_model` and `approach.team_model`.

4. Run `/govkit:profile validate`. Every check should PASS.
5. Run `/govkit:apply`. ArcKit's risk-register override is re-rendered with the new matrix.

If you keep the built-in id, for example `.govkit/methods/risk/iso31000-5x5.yaml`, your file replaces the built-in one and you don't need to change the profile.

If a lifecycle names doc-type codes in `required`, each code must exist in ArcKit or GovKit. `/govkit:profile validate` reports any that don't.
