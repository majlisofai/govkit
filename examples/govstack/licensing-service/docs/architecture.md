# Architecture

## Components

| Component | Responsibility |
|-----------|----------------|
| API service | Receives applications, tracks status, records decisions |
| PostgreSQL database | Stores applications and decisions. Owned and used only by this service. |
| Outbox worker | Publishes status events for other services |

The service runs on its own. It owns its database schema and shares no database, file system or memory with any other service. If a dependency is unavailable, applications are still accepted and queued.

## Integration

The service talks to other building blocks only through their APIs, routed through the Information Mediator:

| Building block | Use |
|----------------|-----|
| Identity | Validates the applicant's identity token (OpenID Connect) |
| Payments | Requests the licence fee and receives payment confirmation |
| Messaging | Sends status notifications to applicants |

No other form of communication with these systems exists.

## API design

- The API follows the TM Forum REST API Design Guidelines (TMF630), Part 1. No personal data or session keys appear in URLs: applications are identified by UUIDs, and applicant details travel in request bodies.
- The base path carries the major version (`/api/v1`). Breaking changes will get `/api/v2`.
- Payloads are JSON (`application/json`).
- All timestamps are ISO 8601 in UTC.

## User interface

The service has no web user interface. Portals are separate applications that call this API.
