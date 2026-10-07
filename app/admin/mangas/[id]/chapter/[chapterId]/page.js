import Link from "next/link";
import NavbarAdmin from "@/components/NavbarAdmin";

export const dynamic = "force-dynamic";

export default async function AdminChapterDetailPage({ params }) {
  const resolvedParams = await params;
  const mangaId = Number(resolvedParams.id);
  const chapterId = Number(resolvedParams.chapterId);

  return (
    <>
      <NavbarAdmin />
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3>รายละเอียดตอน (Chapter ID: {chapterId})</h3>
          <Link href={`/admin/mangas/${mangaId}/chapter`} className="btn btn-outline-secondary">
            ← ย้อนกลับ
          </Link>
        </div>
        <div className="alert alert-info">
          หน้านี้เตรียมไว้สำหรับการพัฒนาเพิ่มเติมในอนาคต
        </div>
      </div>
    </>
  );
}

