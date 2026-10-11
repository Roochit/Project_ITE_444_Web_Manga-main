import Navbar from "@/components/Navbar";
import BootstrapClient from "@/components/BootstrapClient";
import prisma from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const q = resolvedSearchParams?.q?.trim() || "";
  const status = resolvedSearchParams?.status || "all";
  const type = resolvedSearchParams?.type || "all";

  // สร้างเงื่อนไขค้นหาและหมวดหมู่สถานะ
  const where = {};

  if (q) {
    where.OR = [
      { title: { contains: q } },
      { author: { contains: q } },
    ];
  }

  if (status && status !== "all") {
    where.status = status;
  }

  if (type === "member") {
    where.is_member_only = true;
  } else if (type === "public") {
    where.is_member_only = false;
  }

  // ดึงข้อมูลมังงะตามเงื่อนไขค้นหา
  const mangas = await prisma.mangas.findMany({
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

      <div className="container mt-4 mb-5">
        {/* แบนเนอร์เชิญชวนเข้าชมมังงะเฉพาะสมาชิก */}
        <div
          className="p-3 p-md-4 rounded-4 shadow-sm mb-4 text-white d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3"
          style={{
            background: "linear-gradient(135deg, #1e1b4b 0%, #3730a3 100%)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
          }}
        >
          <div>
            <span className="badge bg-warning text-dark fw-bold mb-1">⭐ Exclusive Member Area</span>
            <h3 className="h4 fw-bold mb-1">มังงะพิเศษเฉพาะสมาชิก "นาราไนก้า (Yaranai ka)"</h3>
            <p className="small mb-0 text-light opacity-90">
              เข้าสู่ระบบวันนี้เพื่ออ่านมังงะในตำนาน และคอนเทนต์พิเศษเฉพาะสมาชิกเท่านั้น
            </p>
          </div>
          <Link
            href="/members"
            className="btn btn-warning text-dark fw-bold px-4 py-2 rounded-pill shadow-sm text-nowrap d-flex align-items-center gap-2"
          >
            <span>⭐ ไปยังหน้ามังงะเฉพาะสมาชิก</span>
            <span>→</span>
          </Link>
        </div>

        {/* หัวข้อและฟอร์มค้นหา / หมวดหมู่ */}
        <div className="bg-light p-4 rounded-3 shadow-sm mb-4">
          <div className="row align-items-center gy-3">
            <div className="col-lg-5">
              <h1 className="h3 fw-bold mb-1">📚 เว็บอ่านมังงะออนไลน์</h1>
              <p className="text-muted mb-0 small">
                รวมมังงะหลากหลายเรื่อง อัปเดตตอนใหม่อย่างต่อเนื่อง
              </p>
            </div>

            <div className="col-lg-7">
              <form method="GET" action="/" className="row g-2">
                <input type="hidden" name="type" value={type} />
                <div className="col-sm-7">
                  <input
                    type="text"
                    name="q"
                    defaultValue={q}
                    className="form-control"
                    placeholder="🔍 ค้นหาชื่อเรื่อง หรือชื่อผู้แต่ง..."
                  />
                </div>

                <div className="col-sm-3">
                  <select name="status" defaultValue={status} className="form-select">
                    <option value="all">ทุกสถานะ</option>
                    <option value="ongoing">ยังไม่จบ</option>
                    <option value="completed">จบแล้ว</option>
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
            <span className="small text-muted me-1">ประเภท:</span>
            <Link
              href={`/?q=${encodeURIComponent(q)}&status=${status}&type=all`}
              className={`btn btn-sm ${type === "all" ? "btn-dark" : "btn-outline-secondary"}`}
            >
              ทั้งหมด
            </Link>
            <Link
              href={`/?q=${encodeURIComponent(q)}&status=${status}&type=public`}
              className={`btn btn-sm ${type === "public" ? "btn-primary" : "btn-outline-primary"}`}
            >
              📖 มังงะทั่วไป
            </Link>
            <Link
              href={`/?q=${encodeURIComponent(q)}&status=${status}&type=member`}
              className={`btn btn-sm ${type === "member" ? "btn-warning text-dark fw-bold" : "btn-outline-warning text-dark"}`}
            >
              ⭐ เฉพาะสมาชิก VIP
            </Link>

            <span className="small text-muted ms-md-3 me-1">สถานะ:</span>
            <Link
              href={`/?q=${encodeURIComponent(q)}&status=ongoing&type=${type}`}
              className={`btn btn-sm ${status === "ongoing" ? "btn-warning text-dark fw-bold" : "btn-outline-warning text-dark"}`}
            >
              🟡 ยังไม่จบ
            </Link>
            <Link
              href={`/?q=${encodeURIComponent(q)}&status=completed&type=${type}`}
              className={`btn btn-sm ${status === "completed" ? "btn-success fw-bold" : "btn-outline-success"}`}
            >
              🟢 จบแล้ว
            </Link>

            {(q || status !== "all" || type !== "all") && (
              <Link href="/" className="btn btn-sm btn-link text-danger ms-auto">
                ✕ ล้างตัวกรอง
              </Link>
            )}
          </div>
        </div>

        {/* แสดงผลการค้นหา */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h5 fw-bold mb-0">
            {q ? `ผลการค้นหาสำหรับ "${q}"` : "รายการมังงะ"}
          </h2>
          <span className="badge bg-secondary">
            พบทั้งหมด {mangas.length} เรื่อง
          </span>
        </div>

        {/* รายการมังงะแบบ Grid */}
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          {mangas.length === 0 ? (
            <div className="col-12 text-center py-5">
              <div className="p-4 bg-light rounded text-muted">
                <p className="fs-5 mb-2">ไม่พบรายการมังงะที่ตรงกับเงื่อนไข</p>
                <Link href="/" className="btn btn-outline-primary btn-sm">
                  ดูมังงะทั้งหมด
                </Link>
              </div>
            </div>
          ) : (
            mangas.map((manga) => (
              <div className="col" key={manga.id}>
                <div className="card h-100 shadow-sm border-0 transition-hover">
                  <div className="position-relative">
                    <img
                      src={manga.cover_url || "https://via.placeholder.com/300x400?text=No+Cover"}
                      className="card-img-top"
                      alt={manga.title}
                      style={{ height: "300px", objectFit: "cover" }}
                    />
                    {manga.is_member_only && (
                      <span className="badge bg-warning text-dark position-absolute top-0 start-0 m-2 fw-bold shadow-sm">
                        ⭐ เฉพาะสมาชิก
                      </span>
                    )}
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


                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title text-truncate fw-bold mb-1" title={manga.title}>
                      {manga.title}
                    </h5>

                    <p className="card-text text-muted small mb-2 text-truncate">
                      ผู้แต่ง: {manga.author || "ไม่ระบุ"}
                    </p>

                    <p className="card-text small text-secondary mb-3 flex-grow-1" style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden"
                    }}>
                      {manga.description || "ไม่มีเรื่องย่อ"}
                    </p>

                    <Link
                      href={`/manga/${manga.id}`}
                      className="btn btn-outline-primary w-100 fw-bold"
                    >
                      อ่านมังงะ
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}