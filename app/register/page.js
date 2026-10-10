"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";
import { registerAction } from "./actions";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("confirmPassword", confirmPassword);

      const res = await registerAction(formData);

      if (res.success) {
        await Swal.fire({
          icon: "success",
          title: "สมัครสมาชิกสำเร็จ!",
          text: `ยินดีต้อนรับคุณ ${res.user.name} เข้าสู่ระบบเรียบร้อยแล้ว`,
          timer: 2000,
          showConfirmButton: false,
        });

        window.location.href = res.redirectUrl || "/";
      } else {
        setErrorMessage(res.error || "สมัครสมาชิกไม่สำเร็จ");
        Swal.fire({
          icon: "error",
          title: "ไม่สามารถสมัครสมาชิกได้",
          text: res.error || "เกิดข้อผิดพลาดในการลงทะเบียน",
        });
      }
    } catch (err) {
      setErrorMessage("เกิดข้อผิดพลาดในการเชื่อมต่อ: " + err.message);
    } finally {
      setLoading(false);
    }
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
              <p className="text-muted small">สมัครสมาชิกเพื่อเข้าอ่านมังงะและร่วมคอมเมนต์</p>
            </div>

            {/* กล่องแบบฟอร์มสมัครสมาชิก */}
            <div className="card shadow-lg border-0 rounded-4 bg-dark text-white p-4 p-md-5">
              <div className="text-center mb-4">
                <h2 className="h4 fw-bold mb-1">📝 สมัครสมาชิกใหม่</h2>
                <p className="text-secondary small mb-0">กรอกข้อมูลเพื่อสร้างบัญชีสมาชิก (Member)</p>
              </div>

              {errorMessage && (
                <div className="alert alert-danger d-flex align-items-center py-2 px-3 mb-4 rounded-3" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                  <div className="small">{errorMessage}</div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* ชื่อผู้ใช้ */}
                <div className="mb-3">
                  <label className="form-label small text-secondary fw-semibold">ชื่อ-นามสกุล หรือชื่อเล่น</label>
                  <div className="input-group">
                    <span className="input-group-text bg-secondary border-0 text-white">
                      <i className="bi bi-person"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control bg-secondary text-white border-0"
                      placeholder="เช่น สมชาย ใจดี"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

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
                <div className="mb-3">
                  <label className="form-label small text-secondary fw-semibold">รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)</label>
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
                      minLength={6}
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

                {/* Confirm Password */}
                <div className="mb-4">
                  <label className="form-label small text-secondary fw-semibold">ยืนยันรหัสผ่านอีกครั้ง</label>
                  <div className="input-group">
                    <span className="input-group-text bg-secondary border-0 text-white">
                      <i className="bi bi-shield-check"></i>
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control bg-secondary text-white border-0"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                {/* ปุ่มส่งฟอร์ม */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-success w-100 py-2 fw-bold rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      <span>กำลังสมัครสมาชิก...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-person-plus-fill"></i>
                      <span>ยืนยันการสมัครสมาชิก</span>
                    </>
                  )}
                </button>
              </form>

              {/* ลิงก์ไปหน้าเข้าสู่ระบบ */}
              <div className="text-center mt-4 pt-2 border-top border-secondary">
                <span className="small text-secondary">มีบัญชีผู้ใช้อยู่แล้ว? </span>
                <Link href="/login" className="small text-info fw-bold text-decoration-none">
                  เข้าสู่ระบบที่นี่
                </Link>
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
