# Lockwise Test Suite

## Overview
Comprehensive test suite including unit tests, integration tests, and load tests.

## Setup

```bash
cd tests
npm install
```

## Running Tests

### Unit Tests
Test individual services and utilities:
```bash
npm run test:unit
```

### Integration Tests
Test API endpoints end-to-end:
```bash
npm run test:integration
```

### All Tests
```bash
npm test
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

## Load Testing

### Prerequisites
Install k6:
```bash
# macOS
brew install k6

# Linux
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

### Run Load Tests
```bash
# Standard load test
npm run test:load

# Stress test (200 concurrent users for 5 minutes)
npm run test:load:stress

# Custom load test
k6 run --vus 100 --duration 2m tests/load/load-test.js
```

## Test Structure

```
tests/
├── unit/              # Unit tests for services
│   └── services.test.ts
├── integration/       # API integration tests
│   └── api.test.ts
├── load/             # Load testing scripts
│   └── load-test.js
└── auth.test.ts      # Authentication tests
```

## Writing Tests

### Unit Test Example
```typescript
describe('MyService', () => {
  it('should do something', () => {
    const result = myService.doSomething();
    expect(result).toBe(expected);
  });
});
```

### Integration Test Example
```typescript
it('should create resource', async () => {
  const response = await request(BASE_URL)
    .post('/resource')
    .set('Authorization', `Bearer ${token}`)
    .send(data);

  expect(response.status).toBe(201);
});
```

## Environment Variables

Create `.env.test` file:
```env
BASE_URL=http://localhost:3000/api/v1
TEST_EMAIL=admin@lockwise.com
TEST_PASSWORD=password123
```

## Coverage Goals

- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

## CI/CD Integration

Add to GitHub Actions:
```yaml
- name: Run tests
  run: |
    cd tests
    npm install
    npm test
```