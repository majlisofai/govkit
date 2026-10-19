# The GOV- prefix

GovKit writes its artefacts as `GOV-001-CTRL-v1.0.md`, beside ArcKit's `ARC-001-REQ-v1.0.md`, in the same project folders. This page explains why it doesn't simply write `ARC-*` files.

## The constraint

ArcKit protects its artefacts with a filename hook. When anything writes an `ARC-*.md` file, the hook checks the type code against ArcKit's own registry and blocks unknown codes. That is a good rule for ArcKit, because it keeps its artefact set coherent. But a third-party plugin cannot add codes to that registry. If GovKit wrote `ARC-001-CTRL-v1.0.md`, ArcKit would block it.

## The alternatives

GovKit could have:

- **Reused ArcKit codes**, writing a control register as, say, a conformance artefact. Those codes already mean something in ArcKit, with their own rules about how many instances a project may have. GovKit's files would collide with ArcKit's and confuse both.
- **Patched ArcKit's registry.** That is a fork in all but name, and the change would be lost at the next ArcKit release. See [the overlay model](overlay-model.md).
- **Used its own prefix.** ArcKit's hook ignores files that don't start with `ARC-`. ArcKit's own NHS overlay already relies on this for its safety-case files.

GovKit took the third option, and validates `GOV-*` files with its own hook instead.

## Keeping the door open

GovKit copies everything else from ArcKit's convention: the project folders, the project numbers, the version suffix, the sequence numbers for multi-instance types, and the subfolders. The only difference is the prefix. If ArcKit one day lets plugins register codes, moving GovKit's artefacts to `ARC-*` would be a mechanical rename, not a migration.

## The trade-off

ArcKit's `/arckit:pages` dashboard, `/arckit:health` and its traceability matrix don't index `GOV-*` files today. A human reader still sees the links, because GovKit artefacts cite ArcKit artefacts by document ID. But the tooling doesn't follow them. This is the main item GovKit proposes upstream: a doc-type registry that plugins can extend.
