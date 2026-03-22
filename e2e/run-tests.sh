#!/bin/bash
set -e
echo "Starting containers..."
docker-compose up --build -d
echo "Waiting for app..."
sleep 10
for i in {1..30}; do
  if curl -s http://localhost:3000 > /dev/null; then
    echo "App is ready"
    break
  fi
  sleep 2
done
echo "Running tests..."
npx jest --config jest.e2e.config.js --runInBand 2>&1 | tee test-output.log
EXIT_CODE=${PIPESTATUS[0]}
echo "Saving screenshots..."
mkdir -p test-results
cp -r e2e/screenshots test-results/ 2>/dev/null || true
echo "Stopping containers..."
docker-compose down
exit $EXIT_CODE
