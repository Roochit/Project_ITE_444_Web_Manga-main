import Link from "next/link";

export default function NavbarAdmin() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
      <div className="container">
        {/* โลโก้แผงควบคุมฝั่ง Admin */}
        <Link className="navbar-brand fw-bold text-danger" href="/admin/mangas">
          📚 MangaAdmin
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
              <Link className="nav-link" href="/admin/mangas">
                แดชบอร์ด
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link active" href="/admin/mangas">
                จัดการมังงะ
              </Link>
            </li>
          </ul>

          {/* ปุ่มทางฝั่งขวา: กลับหน้าหลักฝั่งผู้ใช้งาน */}
          <div className="d-flex align-items-center">
            <Link className="btn btn-outline-light btn-sm" href="/">
              🌐 ไปหน้าเว็บหลัก
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}