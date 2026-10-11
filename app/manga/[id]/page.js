import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import BootstrapClient from "@/components/BootstrapClient";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function MangaDetailPage({ params }) {
  const resolvedParams = await params;
  const mangaId = Number(resolvedParams.id);

  if (isNaN(mangaId)) {
    notFound();
  }

  const currentUser = await getCurrentUser();

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

  const isLocked = manga.is_member_only && !currentUser;


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
                <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                  <h2 className="fw-bold mb-0">{manga.title}</h2>
                  {manga.is_member_only && (
                    <span className="badge bg-warning text-dark fw-bold px-2 py-1">
                      ⭐ เฉพาะสมาชิก (VIP Only)
                    </span>
                  )}
                </div>
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

                {isLocked && (
                  <div className="alert alert-warning border-warning shadow-sm my-3 p-3 rounded-3">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span className="fs-5">🔒</span>
                      <strong className="text-dark">มังงะเรื่องนี้เปิดให้อ่านเฉพาะสมาชิกเท่านั้น</strong>
                    </div>
                    <p className="small text-muted mb-2">
                      กรุณาเข้าสู่ระบบ หรือสมัครสมาชิกเพื่อปลดล็อคการอ่านตอนทั้งหมด
                    </p>
                    <div className="d-flex gap-2 flex-wrap">
                      <Link
                        href={`/login?redirect=/manga/${mangaId}`}
                        className="btn btn-primary btn-sm fw-bold"
                      >
                        🔑 เข้าสู่ระบบทันที
                      </Link>
                      <Link
                        href="/register"
                        className="btn btn-outline-secondary btn-sm"
                      >
                        📝 สมัครสมาชิก
                      </Link>
                    </div>
                  </div>
                )}

                <h5 className="fw-bold">เรื่องย่อ</h5>
                <p className="text-secondary">{manga.description || "ไม่มีข้อมูลเรื่องย่อ"}</p>
              </div>
              <div className="d-flex gap-2">
                <Link href="/" className="btn btn-outline-secondary btn-sm">
                  ← กลับหน้าหลัก
                </Link>
                {manga.is_member_only && (
                  <Link href="/members" className="btn btn-outline-warning text-dark btn-sm fw-bold">
                    ⭐ มังงะเฉพาะสมาชิก
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* รายการตอนทั้งหมด */}
        <div className="card shadow-sm">
          <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
            <h4 className="mb-0 fw-bold">รายการตอนทั้งหมด ({manga.chapters.length} ตอน)</h4>
            {isLocked && (
              <span className="badge bg-danger">
                🔒 ล็อคเนื้อหา (จำเป็นต้องเข้าสู่ระบบ)
              </span>
            )}
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
                  href={
                    isLocked
                      ? `/login?redirect=/manga/${mangaId}/chapter/${chapter.id}&error=member_required`
                      : `/manga/${mangaId}/chapter/${chapter.id}`
                  }
                  className="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-3"
                >
                  <div className="d-flex align-items-center gap-2">
                    {isLocked ? (
                      <span className="text-danger">🔒</span>
                    ) : (
                      <span className="text-primary">📖</span>
                    )}
                    <span className="fw-bold me-2">ตอนที่ {chapter.chapter_number}</span>
                    <span className="text-secondary">{chapter.title || ""}</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    {isLocked ? (
                      <span className="badge bg-warning text-dark small">
                        เข้าสู่ระบบเพื่ออ่าน
                      </span>
                    ) : null}
                    <small className="text-muted" suppressHydrationWarning>
                      {chapter.created_at
                        ? new Date(chapter.created_at).toLocaleDateString("th-TH", {
                            timeZone: "Asia/Bangkok",
                          })
                        : ""}
                    </small>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}