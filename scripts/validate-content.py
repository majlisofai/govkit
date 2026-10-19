#!/usr/bin/env python3
"""Validate GovKit YAML content against the GovKit and locked ArcKit registries.

Checks frameworks, methods, the default profile and recipes in
plugins/govkit/, plus, when given, a project's .govkit/ directory:

    python3 scripts/validate-content.py               # built-in content
    python3 scripts/validate-content.py path/.govkit  # also a project's overrides

Requires PyYAML (pip install pyyaml). Exit 1 on any error.
"""

from __future__ import annotations

import json
import re
import subprocess
import sys
from datetime import date
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
PLUGIN = ROOT / "plugins" / "govkit"
ARCKIT_TYPES = set(json.loads((ROOT / "upstream/snapshot/doc-types.json").read_text()))
GOV_TYPES = set(
    json.loads(
        subprocess.check_output(
            ["node", "--input-type=module", "-e",
             f"import {{DOC_TYPES}} from '{(PLUGIN / 'config/doc-types.mjs').as_uri()}';"
             "console.log(JSON.stringify(Object.keys(DOC_TYPES)))"],
            text=True,
        )
    )
)
ALL_TYPES = ARCKIT_TYPES | GOV_TYPES
FRAMEWORK_TYPES = {"regulation", "management-system", "risk-framework", "principles", "policy", "standard"}
ID_RE = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")

errors: list[str] = []
warnings: list[str] = []


def err(path: Path, msg: str) -> None:
    errors.append(f"{path.relative_to(ROOT) if path.is_relative_to(ROOT) else path}: {msg}")


def load(path: Path):
    try:
        return yaml.safe_load(path.read_text())
    except yaml.YAMLError as exc:
        err(path, f"invalid YAML: {exc}")
        return None


def validate_framework(path: Path, known_frameworks: set[str]) -> None:
    fw = load(path)
    if not isinstance(fw, dict):
        return
    for key in ("id", "kind", "name", "version", "publisher", "url", "type", "verified", "text_policy", "controls"):
        if key not in fw:
            err(path, f"missing '{key}'")
    if fw.get("id") != path.stem:
        err(path, f"id '{fw.get('id')}' must equal filename '{path.stem}'")
    if fw.get("id") and not ID_RE.match(str(fw["id"])):
        err(path, "id must be lowercase-hyphenated")
    if fw.get("kind") != "framework":
        err(path, "kind must be 'framework'")
    if fw.get("type") not in FRAMEWORK_TYPES:
        err(path, f"type must be one of {sorted(FRAMEWORK_TYPES)}")
    verified = fw.get("verified")
    if isinstance(verified, date) and (date.today() - verified).days > 365:
        warnings.append(f"{path.name}: verified {verified} is over 12 months old")
    seen: set[str] = set()
    for c in fw.get("controls") or []:
        cid = c.get("id")
        for key in ("id", "group", "title", "intent"):
            if not c.get(key):
                err(path, f"control {cid or '?'} missing '{key}'")
        if cid in seen:
            err(path, f"duplicate control id {cid}")
        seen.add(cid)
        for hint in c.get("evidence_hints") or []:
            if hint not in ALL_TYPES:
                err(path, f"control {cid}: evidence hint '{hint}' is neither an ArcKit nor a GovKit doc type")
        for target in (c.get("mappings") or {}):
            if target not in known_frameworks:
                err(path, f"control {cid}: mapping to unknown framework '{target}'")


def validate_lifecycle(path: Path) -> None:
    lc = load(path)
    if not isinstance(lc, dict):
        return
    ids = set()
    for gate in lc.get("gates") or []:
        if gate.get("id") in ids:
            err(path, f"duplicate gate {gate.get('id')}")
        ids.add(gate.get("id"))
        req = gate.get("required") or {}
        for code in req.get("arckit") or []:
            if code not in ARCKIT_TYPES:
                err(path, f"gate {gate.get('id')}: '{code}' is not an ArcKit doc type in the locked release")
        for code in req.get("govkit") or []:
            if code not in GOV_TYPES:
                err(path, f"gate {gate.get('id')}: '{code}' is not a GovKit doc type")
        if not gate.get("criteria"):
            err(path, f"gate {gate.get('id')}: no criteria")


