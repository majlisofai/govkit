# How to draw an architecture diagram

This guide shows you how to produce a governed draw.io diagram for a project.

1. Name the project, the view and its subject:

    ```text
    /govkit:diagram 001 archimate application cooperation booking
    ```

    The words you use choose the notation:

    | Say | To get |
    |-----|--------|
    | capability, motivation, layered, application cooperation, technology | an ArchiMate 3.2 viewpoint |
    | context, container, component | a C4 diagram at that level |
    | data flow, DFD, trust boundary | a data-flow diagram |
    | process, workflow | a flow diagram |
    | sequence, interaction | a sequence diagram |

    If the request is ambiguous, GovKit asks once.

2. Have the project's ArcKit artefacts in place first, if you can: requirements (`REQ`), high-level and detailed design reviews (`HLDR`, `DLDR`), the data model (`DATA`), and ADRs. Every element in the diagram cites the section it came from. Without them, GovKit draws from your request alone.
3. Review the element and relationship tables in the new `diagrams/GOV-<PID>-DGRM-<NNN>-v<V>.md`. If an element or relationship is wrong, say so and GovKit redraws.
4. Look at the result:
    - With draw.io desktop installed, the artefact embeds the `.drawio.svg` or `.drawio.png` export.
    - Without it, open the `.drawio` file in [app.diagrams.net](https://app.diagrams.net) or the VS Code *Draw.io Integration* extension.

## Edit the diagram by hand

Open the `.drawio` file in draw.io and edit it. Then validate it:

```bash
node <govkit>/plugins/govkit/scripts/validate-drawio.mjs diagrams/GOV-001-DGRM-001-v1.0.drawio --grid 10
```

Use the grid of your diagram style: `10` for `standard`, `8` for `tmofai`. Re-export with `export-drawio.sh` if the artefact embeds an image.

## Make a new version

Run `/govkit:diagram` again with the same view. GovKit writes the next version beside the earlier files and never overwrites them.

For the files produced and what the validator checks, see the [scripts reference](../reference/scripts.md).
