# How to choose the diagram tool

This guide shows you how to choose whether diagrams are draw.io files from GovKit or Mermaid/PlantUML from ArcKit.

## Use draw.io (the default)

1. Make sure the profile has, or inherits, `tools.diagrams: drawio`.
2. Install [draw.io desktop](https://github.com/jgraph/drawio-desktop/releases) if you want SVG and PNG exports. GovKit finds it at `/Applications/draw.io.app` on macOS, or as `drawio` on your `PATH`. For any other location, set `DRAWIO_BIN` to the executable.
3. Choose the export formats, if you want something other than the diagram style's default:

    ```yaml title=".govkit/profile.yaml"
    tools:
      drawio:
        export: [svg, png]
    ```

With draw.io, every recommendation of `/arckit:diagram` becomes `/govkit:diagram`, in plans, handoffs, gate remediation and recipes.

## Use Mermaid or PlantUML

```text
/govkit:profile set tools.diagrams mermaid
/govkit:apply
```

Use `plantuml` for PlantUML. Diagrams then come from `/arckit:diagram`, and `/govkit:diagram` tells you that ArcKit is the configured tool.

## Check what is installed

Run `/govkit:compat`. If draw.io desktop is missing, GovKit still writes the editable `.drawio` file and skips the exports.
