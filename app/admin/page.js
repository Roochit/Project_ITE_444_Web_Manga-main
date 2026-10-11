import NavbarAdmin from "@/components/NavbarAdmin";
import BootstrapClient from "@/components/BootstrapClient";
import DashboardCharts from "@/components/DashboardCharts";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

function parseUserAgent(ua) {
  if (!ua || ua === "Unknown") return { browser: "ไม่ทราบ", os: "Unknown", icon: "bi-globe" };
  let browser = "เบราว์เซอร์";
  let os = "อุปกรณ์";
  let icon = "bi-laptop";

  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Edg")) browser = "Edge";
  else if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Safari")) browser = "Safari";
  else if (ua.includes("curl")) browser = "cURL API";

  if (ua.includes("iPhone") || ua.includes("iPad")) { os = "iOS"; icon = "bi-phone"; }
  else if (ua.includes("Android")) { os = "Android"; icon = "bi-phone"; }
  else if (ua.includes("Mac OS")) { os = "macOS"; icon = "bi-apple"; }
  else if (ua.includes("Windows")) { os = "Windows"; icon = "bi-windows"; }
  else if (ua.includes("Linux")) { os = "Linux"; icon = "bi-terminal"; }

  return { browser, os, icon };
}

export default async function AdminDashboardPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") {
    redirect("/login?error=admin_only");
  }

  // กำหนดช่วงเวลาสำหรับสถิติ Log
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

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
    totalMemberOnlyMangas,
    totalVisits,
    uniqueIpGroups,
    todayVisits,
    todayUniqueGroups,
    memberVisits,
    recentLogs,
    topPages,
    last7DaysLogs,
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
    prisma.mangas.count({ where: { is_member_only: true } }),
    // ข้อมูลสถิติ Visitor Logs
    prisma.visit_logs.count(),
    prisma.visit_logs.groupBy({ by: ["ip_address"] }),
    prisma.visit_logs.count({ where: { created_at: { gte: startOfToday } } }),
    prisma.visit_logs.groupBy({
      by: ["ip_address"],
      where: { created_at: { gte: startOfToday } },
    }),
    prisma.visit_logs.count({ where: { user_id: { not: null } } }),
    prisma.visit_logs.findMany({
      take: 10,
      orderBy: { id: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    }),
    prisma.visit_logs.groupBy({
      by: ["path"],
      _count: { path: true },
      orderBy: { _count: { path: "desc" } },
      take: 5,
    }),
    prisma.visit_logs.findMany({
      where: { created_at: { gte: sevenDaysAgo } },
      select: { created_at: true, ip_address: true },
    }),
  ]);

  // คำนวณข้อมูลกราฟการเข้าชม 7 วันล่าสุด
  const daysMap = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateKey = d.toISOString().split("T")[0];
    const label = d.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      timeZone: "Asia/Bangkok",
    });
    daysMap[dateKey] = { label, visits: 0, uniqueIps: new Set() };
  }

  last7DaysLogs.forEach((log) => {
    const dateKey = log.created_at.toISOString().split("T")[0];
    if (daysMap[dateKey]) {
      daysMap[dateKey].visits += 1;
      if (log.ip_address) {
        daysMap[dateKey].uniqueIps.add(log.ip_address);
      }
    }
  });

  const trafficData = {
    labels: Object.values(daysMap).map((d) => d.label),
    visits: Object.values(daysMap).map((d) => d.visits),
    uniqueVisitors: Object.values(daysMap).map((d) => d.uniqueIps.size),
  };

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
              ภาพรวมสถิติ ผู้เข้าชมเว็บไซต์ ข้อมูลมังงะ และความคืบหน้าของเนื้อหาทั้งหมดในระบบ
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
              href="/admin/logs"
              className="btn btn-outline-dark d-flex align-items-center gap-2 shadow-sm"
            >
              <i className="bi bi-clock-history"></i>
              <span>ดู Log การเข้าชม ({totalVisits.toLocaleString()})</span>
            </Link>
            <Link
              href="/admin/mangas"
              className="btn btn-outline-secondary d-flex align-items-center gap-2"
            >
              <i className="bi bi-journal-text"></i>
              <span>จัดการมังงะ</span>
            </Link>
            <Link
              href="/members"
              className="btn btn-outline-warning text-dark d-flex align-items-center gap-2 fw-bold"
            >
              <span>⭐</span>
              <span>มังงะเฉพาะสมาชิก ({totalMemberOnlyMangas})</span>
            </Link>
          </div>
        </div>

        {/* ส่วนที่ 1: สถิติผู้เข้าชมเว็บไซต์และระบบนับคน (Visitor & Traffic Stats) */}
        <div className="d-flex align-items-center justify-content-between mb-2">
          <h5 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
            <i className="bi bi-activity text-primary"></i>
            <span>สถิติผู้เข้าชมเว็บไซต์และระบบนับคน (Visitor Analytics)</span>
          </h5>
          <Link href="/admin/logs" className="small text-decoration-none">
            ดู Log ทั้งหมด <i className="bi bi-chevron-right"></i>
          </Link>
        </div>

        <div className="row g-3 mb-4">
          {/* Traffic Card 1: ยอดเข้าชมเว็บไซต์ทั้งหมด */}
          <div className="col-12 col-sm-6 col-xl-3">
            <div
              className="card border-0 shadow-sm rounded-4 h-100 p-3 bg-white"
              style={{ borderLeft: "4px solid #6366f1 !important" }}
            >
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <span className="text-muted small fw-semibold">ยอดเข้าชมเว็บทั้งหมด (Pageviews)</span>
                  <h2 className="display-6 fw-bold my-1 text-dark">{totalVisits.toLocaleString()}</h2>
                  <span className="small text-muted">
                    บันทึก Log การเข้าชมทั้งหมด
                  </span>
                </div>
                <div
                  className="rounded-4 d-flex align-items-center justify-content-center text-primary"
                  style={{
                    width: "56px",
                    height: "56px",
                    backgroundColor: "rgba(99, 102, 241, 0.12)",
                    fontSize: "1.75rem",
                  }}
                >
                  <i className="bi bi-eye-fill"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Traffic Card 2: ผู้เข้าชมแบบ Unique IP */}
          <div className="col-12 col-sm-6 col-xl-3">
            <div
              className="card border-0 shadow-sm rounded-4 h-100 p-3 bg-white"
              style={{ borderLeft: "4px solid #10b981 !important" }}
            >
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <span className="text-muted small fw-semibold">ผู้เข้าชมแบบ Unique IP</span>
                  <h2 className="display-6 fw-bold my-1 text-dark">{uniqueIpGroups.length.toLocaleString()}</h2>
                  <span className="small text-muted">
                    ผู้เข้าชมที่ไม่ซ้ำ IP Address
                  </span>
                </div>
                <div
                  className="rounded-4 d-flex align-items-center justify-content-center text-success"
                  style={{
                    width: "56px",
                    height: "56px",
                    backgroundColor: "rgba(16, 185, 129, 0.12)",
                    fontSize: "1.75rem",
                  }}
                >
                  <i className="bi bi-person-check-fill"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Traffic Card 3: ผู้เข้าชมวันนี้ */}
          <div className="col-12 col-sm-6 col-xl-3">
            <div
              className="card border-0 shadow-sm rounded-4 h-100 p-3 bg-white"
              style={{ borderLeft: "4px solid #f59e0b !important" }}
            >
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <span className="text-muted small fw-semibold">ยอดเข้าชมวันนี้</span>
                  <h2 className="display-6 fw-bold my-1 text-dark">{todayVisits.toLocaleString()}</h2>
                  <div className="small text-muted d-flex align-items-center gap-2">
                    <span className="badge bg-warning text-dark">
                      Unique IP วันนี้: {todayUniqueGroups.length}
                    </span>
                  </div>
                </div>
                <div
                  className="rounded-4 d-flex align-items-center justify-content-center text-warning"
                  style={{
                    width: "56px",
                    height: "56px",
                    backgroundColor: "rgba(245, 158, 11, 0.12)",
                    fontSize: "1.75rem",
                  }}
                >
                  <i className="bi bi-calendar2-day-fill"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Traffic Card 4: สมาชิกและมังงะเฉพาะสมาชิก */}
          <div className="col-12 col-sm-6 col-xl-3">
            <div
              className="card border-0 shadow-sm rounded-4 h-100 p-3 bg-white"
              style={{ borderLeft: "4px solid #8b5cf6 !important" }}
            >
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <span className="text-muted small fw-semibold">มังงะเฉพาะสมาชิก (VIP)</span>
                  <h2 className="display-6 fw-bold my-1 text-dark">{totalMemberOnlyMangas}</h2>
                  <div className="small text-muted">
                    เข้าชมโดยสมาชิก <strong className="text-primary">{memberVisits}</strong> ครั้ง
                  </div>
                </div>
                <div
                  className="rounded-4 d-flex align-items-center justify-content-center text-purple"
                  style={{
                    width: "56px",
                    height: "56px",
                    backgroundColor: "rgba(139, 92, 246, 0.12)",
                    fontSize: "1.75rem",
                    color: "#8b5cf6",
                  }}
                >
                  <i className="bi bi-stars"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* การ์ดสถิติภาพรวมเนื้อหามังงะ (5 Cards) */}
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

          {/* Card 4: ผู้ใช้งานและสมาชิก */}
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

        {/* กราฟสถิติ (Traffic Chart + Manga Charts) */}
        <DashboardCharts
          statusData={{ ongoing: ongoingMangas, completed: completedMangas }}
          chapterData={chartChapters}
          trafficData={trafficData}
        />

        {/* ส่วนแสดงตาราง Log ผู้เข้าชมล่าสุด + 5 หน้าที่มีการเข้าชมสูงสุด */}
        <div className="row g-4 mb-4">
          {/* คอลัมน์ซ้าย: บันทึก Log ผู้เข้าชมล่าสุด */}
          {/* <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-header bg-white border-0 pt-4 px-4 pb-2 d-flex justify-content-between align-items-center">
                <h5 className="card-title fw-bold mb-0 d-flex align-items-center gap-2">
                  <i className="bi bi-clock-history text-primary"></i>
                  บันทึกประวัติการเข้าชมล่าสุด (Live Visitor Logs)
                </h5>
                <Link href="/admin/logs" className="btn btn-sm btn-link text-decoration-none">
                  ดูทั้งหมด ({totalVisits.toLocaleString()}) <i className="bi bi-arrow-right"></i>
                </Link>
              </div>
              <div className="card-body px-4 pb-4 pt-2">
                {recentLogs.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th scope="col">วัน-เวลา</th>
                          <th scope="col">หน้าที่เข้าชม</th>
                          <th scope="col">IP Address</th>
                          <th scope="col">ผู้ใช้งาน</th>
                          <th scope="col">อุปกรณ์</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentLogs.map((log) => {
                          const ua = parseUserAgent(log.user_agent);
                          return (
                            <tr key={log.id}>
                              <td className="small text-nowrap" suppressHydrationWarning>
                                {new Date(log.created_at).toLocaleTimeString("th-TH", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                  timeZone: "Asia/Bangkok",
                                })}
                              </td>
                              <td>
                                <span
                                  className={`badge ${
                                    log.path === "/"
                                      ? "bg-primary"
                                      : log.path.startsWith("/members")
                                      ? "bg-warning text-dark"
                                      : log.path.startsWith("/manga")
                                      ? "bg-info text-dark"
                                      : log.path.startsWith("/admin")
                                      ? "bg-danger"
                                      : "bg-secondary"
                                  }`}
                                >
                                  {log.path}
                                </span>
                              </td>
                              <td>
                                <code className="bg-light px-2 py-1 rounded small border text-dark">
                                  {log.ip_address || "-"}
                                </code>
                              </td>
                              <td>
                                {log.user ? (
                                  <span className="badge bg-success-subtle text-success border border-success-subtle py-1 px-2">
                                    {log.user.role === "admin" ? "👑 Admin" : "👤 Member"}: {log.user.name}
                                  </span>
                                ) : (
                                  <span className="badge bg-light text-muted border py-1 px-2">
                                    🌐 Guest
                                  </span>
                                )}
                              </td>
                              <td className="small text-muted">
                                <i className={`bi ${ua.icon} me-1 text-secondary`}></i>
                                <span>{ua.browser} ({ua.os})</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted">
                    <i className="bi bi-clock-history fs-1 d-block mb-2"></i>
                    ยังไม่มีข้อมูล Log การเข้าชมในระบบ
                  </div>
                )}
              </div>
            </div>
          </div> */}

          {/* คอลัมน์ขวา: 5 หน้าที่เข้าชมสูงสุด */}
          {/* <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-header bg-white border-0 pt-4 px-4 pb-2">
                <h5 className="card-title fw-bold mb-0 d-flex align-items-center gap-2">
                  <i className="bi bi-fire text-danger"></i>
                  หน้ายอดนิยม (Top Visited Pages)
                </h5>
              </div>
              <div className="card-body px-4 pb-4 pt-2">
                {topPages.length > 0 ? (
                  <div className="list-group list-group-flush">
                    {topPages.map((item, index) => {
                      const count = item._count.path;
                      const percentage = totalVisits > 0 ? Math.round((count / totalVisits) * 100) : 0;
                      return (
                        <div key={item.path} className="list-group-item px-0 py-3 border-bottom">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="fw-semibold text-dark text-truncate" style={{ maxWidth: "200px" }}>
                              <span className="badge bg-light text-secondary border me-1">#{index + 1}</span>
                              {item.path}
                            </span>
                            <span className="badge bg-primary rounded-pill">
                              {count.toLocaleString()} ครั้ง
                            </span>
                          </div>
                          <div className="progress" style={{ height: "6px" }}>
                            <div
                              className="progress-bar bg-primary"
                              role="progressbar"
                              style={{ width: `${percentage}%` }}
                              aria-valuenow={percentage}
                              aria-valuemin="0"
                              aria-valuemax="100"
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted">
                    ยังไม่มีข้อมูลหน้าที่มีการเข้าชม
                  </div>
                )} */}

                {/* กล่องสรุปสถานะมังงะเฉพาะสมาชิก */}
                {/* <div className="mt-4 p-3 bg-light rounded-3 border">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className="fs-5">⭐</span>
                    <strong className="text-dark">พื้นที่มังงะเฉพาะสมาชิก (VIP)</strong>
                  </div>
                  <p className="small text-muted mb-2">
                    ปัจจุบันมีมังงะเฉพาะสมาชิกทั้งหมด <strong>{totalMemberOnlyMangas}</strong> เรื่อง รวมถึงมังงะในตำนาน <strong>"นาราไนก้า"</strong>
                  </p>
                  <Link href="/members" className="btn btn-warning text-dark btn-sm fw-bold w-100">
                    ดูหน้ามังงะเฉพาะสมาชิก
                  </Link>
                </div> */}
              {/* </div>
            </div>
          </div> */}
        </div>

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
                              <div className="d-flex align-items-center gap-2">
                                <span className="fw-bold text-dark">{manga.title}</span>
                                {manga.is_member_only && (
                                  <span className="badge bg-warning text-dark small">⭐ VIP</span>
                                )}
                              </div>
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
                      href="/admin/logs"
                      className="btn btn-light text-start d-flex justify-content-between align-items-center py-2"
                    >
                      <span>
                        <i className="bi bi-clock-history text-secondary me-2"></i>
                        ประวัติการเข้าชมทั้งหมด ({totalVisits.toLocaleString()} ครั้ง)
                      </span>
                      <i className="bi bi-chevron-right text-muted small"></i>
                    </Link>
                    <Link
                      href="/members"
                      className="btn btn-light text-start d-flex justify-content-between align-items-center py-2"
                    >
                      <span>
                        <i className="bi bi-stars text-warning me-2"></i>
                        เปิดดูหน้ามังงะเฉพาะสมาชิก
                      </span>
                      <i className="bi bi-box-arrow-up-right text-muted small"></i>
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
