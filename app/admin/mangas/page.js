import NavbarAdmin from "@/components/NavbarAdmin";
import BootstrapClient from "@/components/BootstrapClient";
import SweetAlertDel from "@/components/SweetAlertDel";
import SuccessAlert from "@/components/SuccessAlert";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export default async function AdminMangasPage() {
  // Server Action สำหรับลบมังงะ
  async function deleteManga(formData) {
    "use server";
    const id = Number(formData.get("id"));

    try {
      // ดึงข้อมูลมังงะและรูปภาพของทุกตอนเพื่อลบไฟล์ออกจากเครื่อง
      const manga = await prisma.mangas.findUnique({
        where: { id },
        include: {
          chapters: {
            include: {
              pages: true,
            },
          },
        },
      });

      if (manga) {
        // ลบรูปภาพหน้าปก (หากบันทึกไว้ในโฟลเดอร์ uploads)
        if (manga.cover_url && manga.cover_url.startsWith("/uploads/")) {
          const coverPath = path.join(process.cwd(), "public", manga.cover_url);
          await fs.unlink(coverPath).catch(() => {});
        }

        // ลบรูปภาพทั้งหมดของทุกตอน
        for (const chapter of manga.chapters) {
          for (const page of chapter.pages) {
            if (page.image_url && page.image_url.startsWith("/uploads/")) {
              const pagePath = path.join(process.cwd(), "public", page.image_url);
              await fs.unlink(pagePath).catch(() => {});
            }
          }
        }
      }

      await prisma.mangas.delete({
        where: { id },
      });
      revalidatePath("/admin/mangas");
      revalidatePath("/");
    } catch (error) {
      console.error("Error deleting manga:", error);
    }
  }

  // ดึงรายการมังงะทั้งหมดพร้อมนับจำนวนตอน (Chapters) ในแต่ละเรื่อง
  const mangas = await prisma.mangas.findMany({
    orderBy: { id: "desc" },
    include: {
      _count: {
        select: { chapters: true },
      },
    },
  });

  return (
    <>
      <SuccessAlert />
      <NavbarAdmin />
      <BootstrapClient />


      <div className="container mt-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>จัดการรายการมังงะ</h1>
          <Link className="btn btn-primary" href="/admin/mangas/create">
            + เพิ่มมังงะเรื่องใหม่
          </Link>
        </div>

        <div className="row">
          <div className="table-responsive">
            <table className="table table-bordered table-striped align-middle">
              <thead>
                <tr>
                  <th width="5%" className="text-center">
                    ID
                  </th>
                  <th width="10%" className="text-center">
                    รูปปก
                  </th>
                  <th>ชื่อเรื่อง</th>
                  <th width="15%">ผู้แต่ง</th>
                  <th width="10%" className="text-center">
                    สถานะ
                  </th>
                  <th width="12%" className="text-center">
                    จัดการตอน
                  </th>
                  <th width="8%" className="text-center">
                    แก้ไข
                  </th>
                  <th width="8%" className="text-center">
                    ลบ
                  </th>
                </tr>
              </thead>

              <tbody>
                {mangas.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-muted">
                      ยังไม่มีข้อมูลมังงะในระบบ
                    </td>
                  </tr>
                ) : (
                  mangas.map((manga) => (
                    <tr key={manga.id}>
                      <td className="text-center">{manga.id}</td>
                      <td className="text-center">
                        <img
                          src={
                            manga.cover_url ||
                            "https://via.placeholder.com/70x100?text=No+Cover"
                          }
                          alt={manga.title}
                          width="70"
                          height="100"
                          style={{ objectFit: "cover", borderRadius: "4px" }}
                        />
                      </td>
                      <td>
                        <strong>{manga.title}</strong>
                      </td>
                      <td>{manga.author || "-"}</td>
                      <td className="text-center">
                        <span
                          className={`badge ${
                            manga.status === "completed"
                              ? "bg-success"
                              : "bg-warning text-dark"
                          }`}
                        >
                          {manga.status === "completed" ? "จบแล้ว" : "ยังไม่จบ"}
                        </span>
                      </td>

                      <td className="text-center">
                        <Link
                          href={`/admin/mangas/${manga.id}/chapter`}
                          className="btn btn-sm btn-outline-primary fw-bold"
                        >
                          ⚙️ จัดการตอน ({manga._count?.chapters || 0})
                        </Link>
                      </td>

                      <td className="text-center">
                        <Link
                          href={`/admin/mangas/update/${manga.id}`}
                          className="btn btn-warning btn-sm"
                        >
                          Edit
                        </Link>
                      </td>

                      <td className="text-center">
                        <form action={deleteManga}>
                          <input type="hidden" name="id" value={manga.id} />
                          <SweetAlertDel />
                        </form>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
