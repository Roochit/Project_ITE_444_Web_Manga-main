"use server";

import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * เปลี่ยนแปลงสิทธิ์ของผู้ใช้ (admin <-> member)
 */
export async function toggleUserRoleAction(userId) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "admin") {
      return { success: false, error: "ไม่มีสิทธิ์ดำเนินการนี้" };
    }

    const targetUser = await prisma.users.findUnique({
      where: { id: Number(userId) },
    });

    if (!targetUser) {
      return { success: false, error: "ไม่พบผู้ใช้ที่ระบุ" };
    }

    // ป้องกันไม่ให้เปลี่ยนสิทธิ์ตัวเอง
    if (targetUser.id === currentUser.id) {
      return { success: false, error: "ไม่สามารถเปลี่ยนสิทธิ์ของตนเองได้" };
    }

    const newRole = targetUser.role === "admin" ? "member" : "admin";

    await prisma.users.update({
      where: { id: Number(userId) },
      data: { role: newRole },
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin");

    return {
      success: true,
      message: `เปลี่ยนสิทธิ์ของ ${targetUser.name} เป็น ${newRole} สำเร็จ`,
    };
  } catch (error) {
    console.error("Toggle user role error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * ลบผู้ใช้
 */
export async function deleteUserAction(userId) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "admin") {
      return { success: false, error: "ไม่มีสิทธิ์ดำเนินการนี้" };
    }

    const targetUser = await prisma.users.findUnique({
      where: { id: Number(userId) },
    });

    if (!targetUser) {
      return { success: false, error: "ไม่พบผู้ใช้ที่ระบุ" };
    }

    // ป้องกันไม่ให้ลบตัวเอง
    if (targetUser.id === currentUser.id) {
      return { success: false, error: "ไม่สามารถลบบัญชีของตนเองได้" };
    }

    await prisma.users.delete({
      where: { id: Number(userId) },
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin");

    return {
      success: true,
      message: `ลบผู้ใช้ ${targetUser.name} สำเร็จ`,
    };
  } catch (error) {
    console.error("Delete user error:", error);
    return { success: false, error: error.message };
  }
}
