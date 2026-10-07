"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { existsSync, mkdirSync } from "fs";
import fs from "fs/promises";
import path from "path";

// 1. ฟังก์ชันสำหรับสร้าง Chapter ใหม่ (Create)
export async function createChapterAction(prevState, formData) {
  const mangaId = Number(formData.get("manga_id"));
  const chapterNumber = parseFloat(formData.get("chapter_number"));
  const title = formData.get("title");

  // ดึงไฟล์รูปภาพทั้งหมดที่ถูกเลือกเข้ามา
  const files = formData.getAll("images");

  if (!chapterNumber || !files || files.length === 0 || files[0].size === 0) {
    return { error: "กรุณากรอกเลขตอน และเลือกไฟล์รูปภาพอย่างน้อย 1 ภาพ" };
  }

  try {
    const pageUrls = [];
    const uploadDir = path.join(process.cwd(), "public", "uploads", "chapters");

    // ตรวจสอบและสร้างโฟลเดอร์ public/uploads/chapters ถ้ายังไม่มี
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    // วนลูปเซฟแต่ละไฟล์ลงเครื่อง
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size === 0) continue;

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // ตั้งชื่อไฟล์ใหม่กันซ้ำ: timestamp_ลำดับ_ชื่อไฟล์เดิม
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const uniqueName = `${Date.now()}_${i}_${cleanFileName}`;
      const filePath = path.join(uploadDir, uniqueName);

      // เขียนไฟล์ลงดิสก์
      await fs.writeFile(filePath, buffer);

      // Path สำหรับเรียกแสดงผลบนหน้าเว็บ
      pageUrls.push(`/uploads/chapters/${uniqueName}`);
    }

    if (pageUrls.length === 0) {
      return { error: "ไม่สามารถประมวลผลไฟล์รูปภาพได้" };
    }

    // บันทึกข้อมูลลง Database
    await prisma.chapters.create({
      data: {
        manga_id: mangaId,
        chapter_number: chapterNumber,
        title: title || null,
        pages: {
          create: pageUrls.map((url, index) => ({
            page_number: index + 1,
            image_url: url,
          })),
        },
      },
    });

    await prisma.mangas.update({
      where: { id: mangaId },
      data: { updated_at: new Date() },
    });

    revalidatePath(`/manga/${mangaId}`);
    revalidatePath(`/admin/mangas`);
    revalidatePath(`/admin/mangas/${mangaId}/chapter`);

    return { success: true };
  } catch (error) {
    console.error("Error uploading chapter:", error);
    return { error: "เกิดข้อผิดพลาดในการอัปโหลดไฟล์รูปภาพ" };
  }
}

// 2. ฟังก์ชันสำหรับแก้ไข Chapter (Update)
export async function updateChapterAction(prevState, formData) {
  const chapterId = Number(formData.get("chapter_id"));
  const mangaId = Number(formData.get("manga_id"));
  const chapterNumber = parseFloat(formData.get("chapter_number"));
  const title = formData.get("title");
  const files = formData.getAll("images");
  const uploadMode = formData.get("upload_mode") || "replace"; // 'replace' หรือ 'append'

  if (!chapterId || !chapterNumber) {
    return { error: "กรุณากรอกข้อมูลให้ครบถ้วน" };
  }

  try {
    // อัปเดตข้อมูลพื้นฐานของ Chapter
    await prisma.chapters.update({
      where: { id: chapterId },
      data: {
        chapter_number: chapterNumber,
        title: title || null,
      },
    });

    // ถ้ามีการอัปโหลดไฟล์รูปเข้ามา
    if (files && files.length > 0 && files[0].size > 0) {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "chapters");

      if (!existsSync(uploadDir)) {
        mkdirSync(uploadDir, { recursive: true });
      }

      let startingPageNumber = 1;

      if (uploadMode === "replace") {
        // ดึงรูปภาพเก่าเพื่อลบออกจากเครื่อง
        const oldPages = await prisma.chapter_pages.findMany({
          where: { chapter_id: chapterId },
        });

        for (const page of oldPages) {
          if (page.image_url.startsWith("/uploads/")) {
            const filePath = path.join(process.cwd(), "public", page.image_url);
            await fs.unlink(filePath).catch(() => {});
          }
        }

        // ลบข้อมูลหน้าเก่าใน DB
        await prisma.chapter_pages.deleteMany({
          where: { chapter_id: chapterId },
        });
      } else {
        // โหมด append: หารูปหน้าสุดท้าย
        const lastPage = await prisma.chapter_pages.findFirst({
          where: { chapter_id: chapterId },
          orderBy: { page_number: "desc" },
        });
        startingPageNumber = lastPage ? lastPage.page_number + 1 : 1;
      }

      // เซฟไฟล์รูปภาพชุดใหม่ลงดิสก์
      const pageUrls = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size === 0) continue;

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const uniqueName = `${Date.now()}_${i}_${cleanName}`;
        const filePath = path.join(uploadDir, uniqueName);

        await fs.writeFile(filePath, buffer);
        pageUrls.push(`/uploads/chapters/${uniqueName}`);
      }

      // บันทึกรูปภาพลง DB
      if (pageUrls.length > 0) {
        await prisma.chapter_pages.createMany({
          data: pageUrls.map((url, index) => ({
            chapter_id: chapterId,
            page_number: startingPageNumber + index,
            image_url: url,
          })),
        });
      }
    }

    revalidatePath(`/admin/mangas/${mangaId}/chapter`);
    revalidatePath(`/manga/${mangaId}`);
    revalidatePath(`/manga/${mangaId}/chapter/${chapterId}`);

    return { success: true };
  } catch (error) {
    console.error("Error updating chapter:", error);
    return { error: "เกิดข้อผิดพลาดในการอัปเดตตอน" };
  }
}

// 3. ฟังก์ชันสำหรับลบรูปภาพเฉพาะหน้า (Delete single page)
export async function deletePageAction(pageId, chapterId, mangaId) {
  try {
    const page = await prisma.chapter_pages.findUnique({
      where: { id: pageId },
    });

    if (!page) {
      return { error: "ไม่พบรูปภาพหน้านี้ในระบบ" };
    }

    // ลบไฟล์รูปภาพออกจากดิสก์
    if (page.image_url && page.image_url.startsWith("/uploads/")) {
      const filePath = path.join(process.cwd(), "public", page.image_url);
      await fs.unlink(filePath).catch(() => {});
    }

    // ลบจากฐานข้อมูล
    await prisma.chapter_pages.delete({
      where: { id: pageId },
    });

    // เรียงลำดับเลขหน้าใหม่ให้ต่อเนื่องกัน
    const remainingPages = await prisma.chapter_pages.findMany({
      where: { chapter_id: chapterId },
      orderBy: { page_number: "asc" },
    });

    for (let i = 0; i < remainingPages.length; i++) {
      if (remainingPages[i].page_number !== i + 1) {
        await prisma.chapter_pages.update({
          where: { id: remainingPages[i].id },
          data: { page_number: i + 1 },
        });
      }
    }

    if (mangaId) {
      revalidatePath(`/admin/mangas/${mangaId}/chapter`);
      revalidatePath(`/manga/${mangaId}/chapter/${chapterId}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting chapter page:", error);
    return { error: "เกิดข้อผิดพลาดในการลบรูปภาพ" };
  }
}