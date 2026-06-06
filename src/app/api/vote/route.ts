import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { rateLimit, getClientKey } from "@/lib/rate-limit";
import { z } from "zod";

const voteSchema = z.object({
  candidateId: z.string().uuid(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = rateLimit(`vote:${session.user.id}`, 5, 60_000);
    if (!rl.success) {
      return NextResponse.json({ error: "Terlalu banyak percobaan. Silakan tunggu." }, { status: 429 });
    }

    const body = await req.json();
    const parsed = voteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const settings = await prisma.setting.findFirst();
    if (!settings?.votingOpen) {
      await logAudit(session.user.email, "VOTE_FAILED", "Voting closed");
      return NextResponse.json({ error: "Voting sedang ditutup" }, { status: 403 });
    }

    const candidate = await prisma.candidate.findUnique({ where: { id: parsed.data.candidateId } });
    if (!candidate) {
      return NextResponse.json({ error: "Kandidat tidak ditemukan" }, { status: 404 });
    }

    // Atomic transaction to prevent double voting
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { email: session.user.email! } });
      if (!user) throw new Error("USER_NOT_FOUND");
      if (user.hasVoted) throw new Error("ALREADY_VOTED");

      await tx.vote.create({
        data: { candidateId: parsed.data.candidateId },
      });

      const updated = await tx.user.update({
        where: { id: user.id },
        data: { hasVoted: true },
      });

      return updated;
    }).catch((err) => {
      if (err.message === "ALREADY_VOTED") return { error: "Anda sudah menggunakan hak suara." };
      if (err.message === "USER_NOT_FOUND") return { error: "User tidak ditemukan" };
      throw err;
    });

    if ("error" in result) {
      await logAudit(session.user.email, "VOTE_FAILED", result.error);
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    await logAudit(session.user.email, "VOTE_CAST", `Voted for candidate: ${candidate.name}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Vote error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
