# Licensing Service

The Licensing Service is an API that receives applications for business licences, tracks their status and records decisions. It is operated by the Example Business Registry. It has no web user interface: citizen and staff portals call its API.

| Item | Value |
|------|-------|
| Version | 1.4.0 |
| API | [`openapi.yaml`](openapi.yaml), OpenAPI 3.0, base path `/api/v1` |
| Licence | Apache License 2.0 ([`LICENSE`](LICENSE)) |
| Language | Python 3.12 |

## Documentation

| Document | Covers |
|----------|--------|
| [Architecture](docs/architecture.md) | Components, data ownership, integration with other building blocks |
| [Deployment](docs/deployment.md) | Prerequisites, build, configuration, start-up checks, rollback |
| [Configuration](docs/configuration.md) | Settings and secrets |
| [Operations](docs/operations.md) | Logging, monitoring, incident response |
| [Contributing](CONTRIBUTING.md) | Version control, review, coding style |

## Test evidence

Reports from the staging environment are in [`test-reports/`](test-reports/).
