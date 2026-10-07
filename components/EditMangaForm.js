"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { useState } from "react";

export default function EditMangaForm({ manga, updateMangaAction }) {
  const [state, formAction] = useFormState(updateMangaAction, null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const values = state?.values || manga;

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
      <input type="hidden" name="id" value={manga.id} />
      <input type="hidden" name="existing_cover_url" value={values.cover_url || ""} />

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
          defaultValue={values.title}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label fw-bold">ผู้แต่ง (Author)</label>
        <input
          type="text"
          name="author"
          className="form-control"
          defaultValue={values.author || ""}
        />
      </div>

      <div className="mb-3">
        <label className="form-label fw-bold">รูปหน้าปก (Cover Image)</label>
        <div className="d-flex align-items-center gap-3 mb-2">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="New preview"
              className="img-thumbnail"
              style={{ width: "90px", height: "130px", objectFit: "cover" }}
            />
          ) : values.cover_url ? (
            <img
              src={values.cover_url}
              alt="Current cover"
              className="img-thumbnail"
              style={{ width: "90px", height: "130px", objectFit: "cover" }}
            />
          ) : (
            <span className="text-muted small">ไม่มีรูปภาพ</span>
          )}
          <div>
            <input
              type="file"
              name="cover_image"
              className="form-control"
              accept="image/*"
              onChange={handleImageChange}
            />
            <small className="text-muted d-block mt-1">
              * หากไม่ต้องการเปลี่ยนรูปภาพหน้าปก ให้เว้นว่างไว้
            </small>
          </div>
        </div>
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
          defaultValue={values.description || ""}
          required
        ></textarea>
      </div>

      <div className="d-flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-warning fw-bold"
        >
          {isSubmitting ? "กำลังอัปเดต..." : "อัปเดตข้อมูล"}
        </button>
        <Link href="/admin/mangas" className="btn btn-secondary">
          ยกเลิก
        </Link>
      </div>
    </form>
  );
}