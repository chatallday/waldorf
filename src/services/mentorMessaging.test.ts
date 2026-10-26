import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  createMentorMessage, 
  getMentorMessagesByMentorId, 
  replyToMentorMessage,
  getMentorMessageById,
  updateMentorMessageReadStatus,
} from '../services/workflowService';
import { createTeableRecord, fetchTeableRecords, fetchTeableRecord, updateTeableRecord } from '../services/teableService';

// Mock teableService
vi.mock('../services/teableService', () => ({
  createTeableRecord: vi.fn(),
  fetchTeableRecords: vi.fn(),
  fetchTeableRecord: vi.fn(),
  updateTeableRecord: vi.fn(),
}));

describe('Mentor Messaging Workflow', () => {
  const mockMentorId = 'mentor-1';
  const mockMessageId = 'msg-1';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createMentorMessage', () => {
    it('creates a new mentor message in Teable', async () => {
      (createTeableRecord as vi.Mock).mockResolvedValue({ id: mockMessageId });

      const result = await createMentorMessage({
        mentorId: mockMentorId,
        mentorName: 'Anna Müller',
        seekerEmail: 'seeker@example.com',
        seekerName: 'John Doe',
        subject: 'Inquiry about Grade 1',
        message: 'Hello, I need guidance...',
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBe(mockMessageId);
      expect(createTeableRecord).toHaveBeenCalledWith(
        'tblMentorMessages',
        expect.objectContaining({
          Mentor_ID: mockMentorId,
          Mentor_Name: 'Anna Müller',
          Seeker_Email: 'seeker@example.com',
          Seeker_Name: 'John Doe',
          Subject: 'Inquiry about Grade 1',
          Message: 'Hello, I need guidance...',
          Status: 'New',
        })
      );
    });

    it('returns error on Teable failure', async () => {
      (createTeableRecord as vi.Mock).mockRejectedValue(new Error('Teable error'));

      const result = await createMentorMessage({
        mentorId: mockMentorId,
        mentorName: 'Anna Müller',
        seekerEmail: 'seeker@example.com',
        seekerName: 'John Doe',
        subject: 'Inquiry',
        message: 'Test message',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Teable error');
    });
  });

  describe('getMentorMessagesByMentorId', () => {
    it('fetches and maps messages for a mentor', async () => {
      const mockRecords = [
        {
          id: 'msg-1',
          fields: {
            Mentor_ID: mockMentorId,
            Mentor_Name: 'Anna Müller',
            Seeker_Email: 'seeker@example.com',
            Seeker_Name: 'John Doe',
            Subject: 'Grade 1 inquiry',
            Message: 'Need guidance...',
            Status: 'New',
            Reply: '',
            Created_At: '2026-01-15T10:00:00Z',
            Replied_At: '',
          },
        },
      ];

      (fetchTeableRecords as vi.Mock).mockResolvedValue(mockRecords);

      const messages = await getMentorMessagesByMentorId(mockMentorId);

      expect(messages).toHaveLength(1);
      expect(messages[0]).toMatchObject({
        id: 'msg-1',
        mentorId: mockMentorId,
        mentorName: 'Anna Müller',
        seekerEmail: 'seeker@example.com',
        seekerName: 'John Doe',
        subject: 'Grade 1 inquiry',
        message: 'Need guidance...',
        status: 'New',
      });
    });

    it('sorts messages by createdAt descending', async () => {
      const mockRecords = [
        {
          id: 'msg-1',
          fields: { Mentor_ID: mockMentorId, Seeker_Email: 'a@b.com', Subject: 'First', Message: 'Msg 1', Status: 'New', Created_At: '2026-01-10T10:00:00Z' },
        },
        {
          id: 'msg-2',
          fields: { Mentor_ID: mockMentorId, Seeker_Email: 'c@d.com', Subject: 'Second', Message: 'Msg 2', Status: 'New', Created_At: '2026-01-15T10:00:00Z' },
        },
      ];

      (fetchTeableRecords as vi.Mock).mockResolvedValue(mockRecords);

      const messages = await getMentorMessagesByMentorId(mockMentorId);

      expect(messages[0].id).toBe('msg-2'); // Newer first
      expect(messages[1].id).toBe('msg-1');
    });

    it('returns empty array on error', async () => {
      (fetchTeableRecords as vi.Mock).mockRejectedValue(new Error('Network error'));

      const messages = await getMentorMessagesByMentorId(mockMentorId);

      expect(messages).toEqual([]);
    });
  });

  describe('replyToMentorMessage', () => {
    it('updates message with reply in Teable', async () => {
      (updateTeableRecord as vi.Mock).mockResolvedValue({ id: mockMessageId });

      const result = await replyToMentorMessage(mockMessageId, 'Thank you for your inquiry!');

      expect(result.success).toBe(true);
      expect(updateTeableRecord).toHaveBeenCalledWith(
        'tblMentorMessages',
        mockMessageId,
        expect.objectContaining({
          Reply: 'Thank you for your inquiry!',
          Status: 'Replied',
        })
      );
    });

    it('returns error on Teable failure', async () => {
      (updateTeableRecord as vi.Mock).mockRejectedValue(new Error('Update failed'));

      const result = await replyToMentorMessage(mockMessageId, 'Reply text');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Update failed');
    });
  });

  describe('getMentorMessageById', () => {
    it('fetches a single message by ID', async () => {
      const mockRecord = {
        id: mockMessageId,
        fields: {
          Mentor_ID: mockMentorId,
          Mentor_Name: 'Anna Müller',
          Seeker_Email: 'seeker@example.com',
          Seeker_Name: 'John Doe',
          Subject: 'Grade 1 inquiry',
          Message: 'Need guidance...',
          Status: 'New',
          Reply: '',
          Created_At: '2026-01-15T10:00:00Z',
          Replied_At: '',
        },
      };

      (fetchTeableRecord as vi.Mock).mockResolvedValue(mockRecord);

      const message = await getMentorMessageById(mockMessageId);

      expect(message).toMatchObject({
        id: mockMessageId,
        mentorId: mockMentorId,
        mentorName: 'Anna Müller',
        seekerEmail: 'seeker@example.com',
        seekerName: 'John Doe',
        subject: 'Grade 1 inquiry',
        message: 'Need guidance...',
        status: 'New',
      });
    });

    it('returns null if not found', async () => {
      (fetchTeableRecord as vi.Mock).mockRejectedValue(new Error('Not found'));

      const message = await getMentorMessageById('non-existent');

      expect(message).toBeNull();
    });
  });

  describe('updateMentorMessageReadStatus', () => {
    it('updates message status to Read', async () => {
      (updateTeableRecord as vi.Mock).mockResolvedValue({ id: mockMessageId });

      const result = await updateMentorMessageReadStatus(mockMessageId, 'Read');

      expect(result.success).toBe(true);
      expect(updateTeableRecord).toHaveBeenCalledWith(
        'tblMentorMessages',
        mockMessageId,
        { Status: 'Read' }
      );
    });

    it('updates message status to New', async () => {
      (updateTeableRecord as vi.Mock).mockResolvedValue({ id: mockMessageId });

      await updateMentorMessageReadStatus(mockMessageId, 'New');

      expect(updateTeableRecord).toHaveBeenCalledWith(
        'tblMentorMessages',
        mockMessageId,
        { Status: 'New' }
      );
    });
  });
});