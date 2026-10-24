# Your first GovStack self-assessment

In this tutorial, we will use the GovStack overlay to assess a small government service against GovStack's requirements. We will install the overlay, map the service to GovStack building blocks, assess a sample solution, see it fail, fix two of its gaps, accept the third, and assess it again.

The service is invented: the *Licensing Service*, an API that takes business-licence applications for an imaginary business registry. We will use its evidence pack from the GovKit repository.

By the end, your repository will contain:

```text
.govkit/doc-types.json                          ← now knows GSBB and GSCA
.govkit/frameworks/govstack-cfr.yaml            ← GovStack's 78 core requirements
solutions/licensing-service/                    ← the sample evidence pack
projects/002-licensing/
  GOV-002-GSBB-v1.0.md                          ← building-block map
  govstack/GOV-002-GSCA-001-v1.0.md             ← first assessment: not compliant
  exceptions/GOV-002-EXCP-001-v1.0.md           ← an accepted gap
  govstack/GOV-002-GSCA-002-v1.0.md             ← second assessment
```

Your project number may differ.

## Before you start

You need the repository from [Your first governed repository](first-governed-repository.md), with ArcKit and GovKit installed and a GovKit profile. You also need git.

Claude writes the artefacts, so their wording will differ from run to run. The verdicts and blockers described here should match.

## 1. Install the overlay

In a terminal, install the plugin:

```bash
claude plugin install govkit-govstack@majlisofai
```

Start Claude Code in your repository and apply the overlay:

```text
/govkit-govstack:apply --activate
```

GovKit reports a table: two doc types created, one file created. Look at what changed.

Open `.govkit/doc-types.json`. It now has two entries, `GSBB` and `GSCA`. These are the two kinds of document the overlay writes. GovKit's filename rules now accept them.

Open `.govkit/frameworks/govstack-cfr.yaml`. Notice the first line:

```text
# govkit-overlay govkit-govstack@0.1.0 — refreshed by /govkit-govstack:apply; …
```

This line says the overlay owns the file. Running `apply` again after an upgrade refreshes it.

## 2. Read one requirement

Still in `govstack-cfr.yaml`, search for `id: security-1`:

```yaml
  - id: security-1
    group: Security
    title: Transport security is enforced
    intent: All traffic uses HTTPS with TLS 1.3 or later, insecure ciphers are off and …
    obligation: required
    attributes: { ref: "govstack-cfr-security#req-1", mutability: immutable, verification: observable }
```

Three words in it decide how this requirement is judged:

- `required`: a solution that misses it is not GovStack-compliant
- `observable`: it must be proven on the running system, not in a document
- `immutable`: no building block may change it

Count the REQUIRED requirements:

```bash
grep -c "obligation: required" .govkit/frameworks/govstack-cfr.yaml
```

You should see `19`. A compliant solution meets all 19.

## 3. Map the service to building blocks

```text
/govkit-govstack:map licensing
```

The repository has no ArcKit artefacts for this service, so GovKit asks about it. Give these answers:

| GovKit asks about | Answer |
|-------------------|--------|
| The service | Business licence application, for people starting a business |
| How applicants prove who they are | They sign in with the national digital identity |
| How fees are paid | Online card or bank payment |
| How applicants hear about their application | Email and SMS notifications |
| How applications are taken and tracked | An application form, then status tracking until a decision |
| Anything else the service must do | Work out the licence fee from the business category |

Open `projects/002-licensing/GOV-002-GSBB-v1.0.md`. In **Building Block Fit**, notice:

- signing in maps to **Identity**, fees to **Payments**, notifications to **Messaging**, and the form and tracking to **Registration**
- working out the fee has **no building block**. It appears under **Gaps and Decisions**, because it is specific to this registry.

In **Data Exchanges**, notice that the calls to other organisations' systems are marked as going through the **Information Mediator**.

## 4. Add the sample solution

We need a solution to assess. Copy the Licensing Service evidence pack from the GovKit repository into yours:

```bash
git clone --depth 1 https://github.com/majlisofai/govkit.git /tmp/govkit
mkdir -p solutions
cp -R /tmp/govkit/examples/govstack/licensing-service solutions/
git add solutions && git commit -m "Add Licensing Service evidence pack"
```

Look inside `solutions/licensing-service/`. It has documentation, an OpenAPI file, a Dockerfile and, in `test-reports/`, results from the staging environment.

## 5. Assess the solution

We assess against the core requirements only, so we pass `cfr` instead of a building block:

```text
/govkit-govstack:compliance licensing cfr "Licensing Service" — evidence is in solutions/licensing-service
```

GovKit reads the evidence pack, rates every requirement and writes `projects/002-licensing/govstack/GOV-002-GSCA-001-v1.0.md`. Open it.

