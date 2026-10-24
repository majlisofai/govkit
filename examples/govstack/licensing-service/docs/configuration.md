# Configuration

- All configuration comes from environment variables. Nothing environment-specific is built into the image.
- Secrets (the database password and the client credentials) are stored in the organisation's HashiCorp Vault and injected into the container at start-up by the Vault agent. They can be rotated without rebuilding or redeploying.
- No secret is ever written to source files, images, pipeline definitions or documentation. [`.env.example`](../.env.example) holds placeholders only.
- A secret scan runs on every pull request. The latest report is in [`test-reports/`](../test-reports/).
