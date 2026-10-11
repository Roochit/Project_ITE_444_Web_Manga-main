import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { COOKIE_NAME, verifyToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const path = typeof body?.path === 'string' && body.path ? body.path.slice(0, 255) : '/';
    const referrer = typeof body?.referrer === 'string' && body.referrer ? body.referrer.slice(0, 500) : null;

    // ข้ามพาธระบบและ API
    if (path.startsWith('/api') || path.startsWith('/_next')) {
      return NextResponse.json({ success: true, skipped: true });
    }

    // ดึงข้อมูล IP Address จาก headers
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : (realIp || '127.0.0.1');

    // ดึงข้อมูล User-Agent
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    // ตรวจสอบว่ามีผู้ใช้ล็อกอินอยู่หรือไม่
    let userId = null;
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (token) {
      const decoded = verifyToken(token);
      if (decoded && decoded.id) {
        userId = Number(decoded.id);
      }
    }

    // บันทึก Log การเข้าชมเว็บไซต์
    await prisma.visit_logs.create({
      data: {
        ip_address: ip,
        user_agent: userAgent,
        path: path,
        referrer: referrer,
        user_id: userId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging visit:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
