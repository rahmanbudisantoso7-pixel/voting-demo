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

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = candidateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const existing = await prisma.candidate.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (existing.number !== parsed.data.number) {
      const conflict = await prisma.candidate.findUnique({ where: { number: parsed.data.number } });
      if (conflict) {
        return NextResponse.json({ error: `Nomor urut ${parsed.data.number} sudah digunakan` }, { status: 400 });
      }
    }

    const candidate = await prisma.candidate.update({
      where: { id },
      data: {
        number: parsed.data.number,
        name: parsed.data.name,
        prodi: parsed.data.prodi,
        photo: parsed.data.photo || null,
        vision: parsed.data.vision,
        mission: parsed.data.mission,
      },
    });

    await logAudit(session.user.email!, "ADMIN_CANDIDATE_UPDATE", `Updated: ${candidate.name} (#${candidate.number})`);

    return NextResponse.json(candidate);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update candidate" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await params;
    const existing = await prisma.candidate.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.candidate.delete({ where: { id } });
    await logAudit(session.user.email!, "ADMIN_CANDIDATE_DELETE", `Deleted: ${existing.name} (#${existing.number})`);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete candidate" }, { status: 500 });
  }
}
