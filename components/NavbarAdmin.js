import Link from "next/link";

export default function NavbarAdmin({ active = "dashboard" }) {
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
            {/* <li className="nav-item">
              <Link 
                className={`nav-link ${active === "create" ? "active fw-bold text-white" : ""}`} 
                href="/admin/mangas/create"
              >
                <i className="bi bi-plus-circle me-1"></i>
                เพิ่มมังงะใหม่
              </Link>
            </li> */}
          </ul>

          {/* ปุ่มทางฝั่งขวา: กลับหน้าหลักฝั่งผู้ใช้งาน */}
          <div className="d-flex align-items-center gap-2">
            <Link className="btn btn-outline-light btn-sm d-flex align-items-center gap-1" href="/">
              <i className="bi bi-box-arrow-up-right"></i>
              <span>ไปหน้าเว็บหลัก</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}