import { z } from 'zod';

export const checkoutSchema = z.object({
  productId: z.string().uuid('Invalid product ID format'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(100, 'Quantity cannot exceed 100'),
  currency: z.string().length(3, 'Currency must be 3 characters').optional().default('USD'),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;


