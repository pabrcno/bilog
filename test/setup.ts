import { config } from 'dotenv';
import { mockDeep } from 'jest-mock-extended';

// Load environment variables
config();

// Mock the database
jest.mock('@/db', () => ({
  db: mockDeep<any>(),
}));

// Mock Next.js cookies
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
  })),
}));

// Mock Next.js cache functions
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

// Mock superjson
jest.mock('superjson', () => ({
  default: {
    stringify: jest.fn().mockImplementation(JSON.stringify),
    parse: jest.fn().mockImplementation(JSON.parse),
    serialize: jest.fn().mockImplementation((obj) => ({ json: JSON.stringify(obj) })),
    deserialize: jest.fn().mockImplementation(({ json }) => JSON.parse(json)),
  },
})); 