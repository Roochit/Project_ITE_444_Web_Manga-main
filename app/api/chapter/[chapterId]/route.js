import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const chapterId = Number(resolvedParams.chapterId);

    const chapter = await prisma.chapters.findUnique({
      where: { id: chapterId },
      include: {
        pages: {
          orderBy: { page_number: "asc" },
        },
      },
    });

    if (!chapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    return NextResponse.json(chapter);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
