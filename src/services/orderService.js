import { prisma } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';

export async function createOrder({ userId, merchantId, items, location, orderSource = 'APP' }) {
  if (!userId || !merchantId || !Array.isArray(items) || items.length === 0) {
    throw new AppError('user_id, merchant_id, and a non-empty items array are required', 400);
  }

  const productIds = items.map((item) => item.product_id);
  if (productIds.some((id) => !id) || items.some((item) => !Number.isInteger(item.quantity) || item.quantity < 1)) {
    throw new AppError('Each item requires product_id and a positive integer quantity', 400);
  }

  const [user, merchant, products] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.merchant.findFirst({ where: { id: merchantId, isActive: true } }),
    prisma.product.findMany({ where: { id: { in: productIds }, merchantId, inStock: true } })
  ]);

  if (!user) throw new AppError('User not found', 404);
  if (!merchant) throw new AppError('Active merchant not found', 404);
  if (products.length !== new Set(productIds).size) {
    throw new AppError('One or more products are unavailable for this merchant', 400);
  }

  const productById = new Map(products.map((product) => [product.id, product]));
  const orderItems = items.map((item) => ({
    productId: item.product_id,
    quantity: item.quantity,
    unitPrice: productById.get(item.product_id).priceUsd
  }));
  const totalAmountUsd = orderItems.reduce(
    (total, item) => total + Number(item.unitPrice) * item.quantity,
    0
  ).toFixed(2);

  return prisma.order.create({
    data: {
      userId,
      merchantId,
      orderSource,
      totalAmountUsd,
      deliveryLat: location?.latitude,
      deliveryLng: location?.longitude,
      items: { create: orderItems }
    },
    include: { items: true }
  });
}
