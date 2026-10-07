"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { existsSync, mkdirSync } from "fs";
import fs from "fs/promises";
import path from "path";

export async function updateManga(prevState, formData) {
  const id = Number(formData.get("id"));
  const title = formData.get("title")?.trim() || "";
  const author = formData.get("author")?.trim() || "";
  const description = formData.get("description")?.trim() || "";
  const status = formData.get("status") || "ongoing";
  const coverFile = formData.get("cover_image");
  const existingCoverUrl = formData.get("existing_cover_url")?.trim() || "";

  const errors = [];

  // 1. ตรวจ ID มังงะ
  if (!id || Number.isNaN(id)) {
    errors.push("ไม่พบ ID มังงะที่ต้องการแก้ไข");
  }

  // 2. ตรวจชื่อเรื่อง
  if (!title || title.length < 2) {
    errors.push("ชื่อเรื่องต้องมีอย่างน้อย 2 ตัวอักษร");
  }

  // 3. ตรวจเรื่องย่อ
  if (!description || description.length < 5) {
    errors.push("เรื่องย่อต้องมีอย่างน้อย 5 ตัวอักษร");
  }

  // หากมี Error ให้ส่งข้อผิดพลาดและค่าเดิมกลับไปแสดงบนฟอร์ม
  if (errors.length > 0) {
    return {
      errors,
      values: {
        id,
        title,
        author,
        cover_url: existingCoverUrl,
        description,
        status,
      },
    };
  }

  let finalCoverUrl = existingCoverUrl;

  try {
    // ถ้ามีการอัปโหลดรูปหน้าปกใหม่
    if (coverFile && typeof coverFile !== "string" && coverFile.size > 0) {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "covers");
      if (!existsSync(uploadDir)) {
        mkdirSync(uploadDir, { recursive: true });
      }

      // ถ้าไฟล์เก่าถูกเซฟใน /uploads/covers/ ให้ลบไฟล์เก่าทิ้ง
      if (existingCoverUrl && existingCoverUrl.startsWith("/uploads/covers/")) {
        const oldFilePath = path.join(process.cwd(), "public", existingCoverUrl);
        await fs.unlink(oldFilePath).catch(() => {});
      }

      const bytes = await coverFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const cleanFileName = coverFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const uniqueName = `${Date.now()}_${cleanFileName}`;
      const filePath = path.join(uploadDir, uniqueName);

      await fs.writeFile(filePath, buffer);
      finalCoverUrl = `/uploads/covers/${uniqueName}`;
    }

    // ทำการ Update ข้อมูลผ่าน Prisma ORM
    await prisma.mangas.update({
      where: { id },
      data: {
        title,
        author,
        cover_url: finalCoverUrl,
        description,
        status,
      },
    });
  } catch (error) {
    console.error("Error updating manga:", error);
    return {
      errors: ["ไม่สามารถอัปเดตข้อมูลได้ กรุณาลองใหม่อีกครั้ง"],
      values: {
        id,
        title,
        author,
        cover_url: existingCoverUrl,
        description,
        status,
      },
    };
  }

  // เคลียร์ Cache เพื่อให้หน้ารายการดึงข้อมูลใหม่ และ Redirect กลับหน้าแอดมิน
  revalidatePath("/admin/mangas");
  revalidatePath(`/manga/${id}`);
  redirect("/admin/mangas?success=update");
}