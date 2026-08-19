import { prisma } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';

export async function upsertUser(request, response) {
  const phoneNumber = String(request.body.phone_number || '').trim();
  const fullName = String(request.body.full_name || '').trim() || null;
  if (!/^\d{9,15}$/.test(phoneNumber)) throw new AppError('phone_number must contain 9 to 15 digits', 400);
  const user = await prisma.user.upsert({
    where: { phoneNumber },
    update: { fullName, preferredChannel: 'APP' },
    create: { phoneNumber, fullName, preferredChannel: 'APP', role: 'CUSTOMER' }
  });
  response.status(200).json({ id: user.id, phone_number: user.phoneNumber, full_name: user.fullName });
}
