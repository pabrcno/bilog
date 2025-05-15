import { timeSlotRouter } from '@/server/routers/timeSlot';

import { timeSlots } from '@/db/schema';
import { mockDb, resetMocks, createAdminContext, createPublicContext } from '@/test/utils';

describe('TimeSlot Router', () => {
  beforeEach(() => {
    resetMocks();
  });

  describe('createTimeSlot', () => {
    it('should create a time slot when there is no overlap', async () => {
      // Mock the database query for overlapping slots
      mockDb.query.timeSlots.findFirst.mockResolvedValueOnce(undefined);

      // Mock the database insert
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnThis(),
      } as any);

      const adminCaller = timeSlotRouter.createCaller(createAdminContext());
      const result = await adminCaller.createTimeSlot({
        startTime: '2023-06-20T10:00:00.000Z',
        duration: 30,
      });

      expect(result).toEqual({ success: true });
      
      // Verify the query was called with correct parameters
      expect(mockDb.query.timeSlots.findFirst).toHaveBeenCalled();
      expect(mockDb.insert).toHaveBeenCalledWith(timeSlots);
    });

    it('should throw an error when there is an overlapping slot', async () => {
      // Mock the database query to return an overlapping slot
      mockDb.query.timeSlots.findFirst.mockResolvedValueOnce({
        id: 2,
        dentistId: 1,
        startTime: new Date('2023-06-20T10:00:00.000Z'),
        endTime: new Date('2023-06-20T10:30:00.000Z'),
        duration: 30,
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const adminCaller = timeSlotRouter.createCaller(createAdminContext());
      await expect(
        adminCaller.createTimeSlot({
          startTime: '2023-06-20T10:15:00.000Z',
          duration: 30,
        })
      ).rejects.toThrow('Failed to create time slot');
    });
  });

  describe('getTimeSlotsForDate', () => {
    it('should return available time slots for a specific date', async () => {
      const mockDate = new Date('2023-06-20');
      const mockSlots = [
        {
          id: 1,
          dentistId: 1,
          startTime: new Date('2023-06-20T09:00:00.000Z'),
          endTime: new Date('2023-06-20T09:30:00.000Z'),
          duration: 30,
          isAvailable: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          dentist: { id: 1, name: 'Dr. Smith' },
        },
        {
          id: 2,
          dentistId: 1,
          startTime: new Date('2023-06-20T10:00:00.000Z'),
          endTime: new Date('2023-06-20T10:30:00.000Z'),
          duration: 30,
          isAvailable: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          dentist: { id: 1, name: 'Dr. Smith' },
        },
      ];

      mockDb.query.timeSlots.findMany.mockResolvedValueOnce(mockSlots);

      const publicCaller = timeSlotRouter.createCaller(createPublicContext());
      const result = await publicCaller.getTimeSlotsForDate({ date: mockDate });

      expect(result).toEqual(mockSlots);
      expect(mockDb.query.timeSlots.findMany).toHaveBeenCalled();
    });
  });

  describe('deleteTimeSlot', () => {
    it('should delete a time slot', async () => {
      mockDb.delete.mockReturnValueOnce({
        where: jest.fn().mockReturnThis(),
      } as any);

      const adminCaller = timeSlotRouter.createCaller(createAdminContext());
      const result = await adminCaller.deleteTimeSlot({ id: 1 });

      expect(result).toEqual({ success: true });
      expect(mockDb.delete).toHaveBeenCalledWith(timeSlots);
    });
  });

  describe('getDentistTimeSlots', () => {
    it('should get time slots for the current dentist', async () => {
      const mockSlots = [
        {
          id: 1,
          dentistId: 1,
          startTime: new Date('2023-06-20T09:00:00.000Z'),
          endTime: new Date('2023-06-20T09:30:00.000Z'),
          duration: 30,
          isAvailable: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          dentistId: 1,
          startTime: new Date('2023-06-20T10:00:00.000Z'),
          endTime: new Date('2023-06-20T10:30:00.000Z'),
          duration: 30,
          isAvailable: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockDb.query.timeSlots.findMany.mockResolvedValueOnce(mockSlots);

      const adminCaller = timeSlotRouter.createCaller(createAdminContext());
      const result = await adminCaller.getDentistTimeSlots();

      expect(result).toEqual(mockSlots);
      expect(mockDb.query.timeSlots.findMany).toHaveBeenCalled();
    });
  });
}); 