import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/app/login/actions";

export default async function NavbarAdmin({ active = "dashboard" }) {
  const user = await getCurrentUser();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
      <div className="container">
        {/* โลโก้แผงควบคุมฝั่ง Admin */}
        <Link className="navbar-brand fw-bold text-danger d-flex align-items-center gap-2" href="/admin">
          <span>📚</span>
          <span>MangaAdmin</span>
        </Link>

        {/* ปุ่ม Toggle สำหรับจอมือถือ */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#adminNavbarNav"
          aria-controls="adminNavbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* เมนูนำทาง */}
        <div className="collapse navbar-collapse" id="adminNavbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link 
                className={`nav-link ${active === "dashboard" ? "active fw-bold text-white" : ""}`} 
                href="/admin"
              >
                <i className="bi bi-speedometer2 me-1"></i>
                แดชบอร์ด
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className={`nav-link ${active === "mangas" ? "active fw-bold text-white" : ""}`} 
                href="/admin/mangas"
              >
                <i className="bi bi-journal-bookmark me-1"></i>
                จัดการมังงะ
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className={`nav-link ${active === "users" ? "active fw-bold text-white" : ""}`} 
                href="/admin/users"
              >
                <i className="bi bi-people me-1"></i>
                จัดการสมาชิก
              </Link>
            </li>
          </ul>

          {/* ข้อมูลแอดมิน & ปุ่มทางฝั่งขวา */}
          <div className="d-flex align-items-center gap-2 flex-wrap">
            {user && (
              <span className="badge bg-warning text-dark px-2 py-1 me-1 d-flex align-items-center gap-1">
                <span>👑</span>
                <span>{user.name}</span>
              </span>
            )}

            <Link className="btn btn-outline-light btn-sm d-flex align-items-center gap-1" href="/">
              <i className="bi bi-box-arrow-up-right"></i>
              <span>หน้าเว็บหลัก</span>
            </Link>

            <form action={logoutAction} className="m-0">
              <button type="submit" className="btn btn-danger btn-sm d-flex align-items-center gap-1">
                <i className="bi bi-box-arrow-right"></i>
                <span>ออกจากระบบ</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  );
}