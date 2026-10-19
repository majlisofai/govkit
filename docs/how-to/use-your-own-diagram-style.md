# How to use your own diagram style

This guide shows you how to change the look of draw.io diagrams and team matrices.

## If you are creating a brand

Use [`/govkit:create-brand`](create-a-brand.md). It writes a diagram style that matches the brand and points the brand at it. You don't need the steps below.

## Write a style by hand

1. Copy the built-in style that is closer to what you want:
    - [`standard.yaml`](https://github.com/majlisofai/govkit/blob/main/plugins/govkit/diagram-styles/standard.yaml): notation colours
    - [`tmofai.yaml`](https://github.com/majlisofai/govkit/blob/main/plugins/govkit/diagram-styles/tmofai.yaml): monochrome drawing sheet

    Put the copy at `.govkit/diagram-styles/<id>.yaml`, or in the organisation layer's `diagram-styles/`.

2. Set `id:` to match the file name.
3. Change the style strings. Keep to draw.io stencils you have rendered with the draw.io CLI. In `notations.team`, keep the four team types distinguishable by shape or line, not by colour alone.
4. Choose how to apply it:

    | To | Set |
    |----|-----|
    | Use it wherever the brand applies | `diagrams.drawio_style: <id>` in the brand's `brand.yaml` |
    | Use it for diagrams only, overriding the brand | `tools.drawio.style: <id>` in the profile |

5. Draw a test diagram with `/govkit:diagram` and check the export.

For every section of a style file, see the [diagram styles reference](../reference/diagram-styles.md).
