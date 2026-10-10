"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import { toggleUserRoleAction, deleteUserAction } from "@/app/admin/users/actions";

export default function UserListTable({ users, currentUserId }) {
  const [loadingId, setLoadingId] = useState(null);

  const handleToggleRole = async (user) => {
    const actionText = user.role === "admin" ? "ลดสิทธิ์เป็น Member" : "เลื่อนขั้นเป็น Admin";
    const result = await Swal.fire({
      title: `ยืนยันการ${actionText}?`,
      text: `คุณต้องการเปลี่ยนสิทธิ์ของ "${user.name}" (${user.email}) ใช่หรือไม่?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#3085d6",
    });

    if (result.isConfirmed) {
      setLoadingId(user.id);
      try {
        const res = await toggleUserRoleAction(user.id);
        if (res.success) {
          Swal.fire({
            icon: "success",
            title: "สำเร็จ",
            text: res.message,
            timer: 1500,
            showConfirmButton: false,
          });
        } else {
          Swal.fire("ข้อผิดพลาด", res.error, "error");
        }
      } catch (err) {
        Swal.fire("ข้อผิดพลาด", err.message, "error");
      } finally {
        setLoadingId(null);
      }
    }
  };

  const handleDeleteUser = async (user) => {
    const result = await Swal.fire({
      title: "ยืนยันการลบผู้ใช้?",
      text: `คุณต้องการลบบัญชี "${user.name}" (${user.email}) ออกจากระบบอย่างถาวรหรือไม่?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ใช่, ลบเลย",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#d33",
    });

    if (result.isConfirmed) {
      setLoadingId(user.id);
      try {
        const res = await deleteUserAction(user.id);
        if (res.success) {
          Swal.fire({
            icon: "success",
            title: "ลบสำเร็จ",
            text: res.message,
            timer: 1500,
            showConfirmButton: false,
          });
        } else {
          Swal.fire("ข้อผิดพลาด", res.error, "error");
        }
      } catch (err) {
        Swal.fire("ข้อผิดพลาด", err.message, "error");
      } finally {
        setLoadingId(null);
      }
    }
  };

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th scope="col" style={{ width: "60px" }}>ID</th>
            <th scope="col">ชื่อผู้ใช้</th>
            <th scope="col">อีเมล</th>
            <th scope="col">สิทธิ์ (Role)</th>
            <th scope="col">วันที่สมัคร</th>
            <th scope="col" className="text-end" style={{ width: "200px" }}>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center py-4 text-muted">
                ไม่พบข้อมูลผู้ใช้ในระบบ
              </td>
            </tr>
          ) : (
            users.map((u) => {
              const isSelf = u.id === currentUserId;
              const isAdmin = u.role === "admin";

              return (
                <tr key={u.id}>
                  <td className="fw-bold text-muted">#{u.id}</td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                        style={{
                          width: "36px",
                          height: "36px",
                          backgroundColor: isAdmin ? "#f59e0b" : "#3b82f6",
                          fontSize: "0.9rem",
                        }}
                      >
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="fw-semibold text-dark">
                          {u.name} {isSelf && <span className="badge bg-secondary ms-1">คุณ</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="text-muted">{u.email}</td>
                  <td>
                    <span className={`badge ${isAdmin ? "bg-warning text-dark" : "bg-primary"}`}>
                      {isAdmin ? "👑 Admin" : "👤 Member"}
                    </span>
                  </td>
                  <td className="small text-muted" suppressHydrationWarning>
                    {u.created_at
                      ? new Date(u.created_at).toLocaleString("th-TH", {
                          timeZone: "Asia/Bangkok",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </td>
                  <td className="text-end">
                    <div className="d-flex justify-content-end gap-1">
                      <button
                        type="button"
                        onClick={() => handleToggleRole(u)}
                        disabled={isSelf || loadingId === u.id}
                        className={`btn btn-sm ${isAdmin ? "btn-outline-primary" : "btn-outline-warning"}`}
                        title={isAdmin ? "ลดสิทธิ์เป็น Member" : "เลื่อนสิทธิ์เป็น Admin"}
                      >
                        {isAdmin ? (
                          <>
                            <i className="bi bi-person-down me-1"></i>
                            <span className="small">ลดสิทธิ์</span>
                          </>
                        ) : (
                          <>
                            <i className="bi bi-shield-check me-1"></i>
                            <span className="small">ตั้งเป็น Admin</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteUser(u)}
                        disabled={isSelf || loadingId === u.id}
                        className="btn btn-sm btn-outline-danger"
                        title="ลบผู้ใช้"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
