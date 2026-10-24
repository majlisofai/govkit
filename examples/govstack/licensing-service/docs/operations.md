# Operations

## Logging

- The service writes structured JSON logs to standard output. The container platform collects them, so no platform change is needed.
- Each entry has `timestamp`, `level`, `correlationId`, `actor` and `message`.
- Security events (failed authentication, permission denied, token validation errors) carry `"category": "security"`, so they can be filtered and routed to the security operations team separately.
- Passwords, tokens and personal data are never logged. Applicant identifiers are replaced with the application UUID.

## Errors

Error responses contain only `code`, `message` and `correlationId`. They never contain stack traces, file paths or query details. See the `Error` schema in [`openapi.yaml`](../openapi.yaml).

## Monitoring

- `GET /api/v1/health` reports the service status and the status of the database and the Information Mediator connection.
- Metrics are exposed in Prometheus format on port 9100.

## Incidents

The on-call engineer is paged on health-check failure. Incidents follow the Registry's incident procedure, with a post-incident review within five working days.
