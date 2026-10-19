# ArcKit Template Override Rules

`/govkit:apply` uses these rules to change ArcKit templates. Each rule names the sections it may touch. Everything else is copied verbatim from the upstream template. To support another template, add a section here. Do not edit ArcKit.

## risk-register

Source: ArcKit `risk-register-template.md` (filled by `/arckit:risk`). Resolve the profile's `methods.risk` file first.

- **Likelihood and impact scales**: replace the scale tables or definitions with the risk method's `likelihood` and `impact` labels and values.
- **Risk scoring / rating bands**: replace them with the method's `bands`, including each band's `treatment`.
- **Risk appetite**: set the appetite statement to the profile's `methods.risk` appetite, or to the method's `appetite_default`.
- **Risk Response (4Ts)**: keep ArcKit's 4Ts headings; add the method's `treatments` mapping beneath them so both vocabularies appear.
- **Risk owner**: add a note that owners are assigned per the operating model's `artefact_ownership.RISK` role.

## architecture-principles

Source: ArcKit `architecture-principles-template.md`.

- Add a section after the existing principles, named **Governance Principles (GovKit)**. List one principle for each active framework's `type: principles` controls, with their source. Do not change ArcKit's own principle sections.

## requirements

Source: ArcKit `requirements-template.md`.

- In the non-functional requirements section, add a **Governance & Compliance (NFR-GOV-*)** subsection. It contains a table with columns ID, Requirement, Framework control and Evidence expected, plus one example row for each active framework. Leave every existing NFR category untouched.
