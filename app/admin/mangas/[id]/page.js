import { redirect } from "next/navigation";

export default async function MangaIdRedirectPage({ params }) {
  const resolvedParams = await params;
  const mangaId = Number(resolvedParams.id);
  redirect(`/admin/mangas/${mangaId}/chapter`);
}