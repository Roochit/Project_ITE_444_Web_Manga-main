"use server";

import prisma from "@/lib/prisma";
import { verifyPassword, signToken, setAuthCookie, removeAuthCookie } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function loginAction(formData) {
  try {
    const email = (formData.get("email") || "").toString().trim().toLowerCase();
    const password = (formData.get("password") || "").toString().trim();
    const redirectUrl = (formData.get("redirectUrl") || "").toString().trim();

    if (!email || !password) {
      return {
        success: false,
        error: "กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน",
      };
    }

    // ค้นหาผู้ใช้จากอีเมล
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        success: false,
        error: "ไม่พบบัญชีผู้ใช้นี้ในระบบ หรืออีเมลไม่ถูกต้อง",
      };
    }

    // ตรวจสอบรหัสผ่าน
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return {
        success: false,
        error: "รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง",
      };
    }

    // สร้าง Token
    const token = signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // บันทึก Cookie
    await setAuthCookie(token);

    // กำหนดเส้นทางหลังเข้าสู่ระบบสำเร็จ
    let targetUrl = "/";
    if (user.role === "admin") {
      targetUrl = redirectUrl && redirectUrl.startsWith("/admin") ? redirectUrl : "/admin";
    } else {
      targetUrl = redirectUrl && !redirectUrl.startsWith("/admin") ? redirectUrl : "/";
    }

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      redirectUrl: targetUrl,
    };
  } catch (error) {
    console.error("Login action error:", error);
    return {
      success: false,
      error: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง (" + (error.message || "Database Error") + ")",
    };
  }
}

export async function logoutAction() {
  await removeAuthCookie();
  redirect("/login");
}
