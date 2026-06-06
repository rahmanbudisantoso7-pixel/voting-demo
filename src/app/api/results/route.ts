import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [candidates, totalVotes, totalUsers] = await Promise.all([
      prisma.candidate.findMany({
        orderBy: { number: "asc" },
        include: { _count: { select: { votes: true } } },
      }),
      prisma.vote.count(),
      prisma.user.count(),
    ]);

    const results = candidates.map((c) => ({
      candidateId: c.id,
      number: c.number,
      name: c.name,
      photo: c.photo,
      votes: c._count.votes,
      percentage: totalVotes > 0 ? (c._count.votes / totalVotes) * 100 : 0,
    }));

    return NextResponse.json({
      results,
      stats: {
        totalVotes,
        totalUsers,
        participation: totalUsers > 0 ? Math.round((totalVotes / totalUsers) * 100) : 0,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 });
  }
}
