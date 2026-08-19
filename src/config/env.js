import 'dotenv/config';

const required = ['DATABASE_URL'];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  port: Number(process.env.PORT || 3000),
  databaseUrl: process.env.DATABASE_URL,
  whatsappVerifyToken: process.env.WHATSAPP_VERIFY_TOKEN || '',
  whatsappToken: process.env.WHATSAPP_TOKEN || '',
  whatsappPhoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
  paynowIntegrationId: process.env.PAYNOW_INTEGRATION_ID || '',
  paynowIntegrationKey: process.env.PAYNOW_INTEGRATION_KEY || '',
  paynowResultUrl: process.env.PAYNOW_RESULT_URL || '',
  paynowReturnUrl: process.env.PAYNOW_RETURN_URL || '',
  adminApiKey: process.env.ADMIN_API_KEY || ''
};
