"use client";

import { useFormState } from "react-dom";
import { createChapterAction } from "@/app/admin/mangas/chapterActions";
import Link from "next/link";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function AddChapterPage({ params }) {
  const mangaId = Number(params.id);
  const [state, formAction] = useFormState(createChapterAction, null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    // ถ้าเกิดข้อผิดพลาด
    if (state?.error) {
      setIsUploading(false);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด!",
        text: state.error,
        confirmButtonColor: "#dc3545",
      });
    } 
    // ถ้าบันทึกสำเร็จ (Server Action ส่ง success มา)
    else if (state?.success) {
      Swal.fire({
        icon: "success",
        title: "เพิ่มตอนใหม่เรียบร้อย!",
        text: "อัปโหลดรูปภาพและบันทึกข้อมูลสำเร็จแล้ว",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        window.location.href = `/admin/mangas/${mangaId}/chapter`;
      });
    }
  }, [state, mangaId]);

  const handleSubmit = () => {
    setIsUploading(true);
    Swal.fire({
      title: "กำลังอัปโหลดไฟล์...",
      text: "โปรดรอสักครู่ ระบบกำลังบันทึกรูปภาพลงเซิร์ฟเวอร์",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  };

  return (
    <div className="container py-4" style={{ maxWidth: "700px" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>เพิ่มตอนใหม่ (Manga ID: {mangaId})</h3>
        <Link href={`/admin/mangas/${mangaId}/chapter`} className="btn btn-outline-secondary">
          ย้อนกลับ
        </Link>
      </div>

      <form
        action={formAction}
        onSubmit={handleSubmit}
        className="card p-4 shadow-sm"
        encType="multipart/form-data"
      >
        <input type="hidden" name="manga_id" value={mangaId} />

        <div className="mb-3">
          <label className="form-label fw-bold">ตอนที่ (Chapter Number) *</label>
          <input
            type="number"
            step="0.1"
            name="chapter_number"
            className="form-control"
            placeholder="เช่น 1 หรือ 1.5"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">ชื่อตอน (Title) - ถ้ามี</label>
          <input
            type="text"
            name="title"
            className="form-control"
            placeholder="เช่น จุดเริ่มต้นของการเดินทาง"
          />
        </div>

        <div className="mb-4">
          <label className="form-label fw-bold">เลือกไฟล์รูปภาพการ์ตูน *</label>
          <input
            type="file"
            name="images"
            className="form-control"
            accept="image/*"
            multiple
            required
          />
          <small className="form-text text-muted">
            * กด Ctrl หรือ Shift เลือกไฟล์รูปภาพพร้อมกันหลายๆ รูปได้เลย
          </small>
        </div>

        <button
          type="submit"
          disabled={isUploading}
          className="btn btn-primary btn-lg w-100"
        >
          {isUploading ? "กำลังอัปโหลด..." : "อัปโหลดไฟล์และเพิ่มตอน"}
        </button>
      </form>
    </div>
  );
}