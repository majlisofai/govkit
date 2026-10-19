# Notation Catalogue for draw.io

These are the `{type}`, `{form}` and `{fill}` values for the style templates in `diagram-styles/*.yaml`. The ArchiMate stencil values come from draw.io's `mxgraph.archimate3` library, as used by The Majlis of AI's vetted draw.io kit.

## ArchiMate 3.2 elements

Each element uses `notations.archimate.element` with `appType={type}` and `archiType={form}`. `{fill}` comes from `layer_fill.<layer>`.

| Layer | Element | `{type}` | `{form}` |
|-------|---------|----------|----------|
| Strategy | Resource | `resource` | `square` |
| Strategy | Capability | `capability` | `rounded` |
| Strategy | Value stream | `valueStream` | `rounded` |
| Strategy | Course of action | `course` | `rounded` |
| Motivation | Stakeholder | `role` | `oct` |
| Motivation | Driver | `driver` | `oct` |
| Motivation | Assessment | `assess` | `oct` |
| Motivation | Goal | `goal` | `oct` |
| Motivation | Outcome | `outcome` | `oct` |
| Motivation | Principle | `principle` | `oct` |
| Motivation | Requirement | `requirement` | `oct` |
| Motivation | Constraint | `constraint` | `oct` |
| Motivation | Meaning | `meaning` | `oct` |
| Motivation | Value | `amValue` | `oct` |
| Business | Actor | `actor` | `square` |
| Business | Role | `role` | `square` |
| Business | Collaboration | `collab` | `square` |
| Business | Interface | `interface` | `square` |
| Business | Process | `proc` | `rounded` |
| Business | Function | `func` | `rounded` |
| Business | Interaction | `interaction` | `rounded` |
| Business | Event | `event` | `rounded` |
| Business | Service | `serv` | `rounded` |
| Business | Object | `passive` | `square` |
| Business | Contract | `contract` | `square` |
| Business | Representation | `representation` | `square` |
| Business | Product | `product` | `square` |
| Application | Component | `comp` | `square` |
| Application | Collaboration | `collab` | `square` |
| Application | Interface | `interface` | `square` |
| Application | Function | `func` | `rounded` |
| Application | Interaction | `interaction` | `rounded` |
| Application | Process | `proc` | `rounded` |
| Application | Event | `event` | `rounded` |
| Application | Service | `serv` | `rounded` |
| Application | Data object | `passive` | `square` |
| Technology | Node | `node` | `square` |
| Technology | Device | use `notations.archimate.device` | — |
| Technology | System software | `sysSw` | `square` |
| Technology | Collaboration | `collab` | `square` |
| Technology | Interface | `interface` | `square` |
| Technology | Path | `path` | `square` |
| Technology | Communication network | `netw` | `square` |
| Technology | Artifact | `artifact` | `square` |
| Technology | Function | `func` | `rounded` |
| Technology | Process | `proc` | `rounded` |
| Technology | Interaction | `interaction` | `rounded` |
| Technology | Event | `event` | `rounded` |
| Technology | Service | `serv` | `rounded` |
| Physical | Equipment | `equipment` | `square` |
| Physical | Facility | `facility` | `square` |
| Physical | Distribution network | `distribution` | `square` |
| Physical | Material | `material` | `square` |
| Implementation | Work package | `workPackage` | `rounded` |
| Implementation | Deliverable | `deliverable` | `square` |
| Implementation | Implementation event | `event` | `rounded` |
| Migration | Plateau | `plateau` | `square` |
| Migration | Gap | `gap` | `square` |
| Other | Location | `location` | `square` |
| Other | Grouping | use `notations.archimate.grouping` | — |

Business-layer and application-layer elements share `{type}` values: `proc`, `serv` and so on. The layer shows through `{fill}`, or through the band the element sits in when the style is monochrome.

### Common valid relationships (ArchiMate 3.2)

| From | Relationship | To |
|------|--------------|----|
| Active structure (actor, component, node) | assignment | Behaviour (process, function, service) in the same layer |
| Behaviour or active structure | realization | Service in the same layer |
| Service or interface | serving | Behaviour or active structure, in the same or a higher layer |
| Application component | realization | Business process, function or object (cross-layer) |
| Behaviour | access | Passive structure (object, data object, artifact) |
| Artifact | realization | Data object or application component |
| Node / system software | serving | Application component (via technology service) |
| Process or event | triggering / flow | Process, function or event in the same layer |
| Whole | composition / aggregation | Part, with the same element type family |
| Any core element | realization | Requirement, principle, goal or outcome (motivation) |
| Driver or assessment | influence | Goal, outcome or principle |
| Stakeholder | association | Driver or goal |

For anything else, check the ArchiMate 3.2 relationship tables (Appendix B). If you are still unsure, use `association` and flag it.

## C4 model

| Element | Style key | Label convention |
|---------|-----------|------------------|
| Person | `c4.person` | `Name` + `[Person]` + description |
| Software system | `c4.software_system` | `Name` + `[Software System]` + description |
| External system | `c4.external_system` | as above, outside the boundary |
| Container | `c4.container` | `Name` + `[Container: technology]` + description |
| Database container | `c4.database` | `Name` + `[Container: technology]` |
| Component | `c4.component` | `Name` + `[Component: technology]` |
| System or container boundary | `c4.boundary` | `Name` + `[System]` or `[Container]` |
| Relationship | `c4.relationships.uses` | verb phrase + `[protocol]` |

Write labels as HTML with `html=1`, for example `value="&lt;b&gt;Booking API&lt;/b&gt;&lt;br&gt;[Container: Java]&lt;br&gt;&lt;i&gt;Handles bookings&lt;/i&gt;"`. Size C4 elements at 200×120 so the three lines fit.

## Flow and data flow (DFD)

| Element | Style key |
|---------|-----------|
| Process | `flow.process` |
| Decision | `flow.decision` |
| Start / end | `flow.terminator` |
| Data store | `flow.data_store` |
| External entity | `flow.external_entity` |
| Trust boundary | `flow.trust_boundary` (container) |
| Data flow | `flow.relationships.flow`, labelled with the data and its classification |

## Sequence

- **Lifeline:** `sequence.lifeline`, 160×(height of diagram), in a row. Use `sequence.actor` for human participants.
- **Messages:** edges with `parent="1"`, no source or target, and `<mxPoint x=… y=… as="sourcePoint"/>` / `<mxPoint … as="targetPoint"/>`. The x values sit on the lifeline centres. Step y by 40 per message. Use `relationships.call` for calls and `relationships.reply` for replies.
