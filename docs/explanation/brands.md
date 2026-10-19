# Brands

In GovKit, how everything looks and reads is controlled by one profile key, `brand:`. This page explains why presentation is centralized like this, and why a brand is limited in what it may change.

## Why one setting

GovKit writes to several surfaces: Markdown artefacts, draw.io diagrams, team matrices, Mermaid blocks, and, through template overrides, ArcKit's dashboard and slide decks. Each could have had its own styling options. But then a house style would be spread across a dozen settings in a dozen files, and changing the accent colour would mean finding them all.

A brand gathers every presentation decision in one file. The diagram style, the dashboard CSS and the deck theme are all derived from the same colours and fonts. Change the brand, and every surface follows.

## Why it belongs centrally

Presentation is the clearest case for the [organisation layer](configuration-layers.md). Teams rarely want their own house style. They want the organisation's, applied consistently. Put the brand in the shared organisation profile, and a rebrand is one change that every repository picks up on its next `/govkit:apply`.

This is also why GovKit forbids hard-coded presentation in its own code. A command that wrote a colour inline would ignore the brand, and the one-setting promise would break. A new output surface gets new brand fields instead.

## What a brand may not change

A brand changes presentation and wording only. It never changes Document Control fields, document IDs, section order or the content of findings.

The line is drawn there because those things carry meaning beyond appearance. Document IDs are how artefacts cite each other. Section order is what ArcKit's quality checks and GovKit's commands expect to find. Document Control is a records-management obligation. A finding is a finding, whatever voice it is written in. A brand that could reorder sections or soften a finding would be a governance setting disguised as a style choice.

## Why the rules about colour and voice

Some brand rules look like style but are about accessibility and trust:

- **Contrast is checked.** Every text colour pair must meet WCAG AA. A governance document that some readers can't read has failed at its first job.
- **RAG is never colour alone.** A status is always a word, optionally with a glyph, such as "◆ Amber". Colour-blind readers, black-and-white printouts and screen readers all lose a status that is only a colour.
- **Banned terms are enforced.** A brand can ban words like "seamless" or "game-changer". Governance writing should be exact, and marketing language undermines the reader's trust in the findings.

## Why two built-in brands

`tmofai`, The Majlis of AI's house style, is the default because GovKit ships from there and it shows what a complete brand looks like. `neutral` exists so that turning house style off is a choice rather than a gap: no logo, system fonts, standard notation colours, and ArcKit's stock dashboard and decks. Most organisations create their own with `/govkit:create-brand`, which uses `neutral` to fill anything their guideline doesn't say.
