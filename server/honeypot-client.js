// honeypot-client.js - Honeypot Prisma Client (ต่อกับ honeypot.db)
import { PrismaClient } from '.prisma/honeypot-client';

const prismaHoneypot = new PrismaClient({
  datasources: { db: { url: 'file:./prisma/honeypot.db' } }
});

export default prismaHoneypot;
