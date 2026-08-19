import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const merchants = [
  { name: 'Mavambo Kitchen', address: 'Robert Mugabe Way', products: [['Chicken and sadza', 'A Masvingo comfort classic', 6.5], ['Beef stew bowl', 'Slow-cooked with seasonal vegetables', 7.25]] },
  { name: 'Great Zimbabwe Grocers', address: 'Hughes Street', products: [['Family grocery basket', 'Everyday essentials delivered', 18], ['Fresh fruit box', 'Market-picked fruit for the week', 9.5]] },
  { name: 'Sunrise Bakery', address: 'Cecil Avenue', products: [['Morning bun box', 'Six fresh buns for the table', 4], ['Chai and cake', 'A sweet afternoon pairing', 5.5]] }
];

async function main() {
  await prisma.user.upsert({ where: { phoneNumber: '263770000000' }, update: { fullName: 'Demo Customer', role: 'CUSTOMER' }, create: { phoneNumber: '263770000000', fullName: 'Demo Customer', role: 'CUSTOMER', preferredChannel: 'APP' } });
  await prisma.user.upsert({ where: { phoneNumber: '263771111111' }, update: { fullName: 'Mr Chow Admin', role: 'ADMIN' }, create: { phoneNumber: '263771111111', fullName: 'Mr Chow Admin', role: 'ADMIN', preferredChannel: 'APP' } });
  await prisma.user.upsert({ where: { phoneNumber: '263772222222' }, update: { fullName: 'Demo Driver', role: 'DRIVER' }, create: { phoneNumber: '263772222222', fullName: 'Demo Driver', role: 'DRIVER', preferredChannel: 'APP' } });

  for (const merchantInput of merchants) {
    const merchant = await prisma.merchant.upsert({ where: { id: merchantInput.name === 'Mavambo Kitchen' ? '00000000-0000-4000-8000-000000000001' : merchantInput.name === 'Great Zimbabwe Grocers' ? '00000000-0000-4000-8000-000000000002' : '00000000-0000-4000-8000-000000000003' }, update: { name: merchantInput.name, address: merchantInput.address, city: 'Masvingo', isActive: true }, create: { id: merchantInput.name === 'Mavambo Kitchen' ? '00000000-0000-4000-8000-000000000001' : merchantInput.name === 'Great Zimbabwe Grocers' ? '00000000-0000-4000-8000-000000000002' : '00000000-0000-4000-8000-000000000003', name: merchantInput.name, address: merchantInput.address, city: 'Masvingo', isActive: true } });
    for (const [title, description, priceUsd] of merchantInput.products) {
      await prisma.product.upsert({ where: { merchantId_title: { merchantId: merchant.id, title } }, update: { description, priceUsd, inStock: true }, create: { merchantId: merchant.id, title, description, priceUsd, inStock: true } });
    }
  }
  console.log('Mr Chow seed data is ready.');
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
