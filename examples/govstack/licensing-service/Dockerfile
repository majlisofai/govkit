# Licensing Service container image.
# Build reproducibly from the repository root:
#   docker build -t registry.example.org/licensing-service:1.4.0 .
# Images are tagged with the release's semantic version.

FROM python:3.12-slim AS build
WORKDIR /build
COPY requirements.lock .
RUN pip install --no-cache-dir --require-hashes -r requirements.lock --target /deps

FROM python:3.12-slim
WORKDIR /app
COPY --from=build /deps /usr/local/lib/python3.12/site-packages
COPY app/ ./app/
COPY migrations/ ./migrations/
USER 10001
EXPOSE 8443
ENTRYPOINT ["python", "-m", "app"]
