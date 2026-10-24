# Your first governed repository

In this tutorial, we will set up GovKit in an empty repository. We will install the plugins, write a governance profile with the built-in defaults, connect the profile to ArcKit, and write our first GovKit artefact: an organisation-wide operating model.

By the end, you will have a repository like this:

```text
my-governance/
  .govkit/profile.yaml
  .arckit/templates-custom/…
  .arckit/recipes/govkit-baseline.yaml
  projects/000-global/GOV-000-GMOD-v1.0.md
  projects/001-booking/GOV-001-APPL-v1.0.md
```

## Before you start

You need:

- [Claude Code](https://claude.com/claude-code), signed in
- Node.js 22 or later (GovKit is tested on Node.js 26)
- git

## 1. Create a repository

```bash
mkdir my-governance
cd my-governance
git init
```

## 2. Install ArcKit and GovKit

GovKit runs on top of ArcKit, so we install both:

```bash
claude plugin marketplace add tractorjuice/arckit-claude
claude plugin marketplace add majlisofai/govkit
claude plugin install arckit@arckit-claude
claude plugin install govkit@majlisofai
```

Start Claude Code in the repository:

```bash
claude
```

Type `/govkit:` and notice that the GovKit commands are listed. Type `/arckit:` and notice the ArcKit commands. Both plugins are active.

## 3. Write the profile

The profile records how your organisation governs. We will accept the built-in defaults and give only the organisation name:

```text
/govkit:init "Example Authority" --defaults
```

GovKit writes `.govkit/profile.yaml` and shows a summary table of the choices. Open the file:

```yaml title=".govkit/profile.yaml"
govkit_profile: 1
organisation:
  name: "Example Authority"
```

It is short. That is intentional: every key you leave out comes from the built-in defaults. The defaults include the Three Lines operating model, a five-gate lifecycle (G0–G4), a 0–5 maturity scale and three AI frameworks.

GovKit also created:

- `.govkit/frameworks/`, `.govkit/methods/` and `.govkit/templates-custom/`, empty for now
- `projects/000-global/`, the home of organisation-wide artefacts

## 4. Connect the profile to ArcKit

```text
/govkit:apply
```

GovKit reports a table with one row per file it wrote. Look in `.arckit/`:

```text
.arckit/
  templates-custom/
    risk-register-template.md
    pages-template.html
    presentation-template.md
  recipes/
    govkit-baseline.yaml
```

Open `.arckit/templates-custom/risk-register-template.md`. The first line is a comment that starts with `<!-- govkit-override`. From now on, when you run `/arckit:risk`, ArcKit uses this template, and its risk scale is the one from your profile.

Notice also `projects/000-global/brand/`. GovKit published the default brand's logo there for document headers.

## 5. Write the operating model

```text
/govkit:operating-model
```

GovKit asks who fills each role in the operating model: the governing body, the first, second and third lines. Answer with names that suit your organisation, for example "AI Governance Committee" for the governing body.

When it finishes, open `projects/000-global/GOV-000-GMOD-v1.0.md`. Look at these parts:

- the header line under the title, with the brand's logo and the document ID
- **Document Control**, filled from the profile
- **Decision Rights**, with one row per gate and per artefact type
- **Lifecycle and Gates**, with gates G0 to G4 and their approvers

This is your first GOV artefact.

## 6. Plan a project

Now we ask GovKit what a new project needs before its first gate:

```text
/govkit:start booking
```

The project doesn't exist yet, so the plan starts at the first gate, G0. GovKit prints a numbered plan, grouped by gate, and ends with the single next command to run. It runs nothing itself. Notice that the plan mixes ArcKit commands, such as `/arckit:principles` and `/arckit:stakeholders`, with GovKit commands, such as `/govkit:applicability`.

## 7. Decide which frameworks apply

Run the GovKit step from the plan:

```text
/govkit:applicability booking
```

GovKit creates the project folder and asks a few questions about the project: whether it uses AI, whether it handles personal data, and how critical it is. Answer them.

Open the new file, `projects/001-booking/GOV-001-APPL-v1.0.md`. The project number can differ. It records, for each active framework, whether it applies, why, and the target level.

## What you have done

You have:

- installed ArcKit and GovKit
- written a governance profile from the defaults
- customized ArcKit through its own extension points, without editing it
- written an organisation-wide operating model
- planned a project and made its first governance decision

## Next steps

- Continue the plan from step 6. Run `/govkit:start booking` again at any time to see the next command.
- [Create your own brand](../how-to/create-a-brand.md) so that every artefact carries your organisation's look.
- Read [about the overlay model](../explanation/overlay-model.md) to see why GovKit never edits ArcKit.
