"use server";

import prisma from "@/lib/prisma";
import { hashPassword, signToken, setAuthCookie } from "@/lib/auth";

export async function registerAction(formData) {
  try {
    const name = (formData.get("name") || "").toString().trim();
    const email = (formData.get("email") || "").toString().trim().toLowerCase();
    const password = (formData.get("password") || "").toString().trim();
    const confirmPassword = (formData.get("confirmPassword") || "").toString().trim();

    // 1. ตรวจสอบข้อมูลที่จำเป็น
    if (!name || !email || !password || !confirmPassword) {
      return {
        success: false,
        error: "กรุณากรอกข้อมูลให้ครบถ้วนทุกช่อง",
      };
    }

    if (name.length < 2) {
      return {
        success: false,
        error: "ชื่อผู้ใช้ต้องมีความยาวอย่างน้อย 2 ตัวอักษร",
      };
    }

    // 2. ตรวจสอบรูปแบบอีเมล
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        success: false,
        error: "รูปแบบอีเมลไม่ถูกต้อง",
      };
    }

    // 3. ตรวจสอบความยาวรหัสผ่าน
    if (password.length < 6) {
      return {
        success: false,
        error: "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร",
      };
    }

    // 4. ตรวจสอบการยืนยันรหัสผ่าน
    if (password !== confirmPassword) {
      return {
        success: false,
        error: "รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน",
      };
    }

    // 5. ตรวจสอบว่ามีอีเมลนี้ในระบบแล้วหรือไม่
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        success: false,
        error: "อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น หรือเข้าสู่ระบบ",
      };
    }

    // 6. แฮชรหัสผ่านอย่างปลอดภัย
    const hashedPassword = await hashPassword(password);

    // 7. บันทึกสมาชิกลงฐานข้อมูล (Role เริ่มต้นคือ member)
    const newUser = await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "member",
      },
    });

    // 8. เข้าสู่ระบบอัตโนมัติทันที
    const token = signToken({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    });

    await setAuthCookie(token);

    return {
      success: true,
      message: "สมัครสมาชิกสำเร็จ ยินดีต้อนรับเข้าสู่ระบบ!",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      redirectUrl: "/",
    };
  } catch (error) {
    console.error("Register action error:", error);
    return {
      success: false,
      error: "เกิดข้อผิดพลาดในการสมัครสมาชิก (" + (error.message || "Database Error") + ")",
    };
  }
}
