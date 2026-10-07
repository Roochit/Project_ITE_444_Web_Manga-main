"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { useState } from "react";
import { createManga } from "@/app/admin/mangas/create/actions";

export default function CreateMangaForm() {
  const [state, formAction] = useFormState(createManga, null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const values = state?.values || {};

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  return (
    <form
      action={formAction}
      onSubmit={() => setIsSubmitting(true)}
      className="card p-4 shadow-sm"
      encType="multipart/form-data"
    >
      {state?.errors && state.errors.length > 0 && (
        <div className="alert alert-danger mb-4">
          <ul className="mb-0 ps-3">
            {state.errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-3">
        <label className="form-label fw-bold">ชื่อเรื่อง (Title) *</label>
        <input
          type="text"
          name="title"
          className="form-control"
          placeholder="เช่น One Piece, Naruto"
          defaultValue={values.title || ""}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label fw-bold">ผู้แต่ง (Author)</label>
        <input
          type="text"
          name="author"
          className="form-control"
          placeholder="เช่น Eiichiro Oda"
          defaultValue={values.author || ""}
        />
      </div>

      <div className="mb-3">
        <label className="form-label fw-bold">อัปโหลดรูปหน้าปก (Cover Image) *</label>
        <input
          type="file"
          name="cover_image"
          className="form-control"
          accept="image/*"
          onChange={handleImageChange}
          required
        />
        {previewUrl && (
          <div className="mt-3 text-center">
            <p className="text-muted small mb-1">ตัวอย่างรูปภาพหน้าปก:</p>
            <img
              src={previewUrl}
              alt="Cover preview"
              className="img-thumbnail"
              style={{ maxHeight: "200px", objectFit: "cover" }}
            />
          </div>
        )}
      </div>

      <div className="mb-3">
        <label className="form-label fw-bold">สถานะ (Status)</label>
        <select
          name="status"
          className="form-select"
          defaultValue={values.status || "ongoing"}
        >
          <option value="ongoing">ยังไม่จบ (Ongoing)</option>
          <option value="completed">จบแล้ว (Completed)</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label fw-bold">เรื่องย่อ (Description) *</label>
        <textarea
          name="description"
          className="form-control"
          rows="4"
          placeholder="ใส่เรื่องย่อสั้นๆ อย่างน้อย 5 ตัวอักษร..."
          defaultValue={values.description || ""}
          required
        ></textarea>
      </div>

      <div className="d-flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary fw-bold"
        >
          {isSubmitting ? "กำลังบันทึกข้อมูล..." : "บันทึกข้อมูล"}
        </button>
        <Link href="/admin/mangas" className="btn btn-secondary">
          ยกเลิก
        </Link>
      </div>
    </form>
  );
}