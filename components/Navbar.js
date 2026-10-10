import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/app/login/actions";

export default async function Navbar() {
  const user = await getCurrentUser();

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 28px",
        backgroundColor: "#1a1a1a",
        color: "#fff",
        boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
        flexWrap: "wrap",
        gap: "12px",
      }}
    >
      {/* โลโก้ / ชื่อเว็บ */}
      <div style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
        <Link
          href="/"
          style={{
            color: "#fff",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>📖</span>
          <span>MangaApp</span>
        </Link>
      </div>

      {/* เมนูนำทางและสถานะผู้ใช้ */}
      <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
        <Link
          href="/"
          style={{
            color: "#ddd",
            textDecoration: "none",
            fontSize: "0.95rem",
          }}
        >
          หน้าแรก
        </Link>

        {user?.role === "admin" && (
          <Link
            href="/admin"
            style={{
              color: "#38bdf8",
              textDecoration: "none",
              fontWeight: "bold",
              fontSize: "0.95rem",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span>⚙️</span>
            <span>แดชบอร์ด (Admin)</span>
          </Link>
        )}

        {user ? (
          /* ผู้ใช้ที่ล็อกอินแล้ว */
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <span
              style={{
                fontSize: "0.85rem",
                padding: "4px 10px",
                borderRadius: "20px",
                backgroundColor: user.role === "admin" ? "#eab308" : "#3b82f6",
                color: user.role === "admin" ? "#000" : "#fff",
                fontWeight: "bold",
              }}
            >
              {user.role === "admin" ? "👑 Admin" : "👤 Member"}: {user.name}
            </span>

            <form action={logoutAction} style={{ margin: 0 }}>
              <button
                type="submit"
                style={{
                  backgroundColor: "transparent",
                  color: "#ef4444",
                  border: "1px solid #ef4444",
                  padding: "4px 12px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  fontWeight: "bold",
                  transition: "all 0.2s",
                }}
              >
                ออกจากระบบ
              </button>
            </form>
          </div>
        ) : (
          /* ผู้ใช้ที่ยังไม่ได้ล็อกอิน */
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <Link
              href="/login"
              style={{
                color: "#fff",
                textDecoration: "none",
                fontSize: "0.9rem",
                padding: "5px 12px",
                border: "1px solid #4b5563",
                borderRadius: "6px",
              }}
            >
              🔑 เข้าสู่ระบบ
            </Link>
            <Link
              href="/register"
              style={{
                backgroundColor: "#2563eb",
                color: "#fff",
                textDecoration: "none",
                fontSize: "0.9rem",
                padding: "5px 14px",
                borderRadius: "6px",
                fontWeight: "bold",
              }}
            >
              📝 สมัครสมาชิก
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}