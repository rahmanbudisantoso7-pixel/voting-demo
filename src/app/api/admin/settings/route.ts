import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { z } from "zod";

const settingsSchema = z.object({
  votingOpen: z.boolean().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  electionName: z.string().optional(),
});

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const existing = await prisma.setting.findFirst();
    const updates: any = {};
    if (parsed.data.votingOpen !== undefined) updates.votingOpen = parsed.data.votingOpen;
    if (parsed.data.startDate !== undefined) updates.startDate = parsed.data.startDate ? new Date(parsed.data.startDate) : null;
    if (parsed.data.endDate !== undefined) updates.endDate = parsed.data.endDate ? new Date(parsed.data.endDate) : null;
    if (parsed.data.electionName !== undefined) updates.electionName = parsed.data.electionName;

    let settings;
    if (existing) {
      settings = await prisma.setting.update({ where: { id: existing.id }, data: updates });
    } else {
      settings = await prisma.setting.create({
        data: { id: "singleton", ...updates },
      });
    }

    if (parsed.data.votingOpen !== undefined) {
      await logAudit(
        session.user.email!,
        parsed.data.votingOpen ? "ADMIN_VOTING_OPEN" : "ADMIN_VOTING_CLOSE"
      );
    } else {
      await logAudit(session.user.email!, "ADMIN_VOTING_SETTINGS_UPDATE", JSON.stringify(parsed.data));
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
