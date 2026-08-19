import { applyPaynowResult, initiatePayment } from '../services/paymentService.js';

export async function createPayment(request, response) {
  const result = await initiatePayment({ orderId: request.params.orderId, ...request.body });
  response.status(201).json(result);
}

export async function paynowResult(request, response) {
  const reference = request.body.reference || request.body.merchantReference;
  const status = request.body.status;
  await applyPaynowResult(reference, status);
  response.sendStatus(200);
}