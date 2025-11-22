/**
 * Input Validation Middleware
 * Provides comprehensive input validation and sanitization
 */

import { Request, Response, NextFunction } from 'express';
import * as validator from 'validator';
import { JSDOM } from 'jsdom';

// Create DOMPurify instance for server-side use
const window = new JSDOM('').window;
const DOMPurify = require('isomorphic-dompurify')(window);

export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'email' | 'url' | 'boolean' | 'array' | 'object';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
  sanitize?: boolean;
  allowEmpty?: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

class InputValidator {
  private rules: ValidationRule[];
  private errors: ValidationError[] = [];

  constructor(rules: ValidationRule[]) {
    this.rules = rules;
  }

  /**
   * Validates request body against defined rules
   */
  validate(data: any): { isValid: boolean; errors: ValidationError[]; sanitized: any } {
    this.errors = [];
    const sanitized: any = {};

    for (const rule of this.rules) {
      const value = data[rule.field];
      const sanitizedValue = this.validateField(rule, value);
      
      if (sanitizedValue !== undefined) {
        sanitized[rule.field] = sanitizedValue;
      }
    }

    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
      sanitized,
    };
  }

  private validateField(rule: ValidationRule, value: any): any {
    // Check if field is required
    if (rule.required && (value === undefined || value === null || value === '')) {
      this.errors.push({
        field: rule.field,
        message: `${rule.field} is required`,
        value,
      });
      return undefined;
    }

    // Allow empty values if not required
    if (!rule.required && (value === undefined || value === null || value === '')) {
      return rule.allowEmpty ? value : undefined;
    }

    // Type validation
    if (rule.type) {
      const typeValidation = this.validateType(rule, value);
      if (typeValidation.error) {
        this.errors.push({
          field: rule.field,
          message: typeValidation.error,
          value,
        });
        return undefined;
      }
      value = typeValidation.value;
    }

    // Length validation for strings
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        this.errors.push({
          field: rule.field,
          message: `${rule.field} must be at least ${rule.minLength} characters long`,
          value,
        });
        return undefined;
      }

      if (rule.maxLength && value.length > rule.maxLength) {
        this.errors.push({
          field: rule.field,
          message: `${rule.field} must be no more than ${rule.maxLength} characters long`,
          value,
        });
        return undefined;
      }
    }

    // Numeric range validation
    if (typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        this.errors.push({
          field: rule.field,
          message: `${rule.field} must be at least ${rule.min}`,
          value,
        });
        return undefined;
      }

      if (rule.max !== undefined && value > rule.max) {
        this.errors.push({
          field: rule.field,
          message: `${rule.field} must be no more than ${rule.max}`,
          value,
        });
        return undefined;
      }
    }

    // Pattern validation
    if (rule.pattern && typeof value === 'string') {
      if (!rule.pattern.test(value)) {
        this.errors.push({
          field: rule.field,
          message: `${rule.field} format is invalid`,
          value,
        });
        return undefined;
      }
    }

    // Custom validation
    if (rule.custom) {
      const customResult = rule.custom(value);
      if (customResult !== true) {
        this.errors.push({
          field: rule.field,
          message: typeof customResult === 'string' ? customResult : `${rule.field} is invalid`,
          value,
        });
        return undefined;
      }
    }

    // Sanitization
    if (rule.sanitize && typeof value === 'string') {
      value = this.sanitizeString(value);
    }

    return value;
  }

  private validateType(rule: ValidationRule, value: any): { value: any; error?: string } {
    switch (rule.type) {
      case 'string':
        if (typeof value !== 'string') {
          return { value, error: `${rule.field} must be a string` };
        }
        return { value: value.trim() };

      case 'number':
        const num = Number(value);
        if (isNaN(num)) {
          return { value, error: `${rule.field} must be a valid number` };
        }
        return { value: num };

      case 'email':
        if (typeof value !== 'string' || !validator.isEmail(value)) {
          return { value, error: `${rule.field} must be a valid email address` };
        }
        return { value: validator.normalizeEmail(value) || value };

      case 'url':
        if (typeof value !== 'string' || !validator.isURL(value)) {
          return { value, error: `${rule.field} must be a valid URL` };
        }
        return { value };

      case 'boolean':
        if (typeof value === 'boolean') {
          return { value };
        }
        if (typeof value === 'string') {
          const lower = value.toLowerCase();
          if (lower === 'true' || lower === '1') return { value: true };
          if (lower === 'false' || lower === '0') return { value: false };
        }
        return { value, error: `${rule.field} must be a boolean` };

      case 'array':
        if (!Array.isArray(value)) {
          return { value, error: `${rule.field} must be an array` };
        }
        return { value };

      case 'object':
        if (typeof value !== 'object' || Array.isArray(value) || value === null) {
          return { value, error: `${rule.field} must be an object` };
        }
        return { value };

      default:
        return { value };
    }
  }

  private sanitizeString(value: string): string {
    // Remove HTML tags and potentially dangerous content
    let sanitized = DOMPurify.sanitize(value, { ALLOWED_TAGS: [] });
    
    // Trim whitespace
    sanitized = sanitized.trim();
    
    // Remove excessive whitespace
    sanitized = sanitized.replace(/\s+/g, ' ');
    
    return sanitized;
  }
}

