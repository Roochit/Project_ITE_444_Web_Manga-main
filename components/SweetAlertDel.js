"use client";

import Swal from "sweetalert2";

export default function SweetAlertDel() {
  const handleDelete = (e) => {
    e.preventDefault();
    const form = e.target.closest("form");

    Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "หากลบแล้วจะไม่สามารถกู้คืนข้อมูลนี้ได้!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "ใช่, ลบเลย!",
      cancelButtonText: "ยกเลิก",
    }).then((result) => {
      if (result.isConfirmed) {
        form.submit();
      }
    });
  };

  return (
    <button type="button" onClick={handleDelete} className="btn btn-danger btn-sm">
      Delete
    </button>
  );
}