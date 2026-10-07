import NavbarAdmin from "@/components/NavbarAdmin";
import BootstrapClient from "@/components/BootstrapClient";
import CreateMangaForm from "@/components/CreateMangaForm";


export default function CreateMangaPage() {
  return (
    <>
      <NavbarAdmin />
      <BootstrapClient />

      <div className="container mt-5" style={{ maxWidth: "700px" }}>
        <h1 className="mb-4">➕ เพิ่มมังงะเรื่องใหม่</h1>

        <CreateMangaForm />
      </div>
    </>
  );
}