def validate_scale(path: Path) -> None:
    sc = load(path)
    if not isinstance(sc, dict):
        return
    values = [lvl.get("value") for lvl in sc.get("levels") or []]
    if values != sorted(values) or len(values) < 2:
        err(path, "levels must be at least two, ascending by value")
    if sc.get("default_target") not in values:
        err(path, "default_target must be one of the level values")


def validate_risk(path: Path) -> None:
    rm = load(path)
    if not isinstance(rm, dict):
        return
    lmax = max((x["value"] for x in rm.get("likelihood") or []), default=0)
    imax = max((x["value"] for x in rm.get("impact") or []), default=0)
    covered = set()
    for band in rm.get("bands") or []:
        covered.update(range(band["min"], band["max"] + 1))
    missing = [s for s in {l * i for l in range(1, lmax + 1) for i in range(1, imax + 1)} if s not in covered]
    if missing:
        err(path, f"bands do not cover scores {sorted(missing)}")


def resolve(kind: str, ident: str, project: Path | None) -> Path | None:
    for base in ([project] if project else []) + [PLUGIN]:
        p = base / kind / f"{ident}.yaml"
        if p.exists():
            return p
    return None


def validate_profile(path: Path, project: Path | None) -> None:
    prof = load(path)
    if not isinstance(prof, dict):
        return
    approach = prof.get("approach") or {}
    methods = prof.get("methods") or {}
    refs = [
        ("methods/operating-models", approach.get("operating_model")),
        ("methods/lifecycles", approach.get("lifecycle")),
        ("methods/scales", methods.get("assessment_scale")),
        ("methods/risk", methods.get("risk")),
    ]
    fws = prof.get("frameworks") or {}
    refs += [("frameworks", f) for f in fws.get("active") or []]
    for kind, ident in refs:
        if ident and not resolve(kind, ident, project):
            err(path, f"{kind}/{ident}.yaml not found")
    if fws.get("primary") and fws.get("active") and fws["primary"] not in fws["active"]:
        err(path, "frameworks.primary must be in frameworks.active")


def validate_recipe(path: Path) -> None:
    rc = load(path)
    if not isinstance(rc, dict):
        return
    if rc.get("recipe") != path.stem:
        err(path, "recipe name must equal filename")
    ids = {t["id"] for t in rc.get("targets") or []}
    for t in rc.get("targets") or []:
        for dep in t.get("deps") or []:
            if dep not in ids and not dep.endswith("*"):
                err(path, f"target {t['id']}: unknown dep {dep}")
        code = (t.get("output") or {}).get("type")
        if code not in ALL_TYPES:
            err(path, f"target {t['id']}: output.type '{code}' unknown")


def run(base: Path, project: Path | None) -> None:
    fw_files = [p for p in (base / "frameworks").glob("*.yaml") if not p.name.startswith("_")]
    known = {p.stem for p in (PLUGIN / "frameworks").glob("*.yaml")} | {p.stem for p in fw_files}
    for p in fw_files:
        validate_framework(p, known)
    for p in (base / "methods/lifecycles").glob("*.yaml"):
        validate_lifecycle(p)
    for p in (base / "methods/scales").glob("*.yaml"):
        validate_scale(p)
    for p in (base / "methods/risk").glob("*.yaml"):
        validate_risk(p)
    for p in (base / "recipes").glob("*.yaml"):
        validate_recipe(p)


run(PLUGIN, None)
validate_profile(PLUGIN / "config/profile.default.yaml", None)
if len(sys.argv) > 1:
    project = Path(sys.argv[1]).resolve()
    run(project, project)
    if (project / "profile.yaml").exists():
        validate_profile(project / "profile.yaml", project)

for w in warnings:
    print(f"WARN  {w}")
for e in errors:
    print(f"FAIL  {e}")
print("content: " + ("OK" if not errors else f"{len(errors)} error(s)"))
sys.exit(1 if errors else 0)
