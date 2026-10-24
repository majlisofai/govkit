#!/usr/bin/env python3
"""Validate GovKit YAML content against the GovKit and locked ArcKit registries.

Checks frameworks, methods, the default profile and recipes in
plugins/govkit/ and in every GovKit overlay (plugins/govkit-<name>/ with a
govkit-overlay.json), plus, when given, a project's .govkit/ directory:

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
OVERLAYS = sorted(p.parent for p in (ROOT / "plugins").glob("govkit-*/govkit-overlay.json"))
OVERLAY_TYPES = {code for o in OVERLAYS for code in json.loads((o / "govkit-overlay.json").read_text()).get("doc_types", {})}
ALL_TYPES = ARCKIT_TYPES | GOV_TYPES | OVERLAY_TYPES
OBLIGATIONS = {"required", "recommended", "optional", "draft", "deprecated"}
OVERLAY_CMD_RE = re.compile(r"^govkit-[a-z0-9-]+:[a-z0-9.-]+$")
ARCKIT_CMD_RE = re.compile(r"^arckit(-[a-z0-9-]+)?:[a-z0-9.-]+$")
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
    for cmd in (fw.get("related_arckit") or {}).get("overlay_commands") or []:
        if not ARCKIT_CMD_RE.match(str(cmd)):
            err(path, f"related_arckit.overlay_commands: '{cmd}' is not arckit[-<overlay>]:<command>")
    for cmd in (fw.get("related_govkit") or {}).get("overlay_commands") or []:
        if not OVERLAY_CMD_RE.match(str(cmd)):
            err(path, f"related_govkit.overlay_commands: '{cmd}' is not govkit-<overlay>:<command>")
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
        if "obligation" in c and c["obligation"] not in OBLIGATIONS:
            err(path, f"control {cid}: obligation '{c['obligation']}' must be one of {sorted(OBLIGATIONS)}")
        attrs = c.get("attributes")
        if attrs is not None and not (isinstance(attrs, dict) and all(isinstance(v, str) for v in attrs.values())):
            err(path, f"control {cid}: attributes must map names to strings")


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


def validate_diagram_style(path: Path) -> None:
    ds = load(path)
    if not isinstance(ds, dict):
        return
    if ds.get("id") != path.stem:
        err(path, f"id '{ds.get('id')}' must equal filename '{path.stem}'")
    if ds.get("kind") != "diagram-style":
        err(path, "kind must be 'diagram-style'")
    page = ds.get("page") or {}
    for key in ("width", "height", "grid"):
        if not isinstance(page.get(key), int) or page[key] <= 0:
            err(path, f"page.{key} must be a positive integer")
    for key in ("vertex", "edge"):
        if not (ds.get("base") or {}).get(key):
            err(path, f"base.{key} missing")
    notations = ds.get("notations") or {}
    for name in ("archimate", "c4", "flow", "sequence", "team"):
        if name not in notations:
            err(path, f"notations.{name} missing")
    arch = notations.get("archimate") or {}
    if "{type}" not in (arch.get("element") or "") or "{form}" not in (arch.get("element") or ""):
        err(path, "notations.archimate.element must contain {type} and {form}")
    for state in ("focal", "context", "out_of_scope"):
        if state not in (ds.get("states") or {}):
            err(path, f"states.{state} missing")
    for fmt in (ds.get("export") or {}).get("formats") or []:
        if fmt not in ("svg", "png"):
            err(path, f"export format '{fmt}' must be svg or png")
    # Every style string must be ;-terminated key=value pairs (or a bare shape name).
    def walk(node, where):
        if isinstance(node, dict):
            for k, v in node.items():
                walk(v, f"{where}.{k}")
        elif isinstance(node, str) and where.split(".")[1] in ("base", "notations", "states") and "=" in node:
            if not node.endswith(";"):
                err(path, f"{where}: style string must end with ';'")
    walk(ds, path.stem)


HEX_RE = re.compile(r"^#[0-9A-Fa-f]{6}$")


def contrast(fg: str, bg: str) -> float:
    def lum(h: str) -> float:
        rgb = [int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)]
        r, g, b = [c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4 for c in rgb]
        return 0.2126 * r + 0.7152 * g + 0.0722 * b
    hi, lo = sorted((lum(fg), lum(bg)), reverse=True)
    return (hi + 0.05) / (lo + 0.05)


def validate_brand(path: Path, project: Path | None, org: Path | None) -> None:
    br = load(path)
    if not isinstance(br, dict):
        return
    bid = path.parent.name
    if br.get("id") != bid:
        err(path, f"id '{br.get('id')}' must equal directory name '{bid}'")
    if br.get("kind") != "brand":
        err(path, "kind must be 'brand'")
    if not br.get("name"):
        err(path, "name missing")
    colours = br.get("colours") or {}
    for key in ("paper", "ink", "ink_muted", "accent", "on_accent"):
        if not HEX_RE.match(str(colours.get(key, ""))):
            err(path, f"colours.{key} must be #RRGGBB")
    for key in ("red", "amber", "green"):
        if not HEX_RE.match(str((colours.get("rag") or {}).get(key, ""))):
            err(path, f"colours.rag.{key} must be #RRGGBB")

    def token(name: str):
        node = colours
        for part in name.split("."):
            node = node.get(part) if isinstance(node, dict) else None
        return node

    pairs = colours.get("text_pairs") or []
    if not pairs:
        err(path, "colours.text_pairs must list the text/background pairs to check")
    for fg, bg in pairs:
        a, b = token(fg), token(bg)
        if not (isinstance(a, str) and HEX_RE.match(a) and isinstance(b, str) and HEX_RE.match(b)):
            err(path, f"text pair [{fg}, {bg}] does not resolve to two hex colours")
        elif contrast(a, b) < 4.5:
            err(path, f"text pair [{fg}, {bg}] contrast {contrast(a, b):.2f}:1 is below WCAG AA 4.5:1")
    if not ((br.get("typography") or {}).get("text") or {}).get("family"):
        err(path, "typography.text.family missing")
    for key, rel in (br.get("logo") or {}).items():
        if key in ("alt", "rules"):
            continue
        f = path.parent / str(rel)
        if not f.exists():
            err(path, f"logo.{key}: {rel} not found beside brand.yaml")
        elif f.suffix == ".svg" and re.search(r"<script|\son\w+=|javascript:|<foreignObject", f.read_text(), re.I):
            err(path, f"logo.{key}: {rel} contains active content")
    style = (br.get("diagrams") or {}).get("drawio_style")
    if not style or not resolve("diagram-styles", style, project, org):
        err(path, f"diagrams.drawio_style '{style}' does not resolve to a diagram style")
    banned = set((br.get("voice") or {}).get("banned_terms") or [])
    for key in ("header", "footer", "callout"):
        text = str((br.get("documents") or {}).get(key) or "").lower()
        for term in banned:
            if term.lower() in text:
                err(path, f"documents.{key} uses banned term '{term}'")


def resolve(kind: str, ident: str, project: Path | None, org: Path | None = None) -> Path | None:
    """Project -> organisation (extends) -> built-in, as runtime-contract.md section 2."""
    suffix = Path(kind) / (f"{ident}/brand.yaml" if kind == "brands" else f"{ident}.yaml")
    for base in [b for b in (project, org) if b] + [PLUGIN]:
        p = base / suffix
        if p.exists():
            return p
    return None


def validate_profile(path: Path, project: Path | None) -> None:
    prof = load(path)
    if not isinstance(prof, dict):
        return
    org = None
    if prof.get("extends"):
        ext = (path.parent / prof["extends"]).resolve()
        if not ext.exists():
            err(path, f"extends: {prof['extends']} not found")
        else:
            org = ext.parent
            parent = load(ext) or {}
            # The org layer supplies keys the project profile leaves out.
            for key, value in parent.items():
                prof.setdefault(key, value)
    approach = prof.get("approach") or {}
    methods = prof.get("methods") or {}
    refs = [
        ("methods/operating-models", approach.get("operating_model")),
        ("methods/lifecycles", approach.get("lifecycle")),
        ("methods/scales", methods.get("assessment_scale")),
        ("methods/risk", methods.get("risk")),
        ("methods/team-models", approach.get("team_model")),
    ]
    fws = prof.get("frameworks") or {}
    refs += [("frameworks", f) for f in fws.get("active") or []]
    tools = prof.get("tools") or {}
    if tools.get("diagrams") not in (None, "drawio", "mermaid", "plantuml"):
        err(path, "tools.diagrams must be drawio, mermaid or plantuml")
    refs.append(("diagram-styles", (tools.get("drawio") or {}).get("style")))
    refs.append(("brands", prof.get("brand")))
    for kind, ident in refs:
        if ident and ident != "brand" and not resolve(kind, ident, project, org):
            err(path, f"{kind}/{ident}{'/brand' if kind == 'brands' else ''}.yaml not found")
    if fws.get("primary") and fws.get("active") and fws["primary"] not in fws["active"]:
        err(path, "frameworks.primary must be in frameworks.active")


TEAM_RULES = {"team_size", "stream_ownership", "stream_leadership", "chapter_lead", "chapter_span",
              "required_chapters", "platform_interaction", "time_boxed", "max_collaborations",
              "capability_consumed", "dunbar"}


def validate_team_model(path: Path) -> None:
    tm = load(path)
    if not isinstance(tm, dict):
        return
    if tm.get("id") != path.stem:
        err(path, "id must equal filename")
    for key in ("team_types", "interaction_modes", "rules"):
        if not tm.get(key):
            err(path, f"{key} missing")
    for t in ("stream-aligned", "platform"):
        if t not in (tm.get("team_types") or {}):
            err(path, f"team_types.{t} missing")
    for rid, rule in (tm.get("rules") or {}).items():
        if rid not in TEAM_RULES:
            err(path, f"rule '{rid}' is not implemented by validate-team.mjs (known: {sorted(TEAM_RULES)})")
        elif (rule or {}).get("severity") not in ("error", "warn"):
            err(path, f"rule '{rid}' severity must be error or warn")
    size = (tm.get("rules") or {}).get("team_size") or {}
    if size and not (0 < size.get("min", 0) <= size.get("max", 0)):
        err(path, "rules.team_size needs 0 < min <= max")


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
    known |= {p.stem for o in OVERLAYS for p in (o / "frameworks").glob("*.yaml")}
    for p in fw_files:
        validate_framework(p, known)
    for p in (base / "methods/lifecycles").glob("*.yaml"):
        validate_lifecycle(p)
    for p in (base / "methods/scales").glob("*.yaml"):
        validate_scale(p)
    for p in (base / "methods/risk").glob("*.yaml"):
        validate_risk(p)
    for p in (base / "methods/team-models").glob("*.yaml"):
        validate_team_model(p)
    for p in (base / "recipes").glob("*.yaml"):
        validate_recipe(p)
    for p in (base / "diagram-styles").glob("*.yaml"):
        validate_diagram_style(p)
    for p in (base / "brands").glob("*/brand.yaml"):
        if not p.parent.name.startswith("_"):
            validate_brand(p, project, None)


run(PLUGIN, None)
for overlay in OVERLAYS:
    run(overlay, None)
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
