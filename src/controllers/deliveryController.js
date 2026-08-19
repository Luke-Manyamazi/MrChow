import { prisma } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';

export async function assignDelivery(request, response) {
  const driver = await prisma.user.findFirst({ where: { id: request.body.driver_id, role: 'DRIVER' } });
  if (!driver) throw new AppError('Driver not found', 404);
  const assignment = await prisma.deliveryAssignment.upsert({
    where: { orderId: request.params.orderId },
    update: { driverId: driver.id, status: 'ASSIGNED', assignedAt: new Date() },
    create: { orderId: request.params.orderId, driverId: driver.id, status: 'ASSIGNED', assignedAt: new Date() }
  });
  response.status(201).json(assignment);
}

export async function updateDelivery(request, response) {
  const allowed = ['ASSIGNED', 'PICKED_UP', 'DELIVERED'];
  if (!allowed.includes(request.body.status)) throw new AppError('Invalid delivery status', 400);
  const field = { PICKED_UP: 'pickedUpAt', DELIVERED: 'deliveredAt' }[request.body.status];
  const assignment = await prisma.deliveryAssignment.update({
    where: { orderId: request.params.orderId },
    data: { status: request.body.status, ...(field ? { [field]: new Date() } : {}) }
  });
  response.json(assignment);
}