import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.setting.findFirst();
    if (!settings) {
      return NextResponse.json({
        votingOpen: false,
        startDate: null,
        endDate: null,
        electionName: "Pemilihan Ketua Senat Kampus",
      });
    }
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}
