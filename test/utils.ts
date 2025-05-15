import { mockDeep, mockReset } from 'jest-mock-extended';
import { db } from '@/db';

// Mock the database with correct typing
export const mockDb = mockDeep<typeof db>();
(db as any) = mockDb;

// Reset all mocks before each test
export const resetMocks = () => {
  mockReset(mockDb);
  jest.clearAllMocks();
};

// Appointment status type
export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'rejected';

// Helper to create a valid appointment status
export const createAppointmentStatus = (status: string): AppointmentStatus => {
  if (status === 'pending' || status === 'confirmed' || status === 'cancelled' || status === 'rejected') {
    return status as AppointmentStatus;
  }
  return 'pending';
};

// User role type
export type UserRole = 'admin' | 'patient';

// Helper to create a valid user role
export const createUserRole = (role: string): UserRole => {
  if (role === 'admin' || role === 'patient') {
    return role as UserRole;
  }
  return 'patient';
};

// Create mock contexts for testing
export const createPatientContext = () => ({
  user: {
    id: 1,
    name: 'Test Patient',
    email: 'patient@example.com',
    role: createUserRole('patient'),
  },
});

export const createAdminContext = () => ({
  user: {
    id: 2,
    name: 'Test Dentist',
    email: 'dentist@example.com',
    role: createUserRole('admin'),
  },
});

export const createPublicContext = () => ({
  user: null,
}); 