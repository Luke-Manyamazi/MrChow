import { prisma } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';

export async function dashboard(request, response) {
  const [orders, merchants, pendingPayments] = await Promise.all([
    prisma.order.count(),
    prisma.merchant.count({ where: { isActive: true } }),
    prisma.payment.count({ where: { status: { in: ['PENDING', 'INITIATED'] } } })
  ]);
  response.json({ orders, activeMerchants: merchants, pendingPayments });
}

export async function listOrders(request, response) {
  const orders = await prisma.order.findMany({
    include: { user: true, merchant: true, payment: true, deliveryAssignment: true },
    orderBy: { createdAt: 'desc' },
    take: 100
  });
  response.json(orders);
}

export async function updateOrderStatus(request, response) {
  const allowed = ['PENDING', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
  if (!allowed.includes(request.body.status)) throw new AppError('Invalid order status', 400);
  const order = await prisma.order.update({ where: { id: request.params.id }, data: { status: request.body.status } });
  response.json(order);
}