'use server'

/**
 * Server Action: Create a new Group Buy session
 * 
 * This function creates a unique group buy ID for a product.
 * Currently returns a mock ID, but will be integrated with database later.
 * 
 * @param productId - The ID of the product to create a group buy for
 * @returns Promise with the group buy ID
 */
export async function createGroupBuy(productId: string): Promise<{ groupBuyId: string }> {
  // Validate input
  if (!productId || typeof productId !== 'string') {
    throw new Error('Invalid product ID');
  }

  // Generate a unique group buy ID
  // Using a combination of timestamp and random string for uniqueness
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const groupBuyId = `gb_${timestamp}_${randomString}`;

  // TODO: In the future, this will:
  // 1. Create a record in the database (GroupBuy table)
  // 2. Set expiration time (e.g., 24 hours)
  // 3. Track the creator and product
  // 4. Return the actual database ID

  // For now, return the generated ID
  return {
    groupBuyId,
  };
}

