import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ReadChapterPage({ params }) {
  const resolvedParams = await params;
  const mangaId = Number(resolvedParams.id);
  const chapterId = Number(resolvedParams.chapterId);

  if (isNaN(mangaId) || isNaN(chapterId)) {
    notFound();
  }

  // ดึงข้อมูลตอนปัจจุบันพร้อมรูปภาพ
  const chapter = await prisma.chapters.findUnique({
    where: { id: chapterId },
    include: {
      pages: {
        orderBy: { page_number: "asc" },
      },
    },
  });

  if (!chapter) notFound();

  // ดึงรายการตอนทั้งหมดของมังงะเรื่องนี้ เรียงตามเลขตอน
  const allChapters = await prisma.chapters.findMany({
    where: { manga_id: mangaId },
    orderBy: { chapter_number: "asc" },
    select: { id: true, chapter_number: true },
  });

  // ค้นหาตำแหน่ง Index ของตอนปัจจุบัน
  const currentIndex = allChapters.findIndex((ch) => ch.id === chapterId);

  // หาตอนก่อนหน้าและตอนถัดไป
  const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;

  return (
    <div className="bg-dark text-white min-vh-100 py-4">
      <div className="container">
        {/* แถบเมนูด้านบน */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2 border-bottom border-secondary pb-3">
          <Link href={`/manga/${mangaId}`} className="btn btn-outline-light btn-sm">
            ← หน้ารายละเอียด
          </Link>

          <div className="text-center">
            <h4 className="mb-0 fw-bold">
              ตอนที่ {chapter.chapter_number} {chapter.title ? `- ${chapter.title}` : ""}
            </h4>
            <small className="text-muted">({chapter.pages?.length || 0} หน้า)</small>
          </div>

          {/* ปุ่มย้ายตอน ด้านบน */}
          <div className="d-flex gap-2">
            {prevChapter ? (
              <Link href={`/manga/${mangaId}/chapter/${prevChapter.id}`} className="btn btn-secondary btn-sm">
                ◄ ตอนก่อนหน้า
              </Link>
            ) : (
              <button className="btn btn-secondary btn-sm" disabled>
                ◄ ตอนก่อนหน้า
              </button>
            )}

            {nextChapter ? (
              <Link href={`/manga/${mangaId}/chapter/${nextChapter.id}`} className="btn btn-primary btn-sm">
                ตอนต่อไป ►
              </Link>
            ) : (
              <button className="btn btn-primary btn-sm" disabled>
                ตอนต่อไป ►
              </button>
            )}
          </div>
        </div>

        {/* รายการรูปภาพอ่านมังงะ */}
        <div className="d-flex flex-column align-items-center gap-2">
          {!chapter.pages || chapter.pages.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <h4>ยังไม่มีรูปภาพในตอนนี้</h4>
            </div>
          ) : (
            chapter.pages.map((page) => (
              <img
                key={page.id}
                src={page.image_url}
                alt={`หน้า ${page.page_number}`}
                className="img-fluid rounded shadow"
                style={{ maxWidth: "800px", width: "100%", height: "auto" }}
              />
            ))
          )}
        </div>

        {/* ปุ่มย้ายตอน + ปุ่มย้อนกลับ ด้านล่าง */}
        <div className="d-flex justify-content-center align-items-center gap-3 mt-5 pt-3 border-top border-secondary flex-wrap">
          {prevChapter ? (
            <Link href={`/manga/${mangaId}/chapter/${prevChapter.id}`} className="btn btn-outline-light">
              ◄ ตอนก่อนหน้า
            </Link>
          ) : (
            <button className="btn btn-outline-secondary" disabled>
              ◄ ตอนก่อนหน้า
            </button>
          )}

          <Link href={`/manga/${mangaId}`} className="btn btn-secondary">
            รายการตอนทั้งหมด
          </Link>

          {nextChapter ? (
            <Link href={`/manga/${mangaId}/chapter/${nextChapter.id}`} className="btn btn-primary">
              ตอนต่อไป ►
            </Link>
          ) : (
            <button className="btn btn-primary" disabled>
              ตอนต่อไป ►
            </button>
          )}
        </div>
      </div>
    </div>
  );
}