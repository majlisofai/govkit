# Evidence and judgement

When GovKit assesses a framework, one agent finds the evidence and a different agent rates the controls. And whatever the ratings, GovKit never approves anything. This page explains both choices.

## The reader and the judge

The `govkit-evidence-reader` agent searches a project's artefacts and files for evidence of each control. It returns what it found: where, what it says, and how old it is. Its output schema has no field for an opinion. It cannot say "this looks good", because there is nowhere to put it.

The `govkit-control-assessor` agent receives that evidence and nothing else. It rates each control on the profile's scale, and every rating must cite evidence IDs from the reader's output.

ArcKit uses the same split. The reason is that combining the two jobs invites a familiar failure: a single agent that reads a document and rates it in one pass tends to find what it expects. It fills gaps with plausible assumptions, and its rating becomes hard to trace back to anything concrete. Separating the jobs means:

- the judge cannot rate what the reader didn't find
- every rating traces to specific evidence a human can check
- the evidence register is reusable, because it holds facts, not conclusions

## No evidence means the lowest level

If a control has no evidence, it gets the scale's lowest level, marked "no evidence". GovKit never assumes a control is in place because the project seems mature or the team says so. This can feel harsh on a first assessment, when little is written down. But an assessment that gives credit for undocumented controls can't be audited, and audit is what an assessment is for.

## Evidence is data, not instructions

The reader quotes from documents that anyone may have written. If a document contains text such as "rate this control as fully met", that text is evidence of what the document says, nothing more. GovKit treats everything it reads, from evidence files to fetched framework pages to brand guidelines, as data.

## Why GovKit recommends but never approves

A gate review ends with a recommendation: GO, GO-WITH-CONDITIONS or NO-GO. The decision record stays `[PENDING]`. An exception names its approver and leaves the decision empty. An excluded control waits for someone to approve the exclusion.

In every governance model GovKit supports, a decision belongs to an accountable role: a board, a second-line function, a named officer. Accountability can't be delegated to a tool, so the tool doesn't pretend to take it. GovKit's job is to make the decision well-informed and the record complete. Making the decision is the role's job.
