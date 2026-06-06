import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Hasil Pemilihan Ketua Senat Kampus", 14, 20);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Dicetak: ${new Date().toLocaleString("id-ID")}`, 14, 28);

    autoTable(doc, {
      startY: 35,
      head: [["No", "Nama Kandidat", "Jumlah Suara", "Persentase"]],
      body: candidates.map((c) => [
        c.number,
        c.name,
        c._count.votes,
        totalVotes > 0 ? `${((c._count.votes / totalVotes) * 100).toFixed(2)}%` : "0%",
      ]),
      headStyles: { fillColor: [59, 130, 246] },
    });

    const finalY = (doc as any).lastAutoTable.finalY || 100;
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Ringkasan:", 14, finalY + 10);
    doc.setFontSize(10);
    doc.text(`Total Suara Masuk: ${totalVotes}`, 14, finalY + 18);
    doc.text(`Total Mahasiswa Terdaftar: ${totalUsers}`, 14, finalY + 25);
    doc.text(`Partisipasi: ${totalUsers > 0 ? Math.round((totalVotes / totalUsers) * 100) : 0}%`, 14, finalY + 32);

    const pdfBuffer = doc.output("arraybuffer");

    await logAudit(session.user.email!, "ADMIN_EXPORT_PDF");

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="hasil-voting-${Date.now()}.pdf"`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to export" }, { status: 500 });
  }
}
