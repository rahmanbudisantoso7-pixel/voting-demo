import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    const candidates = await prisma.candidate.findMany({
      orderBy: { number: "asc" },
      select: {
        id: true,
        number: true,
        name: true,
        prodi: true,
        photo: true,
        vision: true,
        mission: true,
      },
    });
    return NextResponse.json(candidates);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch candidates" }, { status: 500 });
  }
}
