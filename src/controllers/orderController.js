import { createOrder as createOrderService } from '../services/orderService.js';

export async function createOrder(request, response) {
  const order = await createOrderService({ ...request.body, orderSource: 'APP' });
  response.status(201).json(order);
}
