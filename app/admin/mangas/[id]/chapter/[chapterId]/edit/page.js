"use client";

import { useFormState } from "react-dom";
import { updateChapterAction, deletePageAction } from "@/app/admin/mangas/chapterActions";
import Link from "next/link";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function EditChapterPage({ params }) {
  const mangaId = Number(params.id);
  const chapterId = Number(params.chapterId);

  const [state, formAction] = useFormState(updateChapterAction, null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadMode, setUploadMode] = useState("replace");

  // State สำหรับเก็บข้อมูลตอนและรูปภาพเดิม
  const [chapterData, setChapterData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ดึงข้อมูลตอนเดิมพร้อมรายการรูปภาพ
  async function fetchChapter() {
    try {
      const res = await fetch(`/api/chapter/${chapterId}`);
      if (res.ok) {
        const data = await res.json();
        setChapterData(data);
      }
    } catch (err) {
      console.error("Error fetching chapter:", err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (chapterId) {
      fetchChapter();
    }
  }, [chapterId]);

  useEffect(() => {
    if (state?.error) {
      setIsSubmitting(false);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด!",
        text: state.error,
      });
    } else if (state?.success) {
      Swal.fire({
        icon: "success",
        title: "อัปเดตข้อมูลสำเร็จ!",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        window.location.href = `/admin/mangas/${mangaId}/chapter`;
      });
    }
  }, [state, mangaId]);

  // ฟังก์ชันลบรูปภาพเฉพาะหน้า
  const handleDeletePage = async (pageId, pageNumber) => {
    const result = await Swal.fire({
      title: `ลบรูปภาพหน้า ${pageNumber}?`,
      text: "รูปภาพนี้จะถูกลบออกจากระบบและไม่สามารถกู้คืนได้",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "ใช่, ลบเลย",
      cancelButtonText: "ยกเลิก",
    });

    if (result.isConfirmed) {
      Swal.fire({
        title: "กำลังลบรูปภาพ...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await deletePageAction(pageId, chapterId, mangaId);

      if (res?.success) {
        Swal.fire({
          icon: "success",
          title: "ลบรูปภาพสำเร็จ!",
          timer: 1200,
          showConfirmButton: false,
        });
        // โหลดข้อมูลรูปภาพใหม่
        fetchChapter();
      } else {
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด!",
          text: res?.error || "ไม่สามารถลบรูปภาพได้",
        });
      }
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    Swal.fire({
      title: "กำลังบันทึกข้อมูล...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });
  };

  if (isLoading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2 text-muted">กำลังโหลดข้อมูลตอน...</p>
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ maxWidth: "850px" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3>✏️ แก้ไขตอน (Chapter ID: {chapterId})</h3>
          <p className="text-muted mb-0 small">จัดการข้อมูลตอนและรูปภาพ</p>
        </div>
        <Link href={`/admin/mangas/${mangaId}/chapter`} className="btn btn-outline-secondary">
          ← ย้อนกลับ
        </Link>
      </div>

      <form action={formAction} onSubmit={handleSubmit} className="card p-4 shadow-sm" encType="multipart/form-data">
        <input type="hidden" name="chapter_id" value={chapterId} />
        <input type="hidden" name="manga_id" value={mangaId} />

        {/* ตอนที่ */}
        <div className="mb-3">
          <label className="form-label fw-bold">ตอนที่ (Chapter Number) *</label>
          <input
            type="number"
            step="0.1"
            name="chapter_number"
            defaultValue={chapterData?.chapter_number || ""}
            className="form-control"
            required
          />
        </div>

        {/* ชื่อตอน */}
        <div className="mb-3">
          <label className="form-label fw-bold">ชื่อตอน (Title)</label>
          <input
            type="text"
            name="title"
            defaultValue={chapterData?.title || ""}
            className="form-control"
            placeholder="เช่น จุดเริ่มต้นของการผจญภัย"
          />
        </div>

        {/* จัดการรูปภาพเดิมที่มีอยู่ */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <label className="form-label fw-bold mb-0">
              🖼️ จัดการรูปภาพปัจจุบัน ({chapterData?.pages?.length || 0} หน้า)
            </label>
            <span className="text-muted small">
              (สามารถกดปุ่ม ✕ สีแดงที่มุมรูปเพื่อลบเฉพาะหน้านั้นๆ ได้)
            </span>
          </div>

          <div
            className="p-3 border rounded bg-light d-flex flex-wrap gap-3"
            style={{ maxHeight: "360px", overflowY: "auto" }}
          >
            {!chapterData?.pages || chapterData.pages.length === 0 ? (
              <div className="w-100 text-center py-4 text-muted">
                ยังไม่มีรูปภาพในตอนนี้
              </div>
            ) : (
              chapterData.pages.map((page) => (
                <div
                  key={page.id}
                  className="position-relative text-center border rounded bg-white p-1 shadow-sm"
                  style={{ width: "100px" }}
                >
                  {/* ปุ่มลบรูปภาพเฉพาะหน้า */}
                  <button
                    type="button"
                    onClick={() => handleDeletePage(page.id, page.page_number)}
                    className="btn btn-danger btn-sm position-absolute top-0 end-0 p-0 d-flex align-items-center justify-content-center rounded-circle"
                    style={{ width: "22px", height: "22px", transform: "translate(30%, -30%)", zIndex: 10 }}
                    title={`ลบหน้า ${page.page_number}`}
                  >
                    ✕
                  </button>

                  <a href={page.image_url} target="_blank" rel="noreferrer" title="คลิกเพื่อดูรูปภาพขนาดเต็ม">
                    <img
                      src={page.image_url}
                      alt={`หน้า ${page.page_number}`}
                      className="rounded"
                      style={{ width: "90px", height: "120px", objectFit: "cover" }}
                    />
                  </a>

                  <div className="badge bg-dark mt-1 w-100">
                    หน้า {page.page_number}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* อัปโหลดรูปภาพใหม่ */}
        <div className="card p-3 mb-4 bg-light border-dashed">
          <label className="form-label fw-bold text-primary mb-2">
            📤 อัปโหลดรูปภาพเพิ่มเติม / แทนที่ (ถ้ามี)
          </label>

          <div className="mb-3 d-flex gap-4">
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="upload_mode"
                id="modeReplace"
                value="replace"
                checked={uploadMode === "replace"}
                onChange={(e) => setUploadMode(e.target.value)}
              />
              <label className="form-check-label fw-semibold" htmlFor="modeReplace">
                🔄 แทนที่รูปภาพทั้งหมดของตอนนี้
              </label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="upload_mode"
                id="modeAppend"
                value="append"
                checked={uploadMode === "append"}
                onChange={(e) => setUploadMode(e.target.value)}
              />
              <label className="form-check-label fw-semibold text-success" htmlFor="modeAppend">
                ➕ เพิ่มรูปต่อท้ายจากรูปเดิม
              </label>
            </div>
          </div>

          <input type="file" name="images" className="form-control" accept="image/*" multiple />
          <small className="text-muted d-block mt-1">
            {uploadMode === "replace"
              ? "* หากเลือกโหมดแทนที่ ระบบจะลบรูปภาพเดิมทั้งหมดและใช้รูปภาพชุดใหม่แทน"
              : "* โหมดเพิ่มต่อท้าย จะเก็บรูปภาพเดิมไว้ และนำรูปภาพชุดใหม่ไปต่อที่หน้าสุดท้าย"}
          </small>
        </div>

        <button type="submit" disabled={isSubmitting} className="btn btn-warning btn-lg w-100 fw-bold">
          {isSubmitting ? "กำลังบันทึก..." : "💾 บันทึกการแก้ไขข้อมูลตอน"}
        </button>
      </form>
    </div>
  );
}