import NavbarAdmin from "@/components/NavbarAdmin";
import BootstrapClient from "@/components/BootstrapClient";
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

export default async function AdminLogsPage({ searchParams }) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") {
    redirect("/login?error=admin_only");
  }

  const resolvedSearchParams = await searchParams;
  const page = Math.max(1, Number(resolvedSearchParams?.page) || 1);
  const q = resolvedSearchParams?.q?.trim() || "";
  const pageSize = 20;

  const where = {};
  if (q) {
    where.OR = [
      { path: { contains: q } },
      { ip_address: { contains: q } },
      { user_agent: { contains: q } },
    ];
  }

  // วันนี้
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [totalLogs, logs, totalVisits, uniqueIpGroups, todayVisits] = await Promise.all([
    prisma.visit_logs.count({ where }),
    prisma.visit_logs.findMany({
      where,
      orderBy: { id: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
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
    prisma.visit_logs.count(),
    prisma.visit_logs.groupBy({ by: ["ip_address"] }),
    prisma.visit_logs.count({ where: { created_at: { gte: startOfToday } } }),
  ]);

  const totalPages = Math.ceil(totalLogs / pageSize) || 1;

  return (
    <>
      <BootstrapClient />
      <NavbarAdmin active="logs" />

      <main className="container py-4 mb-5">
        {/* หัวข้อหน้า Log */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h1 className="h3 fw-bold mb-1 text-dark d-flex align-items-center gap-2">
              <i className="bi bi-clock-history text-primary"></i>
              บันทึกประวัติการเข้าชมเว็บไซต์ (Visit Logs)
            </h1>
            <p className="text-muted mb-0 small">
              ระบบบันทึก Log การเข้าชมหน้าเว็บของผู้เยี่ยมชมและสมาชิกแบบเรียลไทม์
            </p>
          </div>
          <div className="d-flex gap-2">
            <Link href="/admin" className="btn btn-outline-secondary d-flex align-items-center gap-2">
              <i className="bi bi-arrow-left"></i>
              <span>กลับแดชบอร์ด</span>
            </Link>
          </div>
        </div>

        {/* การ์ดสถิติย่อ */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-4">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
              <span className="text-muted small fw-semibold">ยอดเข้าชมทั้งหมด</span>
              <h3 className="fw-bold my-1 text-primary">{totalVisits.toLocaleString()} ครั้ง</h3>
              <small className="text-muted">บันทึกสะสมทั้งหมดในระบบ</small>
            </div>
          </div>
          <div className="col-12 col-sm-4">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
              <span className="text-muted small fw-semibold">ผู้เข้าชมแบบ Unique IP</span>
              <h3 className="fw-bold my-1 text-success">{uniqueIpGroups.length.toLocaleString()} คน</h3>
              <small className="text-muted">คำนวณจาก IP Address ที่ไม่ซ้ำกัน</small>
            </div>
          </div>
          <div className="col-12 col-sm-4">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
              <span className="text-muted small fw-semibold">ผู้เข้าชมวันนี้</span>
              <h3 className="fw-bold my-1 text-warning">{todayVisits.toLocaleString()} ครั้ง</h3>
              <small className="text-muted">ตั้งแต่ 00:00 น. ของวันนี้</small>
            </div>
          </div>
        </div>

        {/* กล่องค้นหา Log */}
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-3">
            <form method="GET" action="/admin/logs" className="row g-2 align-items-center">
              <div className="col-md-9">
                <input
                  type="text"
                  name="q"
                  defaultValue={q}
                  className="form-control"
                  placeholder="🔍 ค้นหาตาม Path, IP Address หรือ ข้อมูล User-Agent..."
                />
              </div>
              <div className="col-md-3 d-flex gap-2">
                <button type="submit" className="btn btn-primary fw-bold flex-grow-1">
                  ค้นหา Log
                </button>
                {q && (
                  <Link href="/admin/logs" className="btn btn-outline-secondary">
                    ล้าง
                  </Link>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* ตารางแสดงข้อมูล Log */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="card-header bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center">
            <h5 className="fw-bold mb-0">
              รายการ Log ทั้งหมด ({totalLogs.toLocaleString()} รายการ)
            </h5>
            <span className="badge bg-light text-dark border">
              หน้า {page} จาก {totalPages}
            </span>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col" style={{ width: "70px" }}>ID</th>
                  <th scope="col" style={{ width: "180px" }}>วัน-เวลา</th>
                  <th scope="col">หน้าที่เข้าชม (Path)</th>
                  <th scope="col">IP Address</th>
                  <th scope="col">ผู้ใช้งาน</th>
                  <th scope="col">อุปกรณ์และเบราว์เซอร์</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      <i className="bi bi-inbox fs-2 d-block mb-2"></i>
                      ไม่พบประวัติการเข้าชมเว็บไซต์ตามเงื่อนไข
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const ua = parseUserAgent(log.user_agent);
                    return (
                      <tr key={log.id}>
                        <td>
                          <span className="text-muted small">#{log.id}</span>
                        </td>
                        <td className="small text-nowrap" suppressHydrationWarning>
                          {new Date(log.created_at).toLocaleString("th-TH", {
                            timeZone: "Asia/Bangkok",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
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
                              🌐 ทั่วไป (Guest)
                            </span>
                          )}
                        </td>
                        <td className="small text-muted">
                          <i className={`bi ${ua.icon} me-1 text-secondary`}></i>
                          <span>{ua.browser} ({ua.os})</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="card-footer bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center">
              <span className="small text-muted">
                แสดงรายการที่ {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, totalLogs)} จาก {totalLogs}
              </span>
              <div className="btn-group btn-group-sm">
                {page > 1 ? (
                  <Link
                    href={`/admin/logs?page=${page - 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                    className="btn btn-outline-secondary"
                  >
                    ◄ ก่อนหน้า
                  </Link>
                ) : (
                  <button className="btn btn-outline-secondary" disabled>
                    ◄ ก่อนหน้า
                  </button>
                )}

                <button className="btn btn-primary" disabled>
                  {page} / {totalPages}
                </button>

                {page < totalPages ? (
                  <Link
                    href={`/admin/logs?page=${page + 1}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                    className="btn btn-outline-secondary"
                  >
                    ถัดไป ►
                  </Link>
                ) : (
                  <button className="btn btn-outline-secondary" disabled>
                    ถัดไป ►
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