The **Verdict** says **Not compliant**, with three blockers. Look at each one in **Requirement Results**:

| Blocker | Result | Why |
|---------|--------|-----|
| `deployment-2` Backup and restore-capable | Not met — no evidence | Nothing in the pack describes a backup or a restore |
| `security-1` Transport security is enforced | Not met | `test-reports/tls-scan-2026-10-20.txt` shows TLS 1.2 still offered. The requirement asks for TLS 1.3 or later. |
| `data-2` Use ISO 8601/UTC for timestamps | Not met — no observable evidence | Only `docs/architecture.md` claims it. No test checks it, and the requirement is OBSERVABLE. |

Now find `quality-2`, about web interfaces. It says **Not triggered**: the service has no web interface, so the requirement does not apply and does not count against the verdict.

Notice also the **RECOMMENDED coverage** percentage. It is reported, but it never changes the verdict.

## 6. Fix two gaps

**Backup.** Create `solutions/licensing-service/docs/backup.md` with this content:

```markdown
# Backup and restore

- The PostgreSQL database is backed up every night at 01:00 UTC with `pg_dump`, and its write-ahead log is archived every 5 minutes.
- Backups are encrypted and stored in the Registry's backup vault in a second data centre, and kept for 35 days.
- Configuration lives in Git. Secrets and encryption keys are held in Vault, which has its own backup.
- To restore: create a clean database, restore the latest dump, replay the archived log to the required time, start the service, and check `GET /api/v1/health`.
- Expected recovery time: under 2 hours. Maximum data loss: 5 minutes.
- Last restore test: 2026-10-21, to a clean staging environment. The service started healthy with all 1,204 applications intact.
```

**Timestamps.** The fix for an OBSERVABLE requirement is a test, not a document. Create `solutions/licensing-service/test-reports/timestamp-tests-2026-10-22.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<testsuites name="licensing-service staging" tests="2" failures="0" timestamp="2026-10-22T10:05:40Z">
  <testsuite name="timestamps" tests="2" failures="0">
    <testcase name="every timestamp in API responses is ISO 8601 UTC with a Z suffix" classname="data" time="0.07"/>
    <testcase name="timestamps are stored in UTC and returned unchanged after a round trip" classname="data" time="0.11"/>
  </testsuite>
</testsuites>
```

Commit both files.

## 7. Accept the third gap

The TLS 1.2 problem can't be fixed today, because a legacy payment gateway needs it. The organisation decides to accept the gap until the gateway is replaced. That is a governance decision, so we record it as an exception:

```text
/govkit:exception licensing govstack-cfr:security-1 "TLS 1.2 stays enabled for the legacy payment gateway until it is replaced"
```

GovKit asks for what it needs. Answer that the request comes from the service owner, that the exception expires on **2027-03-31**, and that the compensating control is that TLS 1.2 is only accepted from the payment gateway's address.

Open `projects/002-licensing/exceptions/GOV-002-EXCP-001-v1.0.md`. Notice that the decision is **PENDING**: GovKit records the request, and the approver named by your operating model decides.

## 8. Assess again

```text
/govkit-govstack:compliance licensing cfr "Licensing Service" — evidence is in solutions/licensing-service
```

GovKit writes the next assessment, `GOV-002-GSCA-002-v1.0.md`, beside the first. Open it and compare:

- `deployment-2` is now **Met**, citing `docs/backup.md`
- `data-2` is now **Met**, citing the timestamp test report
- `security-1` is still **Not met**. The **Gaps and Actions** table links it to `GOV-002-EXCP-001`.

The verdict is still **Not compliant**. An exception records that the organisation accepts a gap for a while. It does not make the requirement met. The solution becomes compliant when TLS 1.2 is switched off and a new scan shows it.

## What you have done

You have:

- installed the GovStack overlay through GovKit's own extension points
- read how a GovStack requirement is classified, and what that means for judging it
- mapped a service to GovStack building blocks and found a need no building block covers
- self-assessed a solution and seen three different reasons for failure
- fixed a gap with a document and an OBSERVABLE gap with a test
- recorded an accepted gap as an exception, and seen that it doesn't change the verdict

The verdict you produced is a self-assessment. GovStack certification and GovMarket listing come from GovStack's own compliance process.

## Next steps

- Add the Registration building block's own requirements with `/govkit-govstack:bb add registration`, then assess the Licensing Service against `registration` instead of `cfr`. See [Add or refresh a building block](../how-to/govstack/add-a-building-block.md).
- Look up every requirement and verdict rule in the [GovStack overlay reference](../reference/govstack-overlay.md).
- Read [about GovKit overlays](../explanation/overlays.md) to see why the verdict is strict and binary.
