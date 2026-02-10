# K6 Load Testing Configuration

## Test Profiles

### 1. Smoke Test (Quick validation)
```bash
k6 run --include-system-env-vars \
  --env BASE_URL=http://localhost:3000/api/v1 \
  --env TEST_EMAIL=admin@lockwise.com \
  --env TEST_PASSWORD=Admin123! \
  --out json=results/smoke-test.json \
  tests/industry-standard-load.js
```

### 2. Load Test (Normal traffic)
```bash
k6 run --include-system-env-vars \
  --env BASE_URL=http://localhost:3000/api/v1 \
  --tag environment=staging \
  --out json=results/load-test.json \
  --out influxdb=http://localhost:8086/k6 \
  tests/industry-standard-load.js
```

### 3. Stress Test (Breaking point)
```bash
k6 run --include-system-env-vars \
  --env BASE_URL=http://localhost:3000/api/v1 \
  --out json=results/stress-test.json \
  tests/industry-standard-load.js
```

### 4. Spike Test (Traffic surge)
```bash
k6 run --include-system-env-vars \
  --env BASE_URL=http://localhost:3000/api/v1 \
  --out json=results/spike-test.json \
  tests/industry-standard-load.js
```

### 5. Soak Test (Endurance - 1 hour)
```bash
k6 run --include-system-env-vars \
  --env BASE_URL=http://localhost:3000/api/v1 \
  --out json=results/soak-test.json \
  tests/industry-standard-load.js
```

## Run Specific Scenario Only

```bash
# Run only smoke test
k6 run --include-system-env-vars \
  --env BASE_URL=http://localhost:3000/api/v1 \
  --scenario smoke \
  tests/industry-standard-load.js

# Run only load test
k6 run --scenario load tests/industry-standard-load.js
```

## Cloud Execution (K6 Cloud)

```bash
k6 cloud tests/industry-standard-load.js
```

## With Grafana Dashboard

```bash
# Start InfluxDB + Grafana
docker-compose up -d influxdb grafana

# Run test with InfluxDB output
k6 run --out influxdb=http://localhost:8086/k6 tests/industry-standard-load.js
```

## Performance Thresholds

- **Response Time**: 95% < 500ms, 99% < 1s
- **Error Rate**: < 1%
- **Availability**: > 99.9%
- **Throughput**: > 1000 req/s

## Metrics Collected

- `http_req_duration`: Request duration
- `http_req_waiting`: Server processing time
- `http_req_failed`: Failed requests
- `errors`: Custom error rate
- `auth_duration`: Authentication time
- `api_calls`: Total API calls
