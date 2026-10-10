import prisma from "@/lib/prisma";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import NavbarAdmin from "@/components/NavbarAdmin";
import BootstrapClient from "@/components/BootstrapClient";
import SweetAlertDel from "@/components/SweetAlertDel";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export default async function ManageChaptersPage({ params }) {
  // รองรับ Next.js 15 (await params)
  const resolvedParams = await params;
  const mangaId = Number(resolvedParams.id);

  if (isNaN(mangaId)) {
    notFound();
  }

  const manga = await prisma.mangas.findUnique({
    where: { id: mangaId },
    include: {
      chapters: {
        orderBy: { chapter_number: "asc" },
        include: {
          _count: { select: { pages: true } },
        },
      },
    },
  });

  if (!manga) notFound();

  // Server Action สำหรับลบ Chapter
  async function deleteChapterAction(formData) {
    "use server";
    const chapterId = Number(formData.get("chapter_id"));

    try {
      const pages = await prisma.chapter_pages.findMany({
        where: { chapter_id: chapterId },
      });

      for (const page of pages) {
        if (page.image_url.startsWith("/uploads/")) {
          const filePath = path.join(process.cwd(), "public", page.image_url);
          await fs.unlink(filePath).catch(() => {});
        }
      }

      await prisma.chapters.delete({
        where: { id: chapterId },
      });

      // แก้ไขเป็น /chapter (ไม่มี s)
      revalidatePath(`/admin/mangas/${mangaId}/chapter`);
    } catch (error) {
      console.error("Error deleting chapter:", error);
    }
  }

  return (
    <>
      <NavbarAdmin />
      <BootstrapClient />

      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2>จัดการตอน: <span className="text-primary">{manga.title}</span></h2>
            <p className="text-muted mb-0">รายการตอนทั้งหมด ({manga.chapters.length} ตอน)</p>
          </div>
          <div className="d-flex gap-2">
            <Link href="/admin/mangas" className="btn btn-outline-secondary">
              ← ย้อนกลับ
            </Link>
            <Link
              href={`/admin/mangas/${mangaId}/chapter/add`}
              className="btn btn-primary fw-bold"
            >
              + เพิ่มตอนใหม่
            </Link>
          </div>
        </div>

        <div className="card shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th width="10%" className="text-center">ตอนที่</th>
                  <th>ชื่อตอน</th>
                  <th width="15%" className="text-center">จำนวนหน้า</th>
                  <th width="15%" className="text-center">วันที่เพิ่ม</th>
                  <th width="20%" className="text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {manga.chapters.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-muted">
                      ยังไม่มีตอนในมังงะเรื่องนี้
                    </td>
                  </tr>
                ) : (
                  manga.chapters.map((chapter) => (
                    <tr key={chapter.id}>
                      <td className="text-center fw-bold">
                        ตอนที่ {chapter.chapter_number}
                      </td>
                      <td>{chapter.title || "-"}</td>
                      <td className="text-center">
                        <span className="badge bg-secondary">
                          {chapter._count.pages} หน้า
                        </span>
                      </td>
                      <td className="text-center text-muted fs-7" suppressHydrationWarning>
                        {chapter.created_at
                          ? new Date(chapter.created_at).toLocaleDateString("th-TH", {
                              timeZone: "Asia/Bangkok",
                            })
                          : "-"}
                      </td>
                      <td className="text-center">
                        <div className="d-flex justify-content-center gap-2">
                          <Link
                            href={`/manga/${mangaId}/chapter/${chapter.id}`}
                            target="_blank"
                            className="btn btn-sm btn-outline-info"
                          >
                            👁️ ดูหน้าเว็บ
                          </Link>
                          {/* แก้ไขเป็น /chapter/ (ไม่มี s) */}
                          <Link
                            href={`/admin/mangas/${mangaId}/chapter/${chapter.id}/edit`}
                            className="btn btn-sm btn-warning"
                          >
                            Edit
                          </Link>
                          <form action={deleteChapterAction}>
                            <input type="hidden" name="chapter_id" value={chapter.id} />
                            <SweetAlertDel />
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}