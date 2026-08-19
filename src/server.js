import { env } from './config/env.js';
import { prisma } from './config/db.js';
import app from './app.js';

const server = app.listen(env.port, () => {
  console.log(`Mr Chow API listening on port ${env.port}`);
});

async function shutdown(signal) {
  console.log(`${signal} received, shutting down`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
