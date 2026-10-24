# Deployment

## Prerequisites

- A container runtime (Docker 24 or later) or Kubernetes 1.28 or later
- PostgreSQL 16, reachable from the container
- Network access to the Identity provider and the Information Mediator

## Build

```bash
docker build -t registry.example.org/licensing-service:1.4.0 .
```

The image contains every runtime dependency. Builds are reproducible from the repository because dependencies are pinned with hashes in `requirements.lock`.

## Configuration

Set these environment variables. Secrets are injected from the secret store: see [Configuration](configuration.md).

| Variable | Purpose |
|----------|---------|
| `LICENSING_DB_URL` | Database connection string (secret) |
| `LICENSING_OIDC_ISSUER` | Identity provider issuer URL |
| `LICENSING_OIDC_AUDIENCE` | Expected token audience |
| `LICENSING_IM_BASE_URL` | Information Mediator base URL |
| `LICENSING_LOG_LEVEL` | `debug`, `info`, `warning` or `error` |

## Start and verify

1. Run the database migrations: `docker run --rm --env-file prod.env registry.example.org/licensing-service:1.4.0 migrate`.
2. Start the service. Kubernetes manifests are in `deploy/`.
3. Check that `GET /api/v1/health` returns `200` with `"status": "ok"`.
4. Check that the log shows `startup complete` and no errors.

Step 1 is manual on the first deployment to a new environment.

## Roll back

1. Redeploy the previous image tag, for example `1.3.2`.
2. If the failed release ran migrations, run `migrate --to <previous revision>` first. Every migration has a down script.
