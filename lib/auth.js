import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import prisma from './prisma';

export const JWT_SECRET = process.env.JWT_SECRET || 'manga_app_secret_jwt_key_ite444_2026';
export const COOKIE_NAME = 'auth_token';

/**
 * แฮชรหัสผ่านด้วย bcrypt
 */
export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

/**
 * ตรวจสอบรหัสผ่านตรงกับค่าแฮชหรือไม่
 */
export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

/**
 * สร้าง JWT Token อายุ 7 วัน
 */
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * ถอดรหัสและตรวจสอบ JWT Token
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * ถอด Payload ของ Token โดยไม่ผูกกับ Node crypto (ปลอดภัยสำหรับทุก Runtime)
 */
export function decodeTokenPayload(token) {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonStr = Buffer.from(base64, 'base64').toString('utf8');
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

/**
 * บันทึก auth cookie
 */
export async function setAuthCookie(token) {
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 วัน
  });
}

/**
 * ลบ auth cookie เพื่อออกจากระบบ
 */
export async function removeAuthCookie() {
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

/**
 * ดึงข้อมูลผู้ใช้ปัจจุบันที่ล็อกอินอยู่จาก Cookie
 */
export async function getCurrentUser() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) return null;

    // ตรวจสอบกับฐานข้อมูลเพื่อความถูกต้องของสิทธิ์ล่าสุด
    const user = await prisma.users.findUnique({
      where: { id: Number(decoded.id) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
      },
    });

    return user || null;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}
