import NavbarAdmin from "@/components/NavbarAdmin";
import BootstrapClient from "@/components/BootstrapClient";
import DashboardCharts from "@/components/DashboardCharts";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") {
    redirect("/login?error=admin_only");
  }

  // ดึงข้อมูลสถิติต่างๆ จากฐานข้อมูล
  const [
    totalMangas,
    ongoingMangas,
    completedMangas,
    totalChapters,
    totalPages,
    allMangasWithCount,
    recentChapters,
    totalUsers,
    totalAdmins,
    totalMembers,
    recentUsers,
  ] = await Promise.all([
    prisma.mangas.count(),
    prisma.mangas.count({ where: { status: "ongoing" } }),
    prisma.mangas.count({ where: { status: "completed" } }),
    prisma.chapters.count(),
    prisma.chapter_pages.count(),
    prisma.mangas.findMany({
      orderBy: { updated_at: "desc" },
      include: {
        _count: {
          select: { chapters: true },
        },
      },
    }),
    prisma.chapters.findMany({
      take: 6,
      orderBy: { created_at: "desc" },
      include: {
        manga: {
          select: {
            id: true,
            title: true,
            cover_url: true,
          },
        },
        _count: {
          select: { pages: true },
        },
      },
    }),
    prisma.users.count(),
    prisma.users.count({ where: { role: "admin" } }),
    prisma.users.count({ where: { role: { not: "admin" } } }),
    prisma.users.findMany({
      take: 5,
      orderBy: { id: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
      },
    }),
  ]);


  // มังงะที่อัปเดตล่าสุด 5 เรื่อง
  const recentMangas = allMangasWithCount.slice(0, 5);

  // เตรียมข้อมูลสำหรับกราฟจำนวนตอน (เรียงตามจำนวนตอนมากสุด 7 เรื่อง)
  const chartChapters = [...allMangasWithCount]
    .sort((a, b) => b._count.chapters - a._count.chapters)
    .slice(0, 7)
    .map((m) => ({
      title: m.title,
      chaptersCount: m._count.chapters,
    }));

  // ค่าเฉลี่ยจำนวนตอนต่อมังงะ
  const avgChapters = totalMangas > 0 ? (totalChapters / totalMangas).toFixed(1) : 0;

  // อัตราส่วนมังงะที่จบแล้ว
  const completionRate =
    totalMangas > 0 ? Math.round((completedMangas / totalMangas) * 100) : 0;

  return (
    <>
      <BootstrapClient />
      <NavbarAdmin active="dashboard" />

      <main className="container py-4 mb-5">
        {/* หัวข้อแดชบอร์ด & ปุ่ม Quick Actions */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h1 className="h3 fw-bold mb-1 text-dark d-flex align-items-center gap-2">
              <i className="bi bi-speedometer2 text-danger"></i>
              แดชบอร์ดผู้ดูแลระบบ
            </h1>
            <p className="text-muted mb-0 small">
              ภาพรวมสถิติ ข้อมูลมังงะ และความคืบหน้าของเนื้อหาทั้งหมดในระบบ
            </p>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <Link
              href="/admin/mangas/create"
              className="btn btn-primary d-flex align-items-center gap-2 shadow-sm"
            >
              <i className="bi bi-plus-circle-fill"></i>
              <span>เพิ่มมังงะใหม่</span>
            </Link>
            <Link
              href="/admin/mangas"
              className="btn btn-outline-secondary d-flex align-items-center gap-2"
            >
              <i className="bi bi-journal-text"></i>
              <span>จัดการมังงะทั้งหมด</span>
            </Link>
            <Link
              href="/admin/users"
              className="btn btn-outline-info d-flex align-items-center gap-2"
            >
              <i className="bi bi-people-fill"></i>
              <span>จัดการสมาชิก ({totalUsers})</span>
            </Link>
          </div>
        </div>

        {/* การ์ดสถิติภาพรวม (4 Cards) */}
        <div className="row g-3 mb-4">
          {/* Card 1: มังงะทั้งหมด */}
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card border-0 shadow-sm rounded-4 h-100 p-3 bg-white">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <span className="text-muted small fw-semibold">มังงะทั้งหมด</span>
                  <h2 className="display-6 fw-bold my-1 text-dark">{totalMangas}</h2>
                  <div className="small text-muted d-flex align-items-center gap-2">
                    <span className="badge bg-warning text-dark">
                      กำลังดำเนินเรื่อง {ongoingMangas}
                    </span>
                    <span className="badge bg-success">จบแล้ว {completedMangas}</span>
                  </div>
                </div>
                <div
                  className="rounded-4 d-flex align-items-center justify-content-center text-primary"
                  style={{
                    width: "56px",
                    height: "56px",
                    backgroundColor: "rgba(13, 110, 253, 0.1)",
                    fontSize: "1.75rem",
                  }}
                >
                  <i className="bi bi-book-half"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: จำนวนตอนทั้งหมด */}
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card border-0 shadow-sm rounded-4 h-100 p-3 bg-white">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <span className="text-muted small fw-semibold">จำนวนตอนทั้งหมด</span>
                  <h2 className="display-6 fw-bold my-1 text-dark">{totalChapters}</h2>
                  <span className="small text-muted">
                    เฉลี่ย <strong className="text-dark">{avgChapters}</strong> ตอน / เรื่อง
                  </span>
                </div>
                <div
                  className="rounded-4 d-flex align-items-center justify-content-center text-info"
                  style={{
                    width: "56px",
                    height: "56px",
                    backgroundColor: "rgba(13, 202, 240, 0.12)",
                    fontSize: "1.75rem",
                  }}
                >
                  <i className="bi bi-collection-play"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: จำนวนหน้าทั้งหมด */}
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card border-0 shadow-sm rounded-4 h-100 p-3 bg-white">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <span className="text-muted small fw-semibold">จำนวนหน้า/รูปภาพ</span>
                  <h2 className="display-6 fw-bold my-1 text-dark">{totalPages}</h2>
                  <span className="small text-muted">รูปภาพที่ถูกบันทึกในระบบ</span>
                </div>
                <div
                  className="rounded-4 d-flex align-items-center justify-content-center text-success"
                  style={{
                    width: "56px",
                    height: "56px",
                    backgroundColor: "rgba(25, 135, 84, 0.12)",
                    fontSize: "1.75rem",
                  }}
                >
                  <i className="bi bi-images"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: อัตราส่วนเรื่องที่จบแล้ว */}
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card border-0 shadow-sm rounded-4 h-100 p-3 bg-white">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <span className="text-muted small fw-semibold">เรื่องที่จบแล้ว</span>
                  <h2 className="display-6 fw-bold my-1 text-dark">{completionRate}%</h2>
                  <span className="small text-muted">
                    จบแล้ว <strong className="text-success">{completedMangas}</strong> จาก{" "}
                    {totalMangas} เรื่อง
                  </span>
                </div>
                <div
                  className="rounded-4 d-flex align-items-center justify-content-center text-warning"
                  style={{
                    width: "56px",
                    height: "56px",
                    backgroundColor: "rgba(255, 193, 7, 0.15)",
                    fontSize: "1.75rem",
                  }}
                >
                  <i className="bi bi-check2-circle"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Card 5: ผู้ใช้งานและสมาชิกทั้งหมด */}
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card border-0 shadow-sm rounded-4 h-100 p-3 bg-white">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <span className="text-muted small fw-semibold">ผู้ใช้งานและสมาชิก</span>
                  <h2 className="display-6 fw-bold my-1 text-dark">{totalUsers}</h2>
                  <div className="small text-muted d-flex align-items-center gap-1 flex-wrap">
                    <span className="badge bg-warning text-dark">Admin {totalAdmins}</span>
                    <span className="badge bg-primary">Member {totalMembers}</span>
                  </div>
                </div>
                <div
                  className="rounded-4 d-flex align-items-center justify-content-center text-primary"
                  style={{
                    width: "56px",
                    height: "56px",
                    backgroundColor: "rgba(13, 110, 253, 0.1)",
                    fontSize: "1.75rem",
                  }}
                >
                  <i className="bi bi-people"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* กราฟสถิติ (Client Component) */}
        <DashboardCharts
          statusData={{ ongoing: ongoingMangas, completed: completedMangas }}
          chapterData={chartChapters}
        />

        {/* ตารางข้อมูลล่าสุด: มังงะที่อัปเดตล่าสุด & ตอนที่เพิ่มล่าสุด */}
        <div className="row g-4">
          {/* คอลัมน์ซ้าย: มังงะที่อัปเดตล่าสุด */}
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-header bg-white border-0 pt-4 px-4 pb-2 d-flex justify-content-between align-items-center">
                <h5 className="card-title fw-bold mb-0 d-flex align-items-center gap-2">
                  <i className="bi bi-clock-history text-primary"></i>
                  มังงะที่มีการเคลื่อนไหวล่าสุด
                </h5>
                <Link href="/admin/mangas" className="btn btn-sm btn-link text-decoration-none">
                  ดูทั้งหมด <i className="bi bi-arrow-right"></i>
                </Link>
              </div>
              <div className="card-body px-4 pb-4 pt-2">
                {recentMangas.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th scope="col" style={{ width: "60px" }}>หน้าปก</th>
                          <th scope="col">ชื่อเรื่อง</th>
                          <th scope="col" className="text-center">จำนวนตอน</th>
                          <th scope="col" className="text-center">สถานะ</th>
                          <th scope="col" className="text-end">การจัดการ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentMangas.map((manga) => (
                          <tr key={manga.id}>
                            <td>
                              <img
                                src={manga.cover_url || "/file.svg"}
                                alt={manga.title}
                                className="rounded object-fit-cover shadow-sm"
                                style={{ width: "42px", height: "56px" }}
                              />
                            </td>
                            <td>
                              <div className="fw-bold text-dark">{manga.title}</div>
                              <small className="text-muted">
                                {manga.author ? `ผู้แต่ง: ${manga.author}` : "ไม่ระบุผู้แต่ง"}
                              </small>
                            </td>
                            <td className="text-center">
                              <span className="badge bg-light text-dark border">
                                📖 {manga._count.chapters} ตอน
                              </span>
                            </td>
                            <td className="text-center">
                              {manga.status === "completed" ? (
                                <span className="badge bg-success">จบแล้ว</span>
                              ) : (
                                <span className="badge bg-warning text-dark">กำลังดำเนินเรื่อง</span>
                              )}
                            </td>
                            <td className="text-end">
                              <div className="btn-group btn-group-sm">
                                <Link
                                  href={`/admin/mangas/${manga.id}/chapter`}
                                  className="btn btn-outline-primary"
                                  title="จัดการตอน"
                                >
                                  <i className="bi bi-list-ol"></i> ตอน
                                </Link>
                                <Link
                                  href={`/admin/mangas/update/${manga.id}`}
                                  className="btn btn-outline-secondary"
                                  title="แก้ไข"
                                >
                                  <i className="bi bi-pencil"></i>
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted">
                    <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                    ยังไม่มีข้อมูลมังงะในระบบ
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* คอลัมน์ขวา: ตอนที่เพิ่มล่าสุด & เมนูลัด */}
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-header bg-white border-0 pt-4 px-4 pb-2">
                <h5 className="card-title fw-bold mb-0 d-flex align-items-center gap-2">
                  <i className="bi bi-file-earmark-plus text-success"></i>
                  ตอนที่เพิ่มล่าสุด
                </h5>
              </div>
              <div className="card-body px-4 pb-4 pt-2">
                {recentChapters.length > 0 ? (
                  <div className="list-group list-group-flush">
                    {recentChapters.map((chapter) => (
                      <div
                        key={chapter.id}
                        className="list-group-item px-0 py-3 border-bottom d-flex align-items-center justify-content-between"
                      >
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={chapter.manga.cover_url || "/file.svg"}
                            alt={chapter.manga.title}
                            className="rounded object-fit-cover shadow-sm"
                            style={{ width: "36px", height: "48px" }}
                          />
                          <div>
                            <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: "200px" }}>
                              {chapter.manga.title}
                            </div>
                            <div className="small text-muted">
                              ตอนที่ {chapter.chapter_number} {chapter.title ? `(${chapter.title})` : ""}
                            </div>
                          </div>
                        </div>
                        <div className="text-end">
                          <span className="badge bg-light text-secondary border d-block mb-1">
                            {chapter._count.pages} หน้า
                          </span>
                          <Link
                            href={`/admin/mangas/${chapter.manga.id}/chapter`}
                            className="btn btn-sm btn-link p-0 text-decoration-none small"
                          >
                            ดูตอน <i className="bi bi-chevron-right"></i>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted">
                    <i className="bi bi-folder-x fs-1 d-block mb-2"></i>
                    ยังไม่มีการเพิ่มตอนในระบบ
                  </div>
                )}

                {/* เมนูลัดสำหรับแอดมิน */}
                <div className="mt-4 pt-3 border-top">
                  <span className="text-muted small fw-semibold d-block mb-2">
                    ⚡ เมนูจัดการด่วน (Quick Links)
                  </span>
                  <div className="d-grid gap-2">
                    <Link
                      href="/admin/mangas/create"
                      className="btn btn-light text-start d-flex justify-content-between align-items-center py-2"
                    >
                      <span>
                        <i className="bi bi-plus-circle text-primary me-2"></i>
                        เพิ่มมังงะเรื่องใหม่
                      </span>
                      <i className="bi bi-chevron-right text-muted small"></i>
                    </Link>
                    <Link
                      href="/admin/mangas"
                      className="btn btn-light text-start d-flex justify-content-between align-items-center py-2"
                    >
                      <span>
                        <i className="bi bi-journals text-info me-2"></i>
                        จัดการรายการและตอนทั้งหมด
                      </span>
                      <i className="bi bi-chevron-right text-muted small"></i>
                    </Link>
                    <Link
                      href="/admin/users"
                      className="btn btn-light text-start d-flex justify-content-between align-items-center py-2"
                    >
                      <span>
                        <i className="bi bi-people-fill text-warning me-2"></i>
                        จัดการสมาชิกและแอดมิน ({totalUsers} บัญชี)
                      </span>
                      <i className="bi bi-chevron-right text-muted small"></i>
                    </Link>
                    <Link
                      href="/"
                      className="btn btn-light text-start d-flex justify-content-between align-items-center py-2"
                    >
                      <span>
                        <i className="bi bi-globe2 text-success me-2"></i>
                        เปิดดูหน้าเว็บฝั่งผู้ใช้งาน
                      </span>
                      <i className="bi bi-box-arrow-up-right text-muted small"></i>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
