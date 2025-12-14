// Add this endpoint to get order by ID (add before export default router)
// GET /api/v1/orders/:id
router.get('/:id', authenticateToken, async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const order = await prisma.orders.findUnique({
      where: { id },
      include: {
        order_items: {
          include: {
            products: {
              select: {
                id: true,
                name: true,
                name_ar: true,
                name_zh: true,
                image_url: true,
                price: true,
                currency: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify ownership (unless admin/founder)
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (order.user_id !== userId && user?.role !== 'ADMIN' && user?.role !== 'FOUNDER') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    res.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        totalAmount: order.totalAmount,
        subtotal: order.subtotal,
        shipping_cost: order.shipping_cost,
        currency: order.currency,
        created_at: order.created_at,
        order_items: order.order_items.map((item: any) => ({
          id: item.id,
          product_id: item.product_id,
          variant_id: item.variant_id,
          quantity: item.quantity,
          price: item.price,
          haggled_price: item.haggled_price,
          is_blind_box: item.is_blind_box,
          revealed_product_id: item.revealed_product_id,
          product: item.products,
        })),
      },
    });
  } catch (error: any) {
    console.error('Error fetching order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch order',
      error: error.message 
    });
  }
});
