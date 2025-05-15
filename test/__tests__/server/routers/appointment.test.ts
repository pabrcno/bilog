import { appointmentRouter } from '@/server/routers/appointment';
import { db } from '@/db';
import { TRPCError } from '@trpc/server';
import { appointments, timeSlots } from '@/db/schema';
import { mockDb, resetMocks, createPatientContext, createAdminContext, createAppointmentStatus } from '@/test/utils';

describe('Appointment Router', () => {
  beforeEach(() => {
    resetMocks();
  });

  describe('bookAppointment', () => {
    it('should book an available appointment', async () => {
      // Mock transaction
      mockDb.transaction.mockImplementationOnce(async (cb) => {
        const tx = {
          query: mockDb.query,
          insert: jest.fn().mockReturnValue({
            values: jest.fn().mockResolvedValue(undefined),
          }),
          update: jest.fn().mockReturnValue({
            set: jest.fn().mockReturnValue({
              where: jest.fn().mockResolvedValue(undefined),
            }),
          }),
          delete: jest.fn(),
        };
        mockDb.query.timeSlots.findFirst.mockResolvedValueOnce({
          id: 1,
          dentistId: 2,
          startTime: new Date('2023-06-20T10:00:00.000Z'),
          endTime: new Date('2023-06-20T10:30:00.000Z'),
          duration: 30,
          isAvailable: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        return cb(tx as any);
      });

      const patientCaller = appointmentRouter.createCaller(createPatientContext());
      const result = await patientCaller.bookAppointment({ timeSlotId: 1 });

      expect(result).toEqual({ success: true });
      expect(mockDb.transaction).toHaveBeenCalled();
    });

    it('should throw an error if the time slot is not available', async () => {
      mockDb.transaction.mockImplementationOnce(async (cb) => {
        const tx = {
          query: mockDb.query,
          insert: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        };
        mockDb.query.timeSlots.findFirst.mockResolvedValueOnce(undefined);
        return cb(tx as any);
      });

      const patientCaller = appointmentRouter.createCaller(createPatientContext());
      await expect(patientCaller.bookAppointment({ timeSlotId: 999 }))
        .rejects.toThrow('Failed to book appointment');
    });
  });

  describe('cancelAppointment', () => {
    it('should cancel an appointment', async () => {
      mockDb.transaction.mockImplementationOnce(async (cb) => {
        const tx = {
          query: mockDb.query,
          insert: jest.fn(),
          update: jest.fn().mockReturnValue({
            set: jest.fn().mockReturnValue({
              where: jest.fn().mockResolvedValue(undefined),
            }),
          }),
          delete: jest.fn(),
        };
        return cb(tx as any);
      });

      const patientCaller = appointmentRouter.createCaller(createPatientContext());
      const result = await patientCaller.cancelAppointment({ appointmentId: 1, timeSlotId: 1 });

      expect(result).toEqual({ success: true });
      expect(mockDb.transaction).toHaveBeenCalled();
    });
  });

  describe('getPatientAppointments', () => {
    it('should get appointments for the current patient', async () => {
      const mockAppointments = [
        {
          id: 1,
          timeSlotId: 1,
          patientId: 1,
          status: createAppointmentStatus('pending'),
          notes: 'Test notes',
          createdAt: new Date(),
          updatedAt: new Date(),
          timeSlot: {
            id: 1,
            dentistId: 2,
            startTime: new Date('2023-06-20T10:00:00.000Z'),
            endTime: new Date('2023-06-20T10:30:00.000Z'),
            duration: 30,
            isAvailable: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            dentist: {
              id: 2,
              name: 'Test Dentist',
            },
          },
          patient: {
            id: 1,
            name: 'Test Patient',
          },
        },
      ];

      mockDb.query.appointments.findMany.mockResolvedValueOnce(mockAppointments);

      const patientCaller = appointmentRouter.createCaller(createPatientContext());
      const result = await patientCaller.getPatientAppointments();

      expect(result).toEqual(mockAppointments);
      expect(mockDb.query.appointments.findMany).toHaveBeenCalled();
    });
  });

  describe('getDentistAppointments', () => {
    it('should get all appointments for dentist', async () => {
      const mockAppointments = [
        {
          id: 1,
          timeSlotId: 1,
          patientId: 1,
          status: createAppointmentStatus('pending'),
          notes: 'Test notes',
          createdAt: new Date(),
          updatedAt: new Date(),
          timeSlot: {
            id: 1,
            dentistId: 2,
            startTime: new Date('2023-06-20T10:00:00.000Z'),
            endTime: new Date('2023-06-20T10:30:00.000Z'),
            duration: 30,
            isAvailable: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            dentist: {
              id: 2,
              name: 'Test Dentist',
              email: 'dentist@example.com',
              role: 'admin',
              createdAt: new Date(),
              updatedAt: new Date(),
              passwordHash: 'hashed',
            },
          },
          patient: {
            id: 1,
            name: 'Test Patient',
            email: 'patient@example.com',
            role: 'patient',
            createdAt: new Date(),
            updatedAt: new Date(),
            passwordHash: 'hashed',
          },
        },
      ];

      mockDb.query.appointments.findMany.mockResolvedValueOnce(mockAppointments);

      const adminCaller = appointmentRouter.createCaller(createAdminContext());
      const result = await adminCaller.getDentistAppointments();

      expect(result).toEqual(mockAppointments);
      expect(mockDb.query.appointments.findMany).toHaveBeenCalled();
    });
  });

  describe('confirmAppointment', () => {
    it('should confirm a pending appointment', async () => {
      mockDb.query.appointments.findFirst.mockResolvedValueOnce({
        id: 1,
        timeSlotId: 1,
        patientId: 1,
        status: createAppointmentStatus('pending'),
        notes: 'Test notes',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(undefined),
        }),
      } as any);

      const adminCaller = appointmentRouter.createCaller(createAdminContext());
      const result = await adminCaller.confirmAppointment({ appointmentId: 1 });

      expect(result).toEqual({ success: true });
      expect(mockDb.update).toHaveBeenCalled();
    });

    it('should throw an error if appointment is not found', async () => {
      mockDb.query.appointments.findFirst.mockResolvedValueOnce(undefined);
      const adminCaller = appointmentRouter.createCaller(createAdminContext());
      await expect(adminCaller.confirmAppointment({ appointmentId: 999 }))
        .rejects.toThrow('Failed to confirm appointment');
    });

    it('should throw an error if appointment is cancelled', async () => {
      mockDb.query.appointments.findFirst.mockResolvedValueOnce({
        id: 1,
        timeSlotId: 1,
        patientId: 1,
        status: createAppointmentStatus('cancelled'),
        notes: 'Test notes',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      const adminCaller = appointmentRouter.createCaller(createAdminContext());
      await expect(adminCaller.confirmAppointment({ appointmentId: 1 }))
        .rejects.toThrow('Failed to confirm appointment');
    });
  });

  describe('rejectAppointment', () => {
    it('should reject a pending appointment', async () => {
      mockDb.transaction.mockImplementationOnce(async (cb) => {
        const tx = {
          query: mockDb.query,
          insert: jest.fn(),
          update: jest.fn().mockReturnValue({
            set: jest.fn().mockReturnValue({
              where: jest.fn().mockResolvedValue(undefined),
            }),
          }),
          delete: jest.fn(),
        };
        mockDb.query.appointments.findFirst.mockResolvedValueOnce({
          id: 1,
          timeSlotId: 1,
          patientId: 1,
          status: createAppointmentStatus('pending'),
          notes: 'Test notes',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        return cb(tx as any);
      });

      const adminCaller = appointmentRouter.createCaller(createAdminContext());
      const result = await adminCaller.rejectAppointment({ appointmentId: 1, timeSlotId: 1 });

      expect(result).toEqual({ success: true });
      expect(mockDb.transaction).toHaveBeenCalled();
    });

    it('should throw an error if appointment is not pending', async () => {
      mockDb.transaction.mockImplementationOnce(async (cb) => {
        const tx = {
          query: mockDb.query,
          insert: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        };
        mockDb.query.appointments.findFirst.mockResolvedValueOnce({
          id: 1,
          timeSlotId: 1,
          patientId: 1,
          status: createAppointmentStatus('confirmed'),
          notes: 'Test notes',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        return cb(tx as any);
      });

      const adminCaller = appointmentRouter.createCaller(createAdminContext());
      await expect(adminCaller.rejectAppointment({ appointmentId: 1, timeSlotId: 1 }))
        .rejects.toThrow('Failed to reject appointment');
    });
  });
}); 