/**
 * Creates validation middleware
 */
export function validateInput(rules: ValidationRule[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const validator = new InputValidator(rules);
    const result = validator.validate(req.body);

    if (!result.isValid) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Please check your input and try again',
        details: result.errors,
      });
    }

    // Replace request body with sanitized data
    req.body = result.sanitized;
    next();
  };
}

/**
 * Pre-defined validation rules for common use cases
 */

// AI Assistant validation
export const aiAssistantValidation = validateInput([
  {
    field: 'assistant',
    required: true,
    type: 'string',
    minLength: 1,
    maxLength: 50,
    pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
  },
  {
    field: 'message',
    required: true,
    type: 'string',
    minLength: 1,
    maxLength: 2000,
    sanitize: true,
  },
]);

// User registration validation
export const userRegistrationValidation = validateInput([
  {
    field: 'email',
    required: true,
    type: 'email',
  },
  {
    field: 'password',
    required: true,
    type: 'string',
    minLength: 8,
    maxLength: 128,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    custom: (value: string) => {
      if (!/(?=.*[a-z])/.test(value)) return 'Password must contain at least one lowercase letter';
      if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain at least one uppercase letter';
      if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number';
      if (!/(?=.*[@$!%*?&])/.test(value)) return 'Password must contain at least one special character';
      return true;
    },
  },
  {
    field: 'name',
    required: true,
    type: 'string',
    minLength: 2,
    maxLength: 100,
    sanitize: true,
  },
]);

// Product creation validation
export const productValidation = validateInput([
  {
    field: 'title',
    required: true,
    type: 'string',
    minLength: 3,
    maxLength: 200,
    sanitize: true,
  },
  {
    field: 'description',
    required: true,
    type: 'string',
    minLength: 10,
    maxLength: 5000,
    sanitize: true,
  },
  {
    field: 'price',
    required: true,
    type: 'number',
    min: 0,
    max: 1000000,
  },
  {
    field: 'category',
    required: true,
    type: 'string',
    minLength: 1,
    maxLength: 50,
  },
]);

// Comment validation
export const commentValidation = validateInput([
  {
    field: 'content',
    required: true,
    type: 'string',
    minLength: 1,
    maxLength: 1000,
    sanitize: true,
  },
]);

// Search validation
export const searchValidation = validateInput([
  {
    field: 'query',
    required: true,
    type: 'string',
    minLength: 1,
    maxLength: 200,
    sanitize: true,
  },
  {
    field: 'limit',
    required: false,
    type: 'number',
    min: 1,
    max: 100,
  },
  {
    field: 'offset',
    required: false,
    type: 'number',
    min: 0,
  },
]);

export default InputValidator;
