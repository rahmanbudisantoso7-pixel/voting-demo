import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import ExcelJS from "exceljs";

export async function GET() {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const [candidates, totalVotes, totalUsers, settings] = await Promise.all([
      prisma.candidate.findMany({
        orderBy: { number: "asc" },
        include: { _count: { select: { votes: true } } },
      }),
      prisma.vote.count(),
      prisma.user.count(),
      prisma.setting.findFirst(),
    ]);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Hasil Voting");

    sheet.columns = [
      { header: "No", key: "number", width: 8 },
      { header: "Nama Kandidat", key: "name", width: 30 },
      { header: "Jumlah Suara", key: "votes", width: 16 },
      { header: "Persentase", key: "percentage", width: 14 },
    ];

    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF3B82F6" } };
    sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

    candidates.forEach((c) => {
      sheet.addRow({
        number: c.number,
        name: c.name,
        votes: c._count.votes,
        percentage: totalVotes > 0 ? `${((c._count.votes / totalVotes) * 100).toFixed(2)}%` : "0%",
      });
    });

    sheet.addRow({});
    sheet.addRow({ name: "Total Suara Masuk", votes: totalVotes });
    sheet.addRow({ name: "Total Mahasiswa Terdaftar", votes: totalUsers });
    sheet.addRow({ name: "Partisipasi", votes: totalUsers > 0 ? `${Math.round((totalVotes / totalUsers) * 100)}%` : "0%" });

    const buffer = await workbook.xlsx.writeBuffer();

    await logAudit(session.user.email!, "ADMIN_EXPORT_EXCEL");

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="hasil-voting-${Date.now()}.xlsx"`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to export" }, { status: 500 });
  }
}
