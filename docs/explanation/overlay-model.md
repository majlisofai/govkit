# The overlay model

GovKit governs ArcKit's artefacts but never changes ArcKit. This page explains why it is built that way, and what that costs.

## Two concerns, two plugins

ArcKit answers *what* an architecture is: principles, requirements, risks, designs, decisions. GovKit answers *how* an organisation governs that work: who decides, at which gates, measured against which frameworks, on which scale. The two change at different speeds and for different reasons. ArcKit evolves with architecture practice and publishes often. An organisation's governance changes when its policies, regulators or risk appetite change.

Keeping them in separate plugins lets each move at its own pace. You can take every ArcKit release without re-deciding your governance, and you can change your governance without touching your architecture tooling.

## Why not fork ArcKit?

A fork would make GovKit's job easier at first. It could add doc types to ArcKit's registry, edit ArcKit's templates in place, and change its commands. But every ArcKit release would then need merging by hand, and the fork would fall behind. GovKit is meant for organisations that want ArcKit's improvements as soon as they ship. A fork defeats that.

## Why not a pull request to ArcKit?

Some of what GovKit does could live in ArcKit itself, and the [tracking ArcKit](tracking-arckit.md) page lists proposals worth making upstream. But governance is opinionated by nature. One organisation runs three lines of defence, another a single assurance function. One rates maturity 0–5, another uses RAG. ArcKit stays general by not choosing. GovKit is where the choosing happens.

## Living within extension points

Without forking, GovKit can reach ArcKit only through what ArcKit already supports:

- **Template overrides.** ArcKit reads `.arckit/templates-custom/` before its own templates. `/govkit:apply` writes there, so ArcKit's own commands produce risk registers in your risk method's terms.
- **Build recipes.** ArcKit's build harness reads `.arckit/recipes/` first. GovKit installs a recipe that interleaves ArcKit and GovKit commands.
- **Handing off.** When an ArcKit artefact is needed, GovKit names the `/arckit:*` command, or invokes it. ArcKit's own validators and provenance hooks then run as usual.
- **Reading.** ArcKit artefacts are inputs. GovKit cites them by document ID.

The constraint shapes the design. An override is regenerated from the *current* ArcKit template each time, not stored as a patch, so ArcKit's new sections flow through. GovKit marks the files it writes with a `govkit-override` comment, so it can tell its own work from yours and never overwrites a file you wrote by hand.

## Vendoring the shared files

Some ArcKit files are meant to be shared: the references, the Document Control partials and the project helper scripts. ArcKit's own overlays copy them, and GovKit does the same, so that its commands produce the same layout and headers as ArcKit's. Each copied file is pinned and hashed. That makes it obvious when one has been edited, and mechanical to update.

## What it costs

The overlay model has real costs, and GovKit accepts them:

- GovKit artefacts need their own filename prefix, which means ArcKit's dashboard and traceability don't index them yet. See [the GOV- prefix](gov-prefix.md).
- GovKit can't pin an ArcKit version in its manifest, so version checking happens in a hook and in CI instead. See [tracking ArcKit](tracking-arckit.md).
- Every reference GovKit makes to an ArcKit command, template or code is a promise that it still exists. A compatibility gate checks every one of them against each release.

These costs are paid once, by the maintainers. The benefit, taking every ArcKit release unchanged, is paid out to every organisation that uses GovKit.
