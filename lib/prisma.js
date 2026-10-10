import { PrismaClient } from '@prisma/client';

// ตรวจสอบและกำหนดค่า DATABASE_URL เริ่มต้นอัตโนมัติหากยังไม่มี (ป้องกันข้อผิดพลาดเมื่อรันด้วย XAMPP)
if (!process.env.DATABASE_URL) {
  const user = process.env.DATABASE_USER || 'root';
  const pass = process.env.DATABASE_PASSWORD ? `:${process.env.DATABASE_PASSWORD}` : '';
  const host = process.env.DATABASE_HOST || '127.0.0.1';
  const db = process.env.DATABASE_NAME || 'manga_db';
  process.env.DATABASE_URL = `mysql://${user}${pass}@${host}:3306/${db}`;
}

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;