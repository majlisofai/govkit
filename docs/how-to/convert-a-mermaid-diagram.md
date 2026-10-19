# How to convert an ArcKit Mermaid diagram to draw.io

This guide shows you how to get an editable, branded draw.io version of a diagram that ArcKit wrote in Mermaid or PlantUML.

1. Find the document ID of the ArcKit artefact that contains the diagram, for example `ARC-001-DATA-v1.0`.
2. Run:

    ```text
    /govkit:diagram 001 --from ARC-001-DATA-v1.0
    ```

3. If the artefact has more than one diagram block, choose which ones to convert. Each block becomes one page of the same `.drawio` file.
4. Check the result. GovKit keeps the labels verbatim and lays the diagram out again on the grid:

    | Source block | Becomes |
    |--------------|---------|
    | `C4Context` | C4 |
    | `flowchart` | flow |
    | `erDiagram` | flow, with one data store per entity and its attributes in the label |
    | `sequenceDiagram` | sequence |

The ArcKit artefact is not changed. The new DGRM artefact records the source document ID and the heading of the block it came from.
