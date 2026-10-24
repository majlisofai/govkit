# How to map a project to GovStack building blocks

This guide shows you how to find which GovStack building blocks a project's services need, and what is left over.

1. Have the project's ArcKit artefacts in place if you can: requirements (`REQ`), business case (`SOBC`), stakeholders (`STKE`), capability map (`BPCM`), application inventory (`APP`) and platform design (`PLAT`). GovKit draws the services and needs from them. Without them, it interviews you.
2. Run:

    ```text
    /govkit-govstack:map 001
    ```

3. Answer GovKit's questions about services or needs the artefacts don't cover.
4. Review `GOV-001-GSBB-v1.0.md`:
    - **Building Block Fit**: each need with its building block and a fit of full, partial or none. If a fit is wrong, say so and GovKit writes a new version.
    - **Solutions**: the system or product that will provide each building block. Add any GovStack status you know, such as listed on GovMarket.
    - **Data Exchanges**: exchanges marked as crossing an organisational boundary should go through the Information Mediator building block.
    - **Gaps and Decisions**: needs with no building block. Record each build, reuse or buy decision with `/arckit:adr`.
5. Run the next steps the artefact lists, foundational building blocks first: [add each building block](add-a-building-block.md), then [assess each solution](assess-a-solution-against-govstack.md).

To draw the result, run `/govkit:diagram 001 archimate application cooperation building blocks`.
