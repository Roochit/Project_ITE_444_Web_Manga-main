import NavbarAdmin from "@/components/NavbarAdmin";
import BootstrapClient from "@/components/BootstrapClient";
import UserListTable from "@/components/UserListTable";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({ searchParams }) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") {
    redirect("/login?error=admin_only");
  }

  const resolvedSearchParams = await searchParams;
  const q = resolvedSearchParams?.q?.trim() || "";
  const roleFilter = resolvedSearchParams?.role || "all";

  const where = {};
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { email: { contains: q } },
    ];
  }
  if (roleFilter && roleFilter !== "all") {
    where.role = roleFilter;
  }

  const [users, totalUsers, totalAdmins, totalMembers] = await Promise.all([
    prisma.users.findMany({
      where,
      orderBy: { id: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
      },
    }),
    prisma.users.count(),
    prisma.users.count({ where: { role: "admin" } }),
    prisma.users.count({ where: { role: { not: "admin" } } }),
  ]);

  return (
    <>
      <BootstrapClient />
      <NavbarAdmin active="users" />

      <main className="container py-4 mb-5">
        {/* หัวข้อหน้าจัดการสมาชิก */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h1 className="h3 fw-bold mb-1 text-dark d-flex align-items-center gap-2">
              <i className="bi bi-people text-danger"></i>
              จัดการสมาชิกและผู้ดูแลระบบ
            </h1>
            <p className="text-muted mb-0 small">
              ดูรายชื่อผู้ใช้งาน จัดการสิทธิ์การเข้าถึง (Admin / Member) และลบผู้ใช้
            </p>
          </div>

          <div className="d-flex gap-2">
            <Link href="/admin" className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1">
              <i className="bi bi-arrow-left"></i>
              <span>กลับแดชบอร์ด</span>
            </Link>
          </div>
        </div>

        {/* การ์ดสถิติผู้ใช้งาน */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <span className="text-muted small fw-semibold">ผู้ใช้งานทั้งหมด</span>
                  <h3 className="fw-bold my-1 text-dark">{totalUsers}</h3>
                  <span className="small text-muted">บัญชีในฐานข้อมูล</span>
                </div>
                <div
                  className="rounded-4 d-flex align-items-center justify-content-center text-primary"
                  style={{ width: "50px", height: "50px", backgroundColor: "rgba(13, 110, 253, 0.1)" }}
                >
                  <i className="bi bi-people fs-4"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <span className="text-muted small fw-semibold">ผู้ดูแลระบบ (Admin)</span>
                  <h3 className="fw-bold my-1 text-warning">{totalAdmins}</h3>
                  <span className="small text-muted">มีสิทธิ์เข้าจัดการหลังบ้าน</span>
                </div>
                <div
                  className="rounded-4 d-flex align-items-center justify-content-center text-warning"
                  style={{ width: "50px", height: "50px", backgroundColor: "rgba(255, 193, 7, 0.15)" }}
                >
                  <i className="bi bi-shield-lock fs-4"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <span className="text-muted small fw-semibold">สมาชิกทั่วไป (Member)</span>
                  <h3 className="fw-bold my-1 text-info">{totalMembers}</h3>
                  <span className="small text-muted">มีสิทธิ์อ่านและใช้งาน</span>
                </div>
                <div
                  className="rounded-4 d-flex align-items-center justify-content-center text-info"
                  style={{ width: "50px", height: "50px", backgroundColor: "rgba(13, 202, 240, 0.1)" }}
                >
                  <i className="bi bi-person-check fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ค้นหาและกรองข้อมูล */}
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-3">
            <form method="GET" action="/admin/users" className="row g-2 align-items-center">
              <div className="col-12 col-md-6">
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="bi bi-search text-muted"></i>
                  </span>
                  <input
                    type="text"
                    name="q"
                    defaultValue={q}
                    className="form-control border-start-0 bg-light"
                    placeholder="ค้นหาชื่อ หรืออีเมล..."
                  />
                </div>
              </div>

              <div className="col-6 col-md-3">
                <select name="role" defaultValue={roleFilter} className="form-select bg-light">
                  <option value="all">ทุกสิทธิ์ (All Roles)</option>
                  <option value="admin">เฉพาะ Admin</option>
                  <option value="member">เฉพาะ Member</option>
                </select>
              </div>

              <div className="col-6 col-md-3 d-flex gap-2">
                <button type="submit" className="btn btn-primary flex-grow-1">
                  ค้นหา
                </button>
                {(q || roleFilter !== "all") && (
                  <Link href="/admin/users" className="btn btn-outline-secondary">
                    รีเซ็ต
                  </Link>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* ตารางแสดงรายชื่อผู้ใช้ */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-bold fs-6">
              รายชื่อผู้ใช้ทั้งหมด ({users.length} รายการ)
            </h5>
          </div>
          <UserListTable users={users} currentUserId={currentUser.id} />
        </div>
      </main>
    </>
  );
}
