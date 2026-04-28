#!/bin/bash
set -e

echo "Building and starting Docker test environment..."
docker compose -f test.docker-compose.yml up -d --build site

# Wait for container to be healthy
echo "Waiting for site to be healthy..."
for i in {1..30}; do
  if curl -sf http://localhost:8080/ > /dev/null 2>&1; then
    echo "Site is up!"
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "Site failed to start within timeout"
    docker compose -f test.docker-compose.yml logs site
    docker compose -f test.docker-compose.yml down
    exit 1
  fi
  sleep 1
done

echo "Running Playwright tests against Docker container..."
PLAYWRIGHT_BASE_URL=http://localhost:8080 bunx playwright test

echo "Cleaning up..."
docker compose -f test.docker-compose.yml down
