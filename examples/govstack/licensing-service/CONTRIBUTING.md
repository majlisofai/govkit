# Contributing

## Version control

- All source code, configuration and infrastructure definitions are kept in the Git repository `registry/licensing-service`.
- We use trunk-based development. Every change is a short-lived branch merged to `main` through a reviewed pull request.
- `main` is protected: force-pushes and history rewrites are blocked.
- Commit messages follow Conventional Commits and say why a change was made.

## Review

Every pull request needs one approving review. Changes to authentication, authorisation or cryptography need a review from a member of the security chapter.

## Language and style

- Code, comments, commit messages and documentation are written in English.
- Python code follows PEP 8, enforced by `ruff` in CI. Names describe purpose. Comments explain why, not what.
- Folder layout: `app/` for the service, `migrations/` for database migrations, `tests/` for tests, `deploy/` for deployment manifests.
