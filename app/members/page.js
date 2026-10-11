import Navbar from "@/components/Navbar";
import BootstrapClient from "@/components/BootstrapClient";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function MembersMangaPage({ searchParams }) {
  const currentUser = await getCurrentUser();
  const resolvedSearchParams = await searchParams;
  const q = resolvedSearchParams?.q?.trim() || "";
  const status = resolvedSearchParams?.status || "all";

  // เงื่อนไขค้นหามังงะเฉพาะสมาชิก
  const where = {
    is_member_only: true,
  };

  if (q) {
    where.OR = [
      { title: { contains: q } },
      { author: { contains: q } },
    ];
  }

  if (status && status !== "all") {
    where.status = status;
  }

  // ดึงรายการมังงะเฉพาะสมาชิก
  const memberMangas = await prisma.mangas.findMany({
    where,
    orderBy: { id: "desc" },
    include: {
      _count: {
        select: { chapters: true },
      },
    },
  });

  return (
    <>
      <Navbar />
      <BootstrapClient />

      <main className="container py-4 mb-5">
        {/* แบนเนอร์หัวเรื่องแบบ VIP */}
        <div
          className="p-4 p-md-5 rounded-4 shadow-sm mb-4 text-white position-relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div className="position-relative" style={{ zIndex: 2 }}>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge bg-warning text-dark px-3 py-2 fs-6 fw-bold">
                ⭐ สิทธิพิเศษเฉพาะสมาชิก (VIP Area)
              </span>
              {currentUser && (
                <span className="badge bg-success px-3 py-2 fs-6">
                  เข้าสู่ระบบแล้ว: {currentUser.name}
                </span>
              )}
            </div>

            <h1 className="display-6 fw-bold mb-2">
              💎 มังงะเอ็กซ์คลูซีฟเฉพาะสมาชิก
            </h1>
            <p className="lead mb-0 text-light opacity-90" style={{ maxWidth: "700px" }}>
              รวมมังงะเรื่องพิเศษและมังงะระดับตำนาน เช่น <strong>"นาราไนก้า (Yaranai ka)"</strong> ที่เปิดให้รับชมได้เฉพาะสมาชิกของ MangaApp เท่านั้น
            </p>
          </div>

          <div
            className="position-absolute end-0 top-50 translate-middle-y d-none d-lg-block me-5 opacity-25"
            style={{ fontSize: "120px", userSelect: "none" }}
          >
            ⭐
          </div>
        </div>

        {/* กรณีที่ผู้ใช้ยังไม่ได้เข้าสู่ระบบ: แสดงหน้าต่างแจ้งเตือนล็อคเนื้อหา */}
        {!currentUser ? (
          <div className="card border-0 shadow-lg rounded-4 p-4 p-md-5 text-center mb-5 bg-white">
            <div
              className="mx-auto rounded-circle d-flex align-items-center justify-content-center mb-3"
              style={{
                width: "80px",
                height: "80px",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                color: "#ef4444",
                fontSize: "2.5rem",
              }}
            >
              🔒
            </div>

            <h2 className="h3 fw-bold text-dark mb-2">หน้านี้สงวนสิทธิ์สำหรับสมาชิกเท่านั้น</h2>
            <p className="text-muted mx-auto mb-4" style={{ maxWidth: "560px" }}>
              คุณจำเป็นต้องเข้าสู่ระบบหรือสมัครสมาชิกก่อน จึงจะสามารถเปิดดูและอ่านมังงะในหมวดนี้ได้
              สมัครสมาชิกฟรีวันนี้เพื่อเข้าถึงมังงะนาราไนก้าและเนื้อหาพรีเมียมทั้งหมด!
            </p>

            <div className="d-flex justify-content-center gap-3 flex-wrap">
              <Link
                href="/login?redirect=/members"
                className="btn btn-primary btn-lg px-4 fw-bold shadow-sm d-flex align-items-center gap-2"
              >
                <span>🔑 เข้าสู่ระบบ</span>
              </Link>
              <Link
                href="/register"
                className="btn btn-outline-primary btn-lg px-4 fw-bold d-flex align-items-center gap-2"
              >
                <span>📝 สมัครสมาชิกใหม่</span>
              </Link>
            </div>

            {/* ตัวอย่าง Preview มังงะที่รออยู่ (Teaser Blur) */}
            <div className="mt-5 pt-4 border-top">
              <h5 className="fw-bold text-secondary mb-3">
                👀 ตัวอย่างมังงะพิเศษที่คุณจะได้รับชมเมื่อเข้าสู่ระบบ:
              </h5>
              <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3 justify-content-center">
                {memberMangas.slice(0, 3).map((manga) => (
                  <div className="col" key={manga.id}>
                    <div className="card h-100 border-0 shadow-sm rounded-3 overflow-hidden text-start">
                      <div className="position-relative">
                        <img
                          src={manga.cover_url || "https://via.placeholder.com/300x400?text=No+Cover"}
                          alt={manga.title}
                          className="card-img-top"
                          style={{
                            height: "220px",
                            objectFit: "cover",
                            filter: "blur(4px)",
                          }}
                        />
                        <div className="position-absolute top-50 start-50 translate-middle badge bg-dark bg-opacity-75 fs-6 px-3 py-2">
                          🔒 ล็อคเฉพาะสมาชิก
                        </div>
                      </div>
                      <div className="card-body p-3">
                        <h6 className="fw-bold mb-1 text-truncate">{manga.title}</h6>
                        <small className="text-muted d-block text-truncate">
                          ผู้แต่ง: {manga.author || "ไม่ระบุ"}
                        </small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* กรณีที่เข้าสู่ระบบแล้ว: แสดงรายการมังงะเฉพาะสมาชิกทั้งหมด */
          <>
            {/* กล่องค้นหาและตัวกรอง */}
            <div className="bg-white p-3 p-md-4 rounded-4 shadow-sm mb-4 border">
              <div className="row align-items-center gy-3">
                <div className="col-lg-6">
                  <h4 className="fw-bold mb-1 d-flex align-items-center gap-2">
                    <span className="text-warning">📚</span>
                    <span>รายการมังงะเฉพาะสมาชิก ({memberMangas.length} เรื่อง)</span>
                  </h4>
                  <p className="text-muted mb-0 small">
                    คุณมีสิทธิ์เข้าถึงเนื้อหาพิเศษทั้งหมดในหมวดหมู่นี้
                  </p>
                </div>

                <div className="col-lg-6">
                  <form method="GET" action="/members" className="row g-2">
                    <div className="col-sm-7">
                      <input
                        type="text"
                        name="q"
                        defaultValue={q}
                        className="form-control"
                        placeholder="🔍 ค้นหามังงะเฉพาะสมาชิก..."
                      />
                    </div>
                    <div className="col-sm-3">
                      <select name="status" defaultValue={status} className="form-select">
                        <option value="all">ทุกสถานะ</option>
                        <option value="completed">จบแล้ว</option>
                        <option value="ongoing">ยังไม่จบ</option>
                      </select>
                    </div>
                    <div className="col-sm-2 d-grid">
                      <button type="submit" className="btn btn-primary fw-bold">
                        ค้นหา
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Quick Filter Badges */}
              <div className="d-flex align-items-center gap-2 mt-3 flex-wrap">
                <span className="small text-muted me-1">สถานะ:</span>
                <Link
                  href={q ? `/members?q=${encodeURIComponent(q)}&status=all` : `/members?status=all`}
                  className={`btn btn-sm ${status === "all" ? "btn-dark" : "btn-outline-secondary"}`}
                >
                  ทั้งหมด
                </Link>
                <Link
                  href={q ? `/members?q=${encodeURIComponent(q)}&status=completed` : `/members?status=completed`}
                  className={`btn btn-sm ${status === "completed" ? "btn-success fw-bold" : "btn-outline-success"}`}
                >
                  🟢 จบแล้ว (Completed)
                </Link>
                <Link
                  href={q ? `/members?q=${encodeURIComponent(q)}&status=ongoing` : `/members?status=ongoing`}
                  className={`btn btn-sm ${status === "ongoing" ? "btn-warning text-dark fw-bold" : "btn-outline-warning text-dark"}`}
                >
                  🟡 ยังไม่จบ (Ongoing)
                </Link>
                {(q || status !== "all") && (
                  <Link href="/members" className="btn btn-sm btn-link text-danger ms-auto">
                    ✕ ล้างตัวกรอง
                  </Link>
                )}
              </div>
            </div>

            {/* การ์ดรายการมังงะ Grid */}
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
              {memberMangas.length === 0 ? (
                <div className="col-12 text-center py-5">
                  <div className="p-4 bg-light rounded text-muted">
                    <p className="fs-5 mb-2">ไม่พบมังงะเฉพาะสมาชิกที่ตรงกับเงื่อนไข</p>
                    <Link href="/members" className="btn btn-outline-primary btn-sm">
                      ดูมังงะเฉพาะสมาชิกทั้งหมด
                    </Link>
                  </div>
                </div>
              ) : (
                memberMangas.map((manga) => (
                  <div className="col" key={manga.id}>
                    <div className="card h-100 shadow-sm border-0 rounded-4 overflow-hidden position-relative">
                      {/* แท็กสมาชิก VIP */}
                      <div className="position-relative">
                        <img
                          src={manga.cover_url || "https://via.placeholder.com/300x400?text=No+Cover"}
                          className="card-img-top"
                          alt={manga.title}
                          style={{ height: "300px", objectFit: "cover" }}
                        />
                        <span className="badge bg-warning text-dark position-absolute top-0 start-0 m-2 fw-bold shadow-sm">
                          ⭐ เฉพาะสมาชิก
                        </span>
                        <span
                          className={`badge position-absolute top-0 end-0 m-2 ${
                            manga.status === "completed"
                              ? "bg-success"
                              : "bg-info text-dark"
                          }`}
                        >
                          {manga.status === "completed" ? "จบแล้ว" : "ยังไม่จบ"}
                        </span>
                        <span className="badge bg-dark position-absolute bottom-0 start-0 m-2 opacity-75">
                          📖 {manga._count.chapters} ตอน
                        </span>
                      </div>

                      <div className="card-body d-flex flex-column p-3">
                        <h5 className="card-title fw-bold mb-1 text-truncate" title={manga.title}>
                          {manga.title}
                        </h5>

                        <p className="card-text text-muted small mb-2 text-truncate">
                          ผู้แต่ง: {manga.author || "ไม่ระบุ"}
                        </p>

                        <p
                          className="card-text small text-secondary mb-3 flex-grow-1"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {manga.description || "ไม่มีเรื่องย่อ"}
                        </p>

                        <Link
                          href={`/manga/${manga.id}`}
                          className="btn btn-warning text-dark fw-bold w-100 shadow-sm d-flex align-items-center justify-content-center gap-1"
                        >
                          <span>📖 เข้าอ่านมังงะ</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </main>
    </>
  );
}
