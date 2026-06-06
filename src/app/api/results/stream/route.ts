import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendData = async () => {
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

          const payload = JSON.stringify({
            results,
            stats: {
              totalVotes,
              totalUsers,
              participation: totalUsers > 0 ? Math.round((totalVotes / totalUsers) * 100) : 0,
            },
            timestamp: Date.now(),
          });

          controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
        } catch (e) {
          console.error("Stream error:", e);
        }
      };

      await sendData();
      const interval = setInterval(sendData, 3000);

      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
