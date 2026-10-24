# Example — GovStack self-assessment

A small, fictional solution for the tutorial [Your first GovStack self-assessment](../../docs/tutorials/first-govstack-self-assessment.md).

`licensing-service/` is the evidence pack for an imaginary API that takes business-licence applications. It contains no runnable code: only the documents, configuration and test reports that `/govkit-govstack:compliance` reads as evidence.

The pack is built so that a first assessment against `govstack-cfr` is **not compliant**, with three blockers that each teach one rule:

| Requirement | Why it fails | Rule it teaches |
|-------------|--------------|-----------------|
| `deployment-2` Backup and restore-capable | No backup or restore procedure anywhere | A REQUIRED requirement with no evidence is unmet |
| `security-1` Transport security is enforced | The TLS scan shows TLS 1.2 still offered | Runtime evidence that shows a failure decides an OBSERVABLE requirement |
| `data-2` Use ISO 8601/UTC for timestamps | Only the architecture document claims it; no test checks it | An OBSERVABLE requirement needs evidence from the running system |

`quality-2` (web interfaces use HTML5 and CSS3) is **not triggered**, because the service has no web interface.

The organisation, service and people are invented.
