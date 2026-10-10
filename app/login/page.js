"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";
import { loginAction } from "./actions";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const redirectParam = searchParams.get("redirect") || "";
  const errorParam = searchParams.get("error") || "";

  useEffect(() => {
    if (errorParam === "unauthorized") {
      setErrorMessage("กรุณาเข้าสู่ระบบก่อนเข้าใช้งานหน้านี้");
    } else if (errorParam === "admin_only") {
      setErrorMessage("หน้านี้สงวนสิทธิ์เฉพาะผู้ดูแลระบบ (Admin) เท่านั้น");
    }
  }, [errorParam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("redirectUrl", redirectParam);

      const res = await loginAction(formData);

      if (res.success) {
        await Swal.fire({
          icon: "success",
          title: "เข้าสู่ระบบสำเร็จ!",
          text: `ยินดีต้อนรับคุณ ${res.user.name} (${res.user.role === "admin" ? "ผู้ดูแลระบบ" : "สมาชิก"})`,
          timer: 1500,
          showConfirmButton: false,
        });

        // นำทางไปยังหน้าที่เหมาะสม
        if (res.redirectUrl) {
          window.location.href = res.redirectUrl;
        } else if (res.user.role === "admin") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/";
        }
      } else {
        setErrorMessage(res.error || "เข้าสู่ระบบไม่สำเร็จ");
        Swal.fire({
          icon: "error",
          title: "เข้าสู่ระบบไม่สำเร็จ",
          text: res.error || "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
        });
      }
    } catch (err) {
      setErrorMessage("เกิดข้อผิดพลาดในการเชื่อมต่อ: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันช่วยเหลือ: กรอกข้อมูลทดสอบบัญชีอย่างรวดเร็ว
  const fillQuickAccount = (accEmail, accPass) => {
    setEmail(accEmail);
    setPassword(accPass);
    setErrorMessage("");
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center py-5"
      style={{
        background: "linear-gradient(135deg, #1e1e2f 0%, #12121a 100%)",
        color: "#f8f9fa",
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6 col-xl-5">
            {/* โลโก้ & หัวข้อ */}
            <div className="text-center mb-4">
              <Link href="/" className="text-decoration-none">
                <span className="display-5">📖</span>
                <h1 className="h3 fw-bold text-white mt-2">MangaApp</h1>
              </Link>
              <p className="text-white small">ระบบเข้าสู่ระบบสมาชิกและผู้ดูแลระบบ</p>
            </div>

            {/* กล่องแบบฟอร์มเข้าสู่ระบบ */}
            <div className="card shadow-lg border-0 rounded-4 bg-dark text-white p-4 p-md-5">
              <div className="text-center mb-4">
                <h2 className="h4 fw-bold mb-1">🔐 เข้าสู่ระบบ</h2>
                <p className="text-secondary small mb-0">กรอกอีเมลและรหัสผ่านเพื่อเข้าสู่บัญชีของคุณ</p>
              </div>

              {errorMessage && (
                <div className="alert alert-danger d-flex align-items-center py-2 px-3 mb-4 rounded-3" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                  <div className="small">{errorMessage}</div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Email */}
                <div className="mb-3">
                  <label className="form-label small text-secondary fw-semibold">อีเมล (Email)</label>
                  <div className="input-group">
                    <span className="input-group-text bg-secondary border-0 text-white">
                      <i className="bi bi-envelope"></i>
                    </span>
                    <input
                      type="email"
                      className="form-control bg-secondary text-white border-0"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="mb-4">
                  <label className="form-label small text-secondary fw-semibold">รหัสผ่าน (Password)</label>
                  <div className="input-group">
                    <span className="input-group-text bg-secondary border-0 text-white">
                      <i className="bi bi-lock"></i>
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control bg-secondary text-white border-0"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary text-white border-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                    </button>
                  </div>
                </div>

                {/* ปุ่มส่งฟอร์ม */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-100 py-2 fw-bold rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      <span>กำลังเข้าสู่ระบบ...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-in-right"></i>
                      <span>เข้าสู่ระบบ</span>
                    </>
                  )}
                </button>
              </form>

              {/* ลิงก์ไปหน้าสมัครสมาชิก */}
              <div className="text-center mt-4 pt-2 border-top border-secondary">
                <span className="small text-secondary">ยังไม่มีบัญชีสมาชิก? </span>
                <Link href="/register" className="small text-info fw-bold text-decoration-none">
                  สมัครสมาชิกใหม่ที่นี่
                </Link>
              </div>

              {/* กล่องช่วยทดสอบบัญชีระบบ (Quick Login Demo) */}
              <div className="mt-4 p-3 bg-black bg-opacity-50 rounded-3 border border-secondary border-opacity-50">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="badge bg-secondary text-white">ทดสอบเข้าสู่ระบบ</span>
                  <small className="text-muted" style={{ fontSize: "0.75rem" }}>คลิกเพื่อกรอกอัตโนมัติ</small>
                </div>
                <div className="d-grid gap-2">
                  <button
                    type="button"
                    onClick={() => fillQuickAccount("admin@manga.com", "admin123")}
                    className="btn btn-sm btn-outline-warning text-start d-flex justify-content-between align-items-center"
                  >
                    <span>👑 <strong>Admin</strong>: admin@manga.com</span>
                    <span className="badge bg-warning text-dark">สิทธิ์แอดมิน</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillQuickAccount("member@manga.com", "member123")}
                    className="btn btn-sm btn-outline-info text-start d-flex justify-content-between align-items-center"
                  >
                    <span>👤 <strong>Member</strong>: member@manga.com</span>
                    <span className="badge bg-info text-dark">สิทธิ์สมาชิก</span>
                  </button>
                </div>
              </div>

              {/* ลิงก์กลับหน้าแรก */}
              <div className="text-center mt-3">
                <Link href="/" className="small text-muted text-decoration-none">
                  ← กลับสู่หน้าหลัก
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-vh-100 d-flex align-items-center justify-content-center"
          style={{
            background: "linear-gradient(135deg, #1e1e2f 0%, #12121a 100%)",
            color: "#f8f9fa",
          }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

