"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { existsSync, mkdirSync } from "fs";
import fs from "fs/promises";
import path from "path";

export async function createManga(prevState, formData) {
  const title = formData.get("title")?.trim() || "";
  const author = formData.get("author")?.trim() || "";
  const description = formData.get("description")?.trim() || "";
  const status = formData.get("status") || "ongoing";
  const coverFile = formData.get("cover_image");

  const errors = [];

  // 1. ตรวจชื่อเรื่องมังงะ
  if (!title || title.length < 2) {
    errors.push("ชื่อเรื่องต้องมีอย่างน้อย 2 ตัวอักษร");
  }

  // 2. ตรวจไฟล์รูปปก
  if (!coverFile || typeof coverFile === "string" || coverFile.size === 0) {
    errors.push("กรุณาเลือกไฟล์รูปภาพหน้าปก");
  }

  // 3. ตรวจเรื่องย่อ
  if (!description || description.length < 5) {
    errors.push("เรื่องย่อต้องมีอย่างน้อย 5 ตัวอักษร");
  }

  // หากมี Error ให้ส่งข้อผิดพลาดและค่าที่เคยกรอกกลับไปที่ Client
  if (errors.length > 0) {
    return {
      errors,
      values: {
        title,
        author,
        description,
        status,
      },
    };
  }

  try {
    // จัดเก็บไฟล์รูปภาพหน้าปกลงเครื่อง
    const uploadDir = path.join(process.cwd(), "public", "uploads", "covers");
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    const bytes = await coverFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const cleanFileName = coverFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueName = `${Date.now()}_${cleanFileName}`;
    const filePath = path.join(uploadDir, uniqueName);

    await fs.writeFile(filePath, buffer);
    const coverUrl = `/uploads/covers/${uniqueName}`;

    // บันทึกข้อมูลลงฐานข้อมูลด้วย Prisma ORM
    await prisma.mangas.create({
      data: {
        title,
        author,
        cover_url: coverUrl,
        description,
        status,
      },
    });
  } catch (error) {
    console.error("Error creating manga:", error);
    return {
      errors: ["เกิดข้อผิดพลาดไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง"],
      values: {
        title,
        author,
        description,
        status,
      },
    };
  }

  // อัปเดต Cache ของหน้าแอดมิน แล้ว Redirect กลับไป
  revalidatePath("/admin/mangas");
  redirect("/admin/mangas?success=create");
}