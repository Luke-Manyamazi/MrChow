import { prisma } from '../config/db.js';

export async function listMerchants(request, response) {
  const merchants = await prisma.merchant.findMany({
    where: { city: 'Masvingo', isActive: true },
    orderBy: { name: 'asc' }
  });
  response.json(merchants);
}

export async function listMerchantProducts(request, response) {
  const products = await prisma.product.findMany({
    where: {
      merchantId: request.params.id,
      inStock: true,
      merchant: { isActive: true, city: 'Masvingo' }
    },
    orderBy: { title: 'asc' }
  });
  response.json(products);
}
