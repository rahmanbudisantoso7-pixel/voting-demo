import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { z } from "zod";

const candidateSchema = z.object({
  number: z.number().int().min(1),
  name: z.string().min(1).max(100),
  prodi: z.string().min(1).max(100),
  photo: z.string().min(1).nullable().optional(),
  vision: z.string().min(1),
  mission: z.string().min(1),
});

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.isAdmin) return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const candidates = await prisma.candidate.findMany({
    orderBy: { number: "asc" },
    include: { _count: { select: { votes: true } } },
  });
  return NextResponse.json(candidates);
}

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const parsed = candidateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data", issues: parsed.error.issues }, { status: 400 });
    }

    const existing = await prisma.candidate.findUnique({ where: { number: parsed.data.number } });
    if (existing) {
      return NextResponse.json({ error: `Nomor urut ${parsed.data.number} sudah digunakan` }, { status: 400 });
    }

    const candidate = await prisma.candidate.create({
      data: {
        number: parsed.data.number,
        name: parsed.data.name,
        prodi: parsed.data.prodi,
        photo: parsed.data.photo || null,
        vision: parsed.data.vision,
        mission: parsed.data.mission,
      },
    });

    await logAudit(session.user.email!, "ADMIN_CANDIDATE_CREATE", `Created: ${candidate.name} (#${candidate.number})`);

    return NextResponse.json(candidate, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create candidate" }, { status: 500 });
  }
}
