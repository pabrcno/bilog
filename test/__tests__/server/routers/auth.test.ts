import { authRouter } from '@/server/routers/auth';
import { db } from '@/db';
import { TRPCError } from '@trpc/server';
import { mockDb, resetMocks, createUserRole } from '@/test/utils';
import { cookies } from 'next/headers';

// Mock cookies
const mockCookieStore = {
  get: jest.fn(),
  set: jest.fn(),
};
const mockCookies = jest.fn().mockReturnValue(mockCookieStore);
(cookies as jest.Mock) = mockCookies;

// Mock the Context creator to provide test context
const createInnerContext = () => ({
  user: null,
});

// Create a caller for testing
const createCaller = () => authRouter.createCaller(createInnerContext());

describe('Auth Router', () => {
  beforeEach(() => {
    resetMocks();
  });

  describe('login', () => {
    it('should login a user with valid credentials', async () => {
      // Mock user query
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        passwordHash: 'password123', // In a real app, this would be hashed
        name: 'Test User',
        role: createUserRole('patient'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Setup query response
      mockDb.query.users.findFirst.mockResolvedValueOnce(mockUser);

      const caller = createCaller();
      const result = await caller.login({
        email: 'test@example.com',
        password: 'password123',
        role: 'patient',
      });

      // Check result
      expect(result).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
      });

      // Check that cookies were set
      expect(mockCookies).toHaveBeenCalled();
      expect(mockCookieStore.set).toHaveBeenCalledWith('userId', mockUser.id.toString(), expect.any(Object));
      expect(mockCookieStore.set).toHaveBeenCalledWith('userRole', mockUser.role, expect.any(Object));
    });

    it('should throw an error for invalid credentials', async () => {
      // Mock user query with no result
      mockDb.query.users.findFirst.mockResolvedValueOnce(undefined);

      const caller = createCaller();
      await expect(
        caller.login({
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
          role: 'patient',
        })
      ).rejects.toThrow(new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid credentials' }));
    });

    it('should throw an error for wrong password', async () => {
      // Mock user query with result
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        passwordHash: 'correctpassword',
        name: 'Test User',
        role: createUserRole('patient'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.query.users.findFirst.mockResolvedValueOnce(mockUser);

      const caller = createCaller();
      await expect(
        caller.login({
          email: 'test@example.com',
          password: 'wrongpassword',
          role: 'patient',
        })
      ).rejects.toThrow(new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid credentials' }));
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      // Mock existing user check
      mockDb.query.users.findFirst.mockResolvedValueOnce(undefined);

      // Mock user insert
      const newUser = {
        id: 1,
        email: 'new@example.com',
        passwordHash: 'password123',
        name: 'New User',
        role: createUserRole('patient'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDb.insert.mockReturnValueOnce({
        values: () => ({
          returning: jest.fn().mockResolvedValueOnce([newUser]),
        }),
      } as any);

      const caller = createCaller();
      const result = await caller.register({
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
        role: 'patient',
      });

      // Check result
      expect(result).toEqual({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      });
    });

    it('should throw an error if user already exists', async () => {
      // Mock existing user check
      mockDb.query.users.findFirst.mockResolvedValueOnce({
        id: 1,
        email: 'existing@example.com',
        passwordHash: 'password123',
        name: 'Existing User',
        role: createUserRole('patient'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const caller = createCaller();
      await expect(
        caller.register({
          email: 'existing@example.com',
          password: 'password123',
          name: 'New User',
          role: 'patient',
        })
      ).rejects.toThrow(new TRPCError({ code: 'BAD_REQUEST', message: 'User already exists' }));
    });
  });

  describe('logout', () => {
    it('should clear cookies and return success', async () => {
      const caller = createCaller();
      const result = await caller.logout();

      expect(result).toEqual({ success: true });
      expect(mockCookies).toHaveBeenCalled();
      expect(mockCookieStore.set).toHaveBeenCalledWith('userId', '', expect.objectContaining({ expires: expect.any(Date) }));
      expect(mockCookieStore.set).toHaveBeenCalledWith('userRole', '', expect.objectContaining({ expires: expect.any(Date) }));
    });
  });

  describe('getCurrentUser', () => {
    it('should return the current user from context', async () => {
      // Create a caller with a user in context
      const userContext = {
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          role: createUserRole('patient'),
        },
      };

      const authenticatedCaller = authRouter.createCaller(userContext);
      const result = await authenticatedCaller.getCurrentUser();

      expect(result).toEqual(userContext.user);
    });

    it('should return null if no user in context', async () => {
      const caller = createCaller();
      const result = await caller.getCurrentUser();

      expect(result).toBeNull();
    });
  });
}); 