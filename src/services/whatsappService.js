import axios from 'axios';
import { env } from '../config/env.js';

const graphApiUrl = `https://graph.facebook.com/v18.0/${env.whatsappPhoneNumberId}/messages`;

async function sendMessage(payload) {
  if (!env.whatsappToken || !env.whatsappPhoneNumberId) {
    throw new Error('WhatsApp API credentials are not configured');
  }

  const { data } = await axios.post(graphApiUrl, payload, {
    headers: {
      Authorization: `Bearer ${env.whatsappToken}`,
      'Content-Type': 'application/json'
    }
  });

  return data;
}

export function sendTextMessage(to, text) {
  return sendMessage({ messaging_product: 'whatsapp', to, type: 'text', text: { body: text } });
}

export function sendInteractiveButtons(to, text, buttonsArray) {
  const buttons = buttonsArray.map((button, index) => ({
    type: 'reply',
    reply: {
      id: button.id || `button_${index + 1}`,
      title: button.title || button.text
    }
  }));

  return sendMessage({
    messaging_product: 'whatsapp',
    to,
    type: 'interactive',
    interactive: { type: 'button', body: { text }, action: { buttons } }
  });
}

export function sendListMessage(to, header, title, sections) {
  return sendMessage({
    messaging_product: 'whatsapp',
    to,
    type: 'interactive',
    interactive: {
      type: 'list',
      header: { type: 'text', text: header },
      body: { text: title },
      action: { button: 'View options', sections }
    }
  });
}
