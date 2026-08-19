import { createRequire } from 'node:module';
import { prisma } from '../config/db.js';
import { env } from '../config/env.js';
import { AppError } from '../middleware/errorHandler.js';

const require = createRequire(import.meta.url);

function getPaynow() {
  if (!env.paynowIntegrationId || !env.paynowIntegrationKey) {
    throw new AppError('Paynow is not configured', 503);
  }
  const { Paynow } = require('paynow');
  const paynow = new Paynow(env.paynowIntegrationId, env.paynowIntegrationKey);
  paynow.resultUrl = env.paynowResultUrl;
  paynow.returnUrl = env.paynowReturnUrl;
  return paynow;
}

export async function initiatePayment({ orderId, method, phone }) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) throw new AppError('Order not found', 404);
  if (!['VISA', 'MASTERCARD', 'ECOCASH', 'ONEMONEY'].includes(method)) {
    throw new AppError('Supported payment methods are VISA, MASTERCARD, ECOCASH, and ONEMONEY', 400);
  }
  if (['ECOCASH', 'ONEMONEY'].includes(method) && !phone) {
    throw new AppError('A phone number is required for mobile money payments', 400);
  }

  const paynow = getPaynow();
  const payment = paynow.createPayment(`MrChow-${order.id}`);
  payment.add('Mr Chow order', Number(order.totalAmountUsd));
  const result = ['ECOCASH', 'ONEMONEY'].includes(method)
    ? await paynow.sendMobile(payment, phone, method.toLowerCase())
    : await paynow.send(payment);

  if (!result.success) throw new AppError(result.error || 'Payment could not be initiated', 502);

  const savedPayment = await prisma.payment.upsert({
    where: { orderId },
    update: {
      method,
      status: 'INITIATED',
      providerReference: result.pollUrl,
      checkoutUrl: result.redirectUrl || null
    },
    create: {
      orderId,
      provider: 'PAYNOW',
      method,
      status: 'INITIATED',
      amountUsd: order.totalAmountUsd,
      providerReference: result.pollUrl,
      checkoutUrl: result.redirectUrl || null
    }
  });

  return { payment: savedPayment, instructions: result.instructions || null };
}

export async function applyPaynowResult(reference, status) {
  const payment = await prisma.payment.findUnique({ where: { providerReference: reference } });
  if (!payment) throw new AppError('Payment not found', 404);
  const normalized = status?.toLowerCase() === 'paid' ? 'PAID' : status?.toLowerCase() === 'cancelled' ? 'CANCELLED' : 'FAILED';
  return prisma.payment.update({
    where: { id: payment.id },
    data: { status: normalized, paidAt: normalized === 'PAID' ? new Date() : null }
  });
}