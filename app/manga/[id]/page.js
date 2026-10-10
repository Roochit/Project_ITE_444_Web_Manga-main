import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import BootstrapClient from "@/components/BootstrapClient";

export const dynamic = "force-dynamic";

export default async function MangaDetailPage({ params }) {
  const resolvedParams = await params;
  const mangaId = Number(resolvedParams.id);

  if (isNaN(mangaId)) {
    notFound();
  }

  // ดึงข้อมูลมังงะพร้อมรายการตอนทั้งหมด
  const manga = await prisma.mangas.findUnique({
    where: { id: mangaId },
    include: {
      chapters: {
        orderBy: { chapter_number: "asc" },
      },
    },
  });

  if (!manga) notFound();

  return (
    <>
      <Navbar />
      <BootstrapClient />

      <div className="container py-4">
        {/* รายละเอียดมังงะ */}
        <div className="card shadow-sm mb-4">
          <div className="row g-0">
            <div className="col-md-3 text-center p-3 d-flex align-items-center justify-content-center bg-light rounded-start">
              <img
                src={manga.cover_url || "https://via.placeholder.com/300x400?text=No+Cover"}
                alt={manga.title}
                className="img-fluid rounded shadow-sm"
                style={{ maxHeight: "350px", objectFit: "cover", width: "100%" }}
              />
            </div>
            <div className="col-md-9 p-4 d-flex flex-column justify-content-between">
              <div>
                <h2 className="fw-bold">{manga.title}</h2>
                <p className="text-muted">ผู้แต่ง: {manga.author || "ไม่ระบุ"}</p>
                <p className="mb-3">
                  สถานะ:{" "}
                  <span
                    className={`badge ${
                      manga.status === "completed" ? "bg-success" : "bg-warning text-dark"
                    }`}
                  >
                    {manga.status === "completed" ? "จบแล้ว" : "ยังไม่จบ"}
                  </span>
                </p>
                <h5 className="fw-bold">เรื่องย่อ</h5>
                <p className="text-secondary">{manga.description || "ไม่มีข้อมูลเรื่องย่อ"}</p>
              </div>
              <div>
                <Link href="/" className="btn btn-outline-secondary btn-sm">
                  ← กลับหน้าหลัก
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* รายการตอนทั้งหมด */}
        <div className="card shadow-sm">
          <div className="card-header bg-white py-3">
            <h4 className="mb-0 fw-bold">รายการตอนทั้งหมด ({manga.chapters.length} ตอน)</h4>
          </div>
          <div className="list-group list-group-flush">
            {manga.chapters.length === 0 ? (
              <div className="list-group-item text-center py-4 text-muted">
                ยังไม่มีตอนในมังงะเรื่องนี้
              </div>
            ) : (
              manga.chapters.map((chapter) => (
                <Link
                  key={chapter.id}
                  href={`/manga/${mangaId}/chapter/${chapter.id}`}
                  className="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-3"
                >
                  <div>
                    <span className="fw-bold me-2">ตอนที่ {chapter.chapter_number}</span>
                    <span className="text-secondary">{chapter.title || ""}</span>
                  </div>
                  <small className="text-muted" suppressHydrationWarning>
                    {chapter.created_at
                      ? new Date(chapter.created_at).toLocaleDateString("th-TH", {
                          timeZone: "Asia/Bangkok",
                        })
                      : ""}
                  </small>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}