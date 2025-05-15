# Unit Tests

This directory contains unit tests for the tRPC routers in our application.

## Structure

- `__tests__/` - Contains the actual test files
  - `server/` - Server-side tests
    - `routers/` - Tests for tRPC routers
- `setup.ts` - Jest setup file for global mocks
- `utils.ts` - Shared testing utilities and helper functions
- `tsconfig.json` - TypeScript configuration for tests

## Running Tests

To run all tests:

```bash
pnpm test
```

To run tests in watch mode:

```bash
pnpm test:watch
```

## Writing Tests

The tests follow these principles:

1. Each tRPC router has its own test file
2. We use `jest-mock-extended` to mock the database
3. Shared utilities are provided in `utils.ts`
4. The database is mocked at the module level
5. Next.js functions are mocked globally

### Example Test

```typescript
import { someRouter } from '@/server/routers/some-router';
import { mockDb, resetMocks, createUserContext } from '@/test/utils';

describe('Some Router', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('should return data when called', async () => {
    // Mock database response
    mockDb.query.someTable.findMany.mockResolvedValueOnce([
      { id: 1, name: 'Test' }
    ]);

    // Create a caller with the appropriate context
    const caller = someRouter.createCaller(createUserContext());
    
    // Call the procedure and check results
    const result = await caller.someProcedure();
    expect(result).toEqual([{ id: 1, name: 'Test' }]);
  });
});
```

## Mocking Techniques

- Database queries are mocked using `jest-mock-extended`
- Transactions require special handling (see appointment tests)
- Context is created using helper functions in `utils.ts`
- Enums are handled using special helper functions 