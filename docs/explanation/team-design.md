# Team design

GovKit's `team-design` skill arranges teams in a matrix: business streams down, virtual chapters across, a platform underneath. This page explains the thinking behind that shape, and why the design is held as data and checked against rules.

## Why a governance tool designs teams

Governance artefacts keep asking "who": who owns this control, who approves this gate, who produces this evidence. The operating model answers at the level of roles. A team design answers at the level of people and teams, and it is often a gate requirement in its own right, for example when a programme sets up a hub or a centre of excellence. Producing it as a governed artefact means it is versioned, reviewed and traceable like everything else.

## Why streams and chapters

The design combines two ideas.

From *Team Topologies* (Skelton and Pais) comes the **stream-aligned team**: a team that owns one flow of business value end to end, from discovery to running it in production. Ownership is what makes a team fast. A team that owns a whole stream doesn't wait on hand-offs, and it learns from its own outcomes. Platform, enabling and complicated-subsystem teams exist to make stream teams faster, not to own work themselves.

Stream ownership alone has a known weakness. If every data scientist sits in a different stream team, data science practice fragments: five teams, five ways of evaluating models. From the Spotify model (Kniberg and Ivarsson) comes the **chapter**: a community of practice across streams, with a lead who keeps the craft consistent. A person delivers with their team and practises with their chapter.

The matrix is the visual form of that combination. Columns show who owns what. Rows show who keeps standards aligned.

## Why the interaction modes matter

Team Topologies insists that teams interact in one of three explicit ways. Each costs something different:

- **X-as-a-Service** is cheap and scales, which is why the platform must serve streams this way.
- **Collaboration** is expensive. Two teams working closely share cognitive load. It is worth it for discovering something new, but it must end.
- **Facilitating** is a temporary transfer of capability. An enabling team that never leaves has become a dependency.

That is why collaboration and facilitating interactions need an end date, and why the design notes record what should move to the platform afterwards. An organisation's interactions should drift towards X-as-a-Service over time.

## Why enabling and complicated-subsystem teams need a reason

Each extra team type is a team the streams must coordinate with. Team Topologies treats them as exceptions: an enabling team when a capability gap is real, a complicated-subsystem team when specialist knowledge is scarce. Requiring a stated reason keeps the design from accumulating teams out of habit.

## Why JSON is the source of truth

The design lives in a JSON model, and the matrix is rendered from it. A hand-drawn matrix and its rationale drift apart, because someone edits the picture and nobody updates the document. With one model, the tables in the artefact, the rule check and the diagram all come from the same data, and a new version re-renders deterministically, moving only what changed.

## Why rules, and why not weaken them

The rules make the design's commitments explicit and checkable: team size, single ownership of a stream, a lead for every chapter, end dates on collaborations. A rule failure is information. A team of eleven really is too big for the method the organisation chose.

That is why the skill never relaxes a rule to get a pass. If the organisation genuinely works differently, for example with teams of nine, the honest change is to the method, in an override file that is reviewed like any other governance decision. Then every future design is checked against the rule the organisation actually holds.

The defaults are deliberately a little stricter than the book. Team Topologies suggests five to nine people. GovKit defaults to a maximum of eight, following the hub design the method was first written for. And the Dunbar limit of 150 is there to warn when a single matrix has grown into something that should be split into separate hubs.
