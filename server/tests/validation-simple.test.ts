import { describe, it, expect } from 'vitest';
import { updateUserSchema } from '../src/validation/userSchemas';
import { createReportSchema, updateReportStatusSchema } from '../src/validation/reportSchemas';
import { createConversationSchema, sendMessageSchema } from '../src/validation/conversationSchemas';
import { sendNotificationSchema } from '../src/validation/notificationSchemas';
import { z } from 'zod';

describe('Zod Validation Security Tests (Schema Level)', () => {
  describe('User Schemas - updateUserSchema', () => {
    it('should reject empty name (less than 2 characters)', () => {
      const result = updateUserSchema.safeParse({ name: 'A' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('at least 2 characters');
      }
    });

    it('should reject name that is too long (more than 100 characters)', () => {
      const longName = 'A'.repeat(101);
      const result = updateUserSchema.safeParse({ name: longName });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('too long');
      }
    });

    it('should reject bio that is too long (more than 500 characters)', () => {
      const longBio = 'A'.repeat(501);
      const result = updateUserSchema.safeParse({ bio: longBio });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('too long');
      }
    });

    it('should reject invalid data types (number instead of string)', () => {
      const result = updateUserSchema.safeParse({ name: 12345 });
      expect(result.success).toBe(false);
    });

    it('should accept valid data', () => {
      const result = updateUserSchema.safeParse({ 
        name: 'Valid Name',
        bio: 'This is a valid bio under 500 characters'
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Valid Name');
        expect(result.data.bio).toBe('This is a valid bio under 500 characters');
      }
    });
  });

  describe('Report Schemas - createReportSchema', () => {
    it('should reject invalid targetType', () => {
      const result = createReportSchema.safeParse({
        targetType: 'INVALID_TYPE',
        targetId: '123e4567-e89b-12d3-a456-426614174000',
        reason: 'This is a valid reason with more than 10 characters'
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid UUID format for targetId', () => {
      const result = createReportSchema.safeParse({
        targetType: 'USER',
        targetId: 'not-a-valid-uuid',
        reason: 'This is a valid reason with more than 10 characters'
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Invalid target ID format');
      }
    });

    it('should reject reason that is too short (less than 10 characters)', () => {
      const result = createReportSchema.safeParse({
        targetType: 'USER',
        targetId: '123e4567-e89b-12d3-a456-426614174000',
        reason: 'Short' // Less than 10 characters
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('at least 10 characters');
      }
    });

    it('should accept valid report data', () => {
      const result = createReportSchema.safeParse({
        targetType: 'USER',
        targetId: '123e4567-e89b-12d3-a456-426614174000',
        reason: 'This is a valid reason with more than 10 characters'
      });
      expect(result.success).toBe(true);
    });
  });

  describe('Report Schemas - updateReportStatusSchema', () => {
    it('should reject invalid status', () => {
      const result = updateReportStatusSchema.safeParse({ status: 'INVALID_STATUS' });
      expect(result.success).toBe(false);
    });

    it('should accept valid status', () => {
      const result = updateReportStatusSchema.safeParse({ status: 'RESOLVED' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('RESOLVED');
      }
    });
  });

  describe('Conversation Schemas - createConversationSchema', () => {
    it('should reject invalid UUID format for participantId', () => {
      const result = createConversationSchema.safeParse({
        participantId: 'invalid-uuid-format'
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Invalid participant ID format');
      }
    });

    it('should accept valid participantId', () => {
      const result = createConversationSchema.safeParse({
        participantId: '123e4567-e89b-12d3-a456-426614174000'
      });
      expect(result.success).toBe(true);
    });
  });

  describe('Conversation Schemas - sendMessageSchema', () => {
    it('should reject empty message content', () => {
      const result = sendMessageSchema.safeParse({ content: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('cannot be empty');
      }
    });

    it('should reject message that is too long (more than 5000 characters)', () => {
      const longMessage = 'A'.repeat(5001);
      const result = sendMessageSchema.safeParse({ content: longMessage });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('too long');
      }
    });

    it('should accept valid message content', () => {
      const result = sendMessageSchema.safeParse({ 
        content: 'This is a valid message'
      });
      expect(result.success).toBe(true);
    });
  });

  describe('Notification Schemas - sendNotificationSchema', () => {
    it('should reject invalid UUID format for userId', () => {
      const result = sendNotificationSchema.safeParse({
        userId: 'invalid-uuid',
        type: 'TEST',
        title: 'Test Title',
        body: 'Test Body'
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Invalid user ID format');
      }
    });

    it('should reject empty title', () => {
      const result = sendNotificationSchema.safeParse({
        userId: '123e4567-e89b-12d3-a456-426614174000',
        type: 'TEST',
        title: '',
        body: 'Test Body'
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('required');
      }
    });

    it('should reject empty body', () => {
      const result = sendNotificationSchema.safeParse({
        userId: '123e4567-e89b-12d3-a456-426614174000',
        type: 'TEST',
        title: 'Test Title',
        body: ''
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('required');
      }
    });

    it('should accept valid notification data', () => {
      const result = sendNotificationSchema.safeParse({
        userId: '123e4567-e89b-12d3-a456-426614174000',
        type: 'TEST',
        title: 'Test Title',
        body: 'Test Body'
      });
      expect(result.success).toBe(true);
    });
  });
});

