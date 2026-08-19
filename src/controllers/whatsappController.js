import { prisma } from '../config/db.js';
import { env } from '../config/env.js';
import { sendInteractiveButtons, sendListMessage, sendTextMessage } from '../services/whatsappService.js';

function firstMessage(payload) {
  return payload.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
}

function contactName(payload, phoneNumber) {
  const contact = payload.entry?.[0]?.changes?.[0]?.value?.contacts?.find(
    (item) => item.wa_id === phoneNumber
  );
  return contact?.profile?.name;
}

async function safeSend(action, ...args) {
  try {
    return await action(...args);
  } catch (error) {
    console.error('WhatsApp response failed:', error.message);
    return null;
  }
}

export function verifyWebhook(request, response) {
  const mode = request.query['hub.mode'];
  const token = request.query['hub.verify_token'];
  const challenge = request.query['hub.challenge'];

  if (mode === 'subscribe' && token === env.whatsappVerifyToken) {
    return response.status(200).send(challenge);
  }

  return response.sendStatus(403);
}

export async function receiveWebhook(request, response) {
  const message = firstMessage(request.body);
  if (!message?.from) {
    return response.sendStatus(200);
  }

  const phoneNumber = message.from;
  const user = await prisma.user.upsert({
    where: { phoneNumber },
    update: { fullName: contactName(request.body, phoneNumber), preferredChannel: 'WHATSAPP' },
    create: {
      phoneNumber,
      fullName: contactName(request.body, phoneNumber),
      preferredChannel: 'WHATSAPP'
    }
  });

  if (message.type === 'location') {
    await safeSend(
      sendTextMessage,
      phoneNumber,
      `Location received: ${message.location.latitude}, ${message.location.longitude}.`
    );
  } else if (message.type === 'text') {
    const text = message.text.body.trim().toLowerCase();
    if (text === 'hi' || text === 'hello' || text === 'menu') {
      const merchants = await prisma.merchant.findMany({
        where: { city: 'Masvingo', isActive: true },
        orderBy: { name: 'asc' },
        take: 10
      });
      const rows = merchants.map((merchant) => ({
        id: `merchant_${merchant.id}`,
        title: merchant.name,
        description: merchant.address || 'View menu'
      }));
      if (rows.length > 0) {
        await safeSend(sendListMessage, phoneNumber, 'Mr Chow', 'Choose a merchant', [
          { title: 'Masvingo merchants', rows }
        ]);
      } else {
        await safeSend(sendTextMessage, phoneNumber, 'No active merchants are available right now.');
      }
    } else {
      await safeSend(sendInteractiveButtons, phoneNumber, 'How can we help?', [
        { id: 'menu', title: 'View menu' },
        { id: `order_status_${user.id}`, title: 'Order status' }
      ]);
    }
  } else if (message.type === 'interactive') {
    const reply = message.interactive.button_reply || message.interactive.list_reply;
    if (reply?.id === 'menu') {
      await safeSend(sendTextMessage, phoneNumber, 'Please send “Menu” to see available merchants.');
    } else if (reply?.id?.startsWith('order_status_')) {
      const latestOrder = await prisma.order.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      });
      await safeSend(
        sendTextMessage,
        phoneNumber,
        latestOrder ? `Your latest order is ${latestOrder.status}.` : 'You do not have any orders yet.'
      );
    }
  }

  return response.sendStatus(200);
}
