# Tracking ArcKit

GovKit promises that you can take every future ArcKit release. This page explains how it keeps that promise for releases it hasn't seen yet, and where the approach has limits.

## Releases, not main

GovKit tracks ArcKit's release tags, not its `main` branch. `main` changes daily and may be mid-refactor. A release is a point ArcKit's maintainers have declared coherent. Tracking releases means GovKit is tested against exactly what users install.

## Making every dependency explicit

GovKit depends on ArcKit in a known, finite set of ways: the project layout, the filename hook's behaviour with non-`ARC-` files, the template and recipe lookup order, command names, doc-type codes, and the shared files it vendors. The [compatibility reference](../reference/compatibility.md) lists them all. Anything outside that list, such as ArcKit's internal hook code, GovKit deliberately doesn't use, so it can't break.

Each dependency is checked mechanically. On every sync, ArcKit's public surface (its command names, template names and doc-type codes) is snapshotted into `upstream/snapshot/`. The compatibility gate then proves that every `arckit:` reference, override rule and doc-type code in GovKit still resolves against that snapshot. A renamed ArcKit command fails the gate by name, rather than surfacing months later as a confusing recommendation.

## Automation that reports rather than fixes

Every Monday, a workflow syncs the newest ArcKit release and opens a pull request. Its title says either **compatible** or **NEEDS ADAPTATION**, and its body is the gate's output, listing exactly what changed. The workflow doesn't try to fix anything. Adapting to a renamed command is a judgement call, and a maintainer makes it with the failure in front of them.

## What the snapshot can't see

Some ArcKit changes would break GovKit without changing any name: a different template lookup order, a stricter filename hook, a new recipe format. The snapshot can't detect these. That is why a new *major* ArcKit version needs a maintainer to read ArcKit's changelog for these contract items before the tested range is widened.

## Why the version check lives in a hook

Claude Code plugins can declare a dependency on another plugin with a version range. But a range resolves against tags in the form `arckit--vX.Y.Z`, and ArcKit doesn't publish them, so a pinned range would never resolve. GovKit therefore declares the dependency without a version, and checks the range in two other places: a SessionStart hook warns users at runtime, and CI fails if the locked version falls outside the range.

## Proposals worth taking upstream

Three changes in ArcKit would let GovKit drop workarounds:

1. **A plugin-extensible doc-type registry**, for example ArcKit's hook also reading `.arckit/doc-types-custom.json`. GovKit could then write `ARC-*` files that ArcKit's dashboard, health check and traceability index. See [the GOV- prefix](gov-prefix.md).
2. **Published `arckit--vX.Y.Z` tags**, so `plugin.json` can declare a version range.
3. **Overlay discovery for plugins not named `arckit-*`** in `/arckit:customize` and ArcKit's build harness.
