import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Vote, TrendingUp, Activity, ShieldCheck, BarChart3, Settings, FileText, UserCog } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!session.user.isAdmin) redirect("/");

  const [totalUsers, totalVoters, totalVotes, totalCandidates, recentLogs, settings] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { hasVoted: true } }),
    prisma.vote.count(),
    prisma.candidate.count(),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.setting.findFirst(),
  ]);

  const participation = totalUsers > 0 ? Math.round((totalVoters / totalUsers) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <Badge variant="outline" className="mb-2">
                <ShieldCheck className="h-3 w-3 mr-1" /> Admin Panel
              </Badge>
              <h1 className="text-3xl font-bold">Dashboard Admin</h1>
              <p className="text-muted-foreground">Kelola pemilihan dan pantau partisipasi pemilih</p>
            </div>
            <Badge variant={settings?.votingOpen ? "success" : "destructive"} className="text-sm px-3 py-1">
              {settings?.votingOpen ? "Voting Dibuka" : "Voting Ditutup"}
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalUsers}</p>
                    <p className="text-xs text-muted-foreground">Mahasiswa Login</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                    <Vote className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalVotes}</p>
                    <p className="text-xs text-muted-foreground">Suara Masuk</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{participation}%</p>
                    <p className="text-xs text-muted-foreground">Partisipasi</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600">
                    <UserCog className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalCandidates}</p>
                    <p className="text-xs text-muted-foreground">Kandidat</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <Link href="/admin/candidates" className="block">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardContent className="pt-6 flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <UserCog className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Manajemen Kandidat</h3>
                    <p className="text-sm text-muted-foreground">Tambah, edit, atau hapus kandidat ketua senat</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/admin/settings" className="block">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardContent className="pt-6 flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Settings className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Pengaturan Voting</h3>
                    <p className="text-sm text-muted-foreground">Buka/tutup voting & atur jadwal pemilihan</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/admin/audit" className="block">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardContent className="pt-6 flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Audit Log</h3>
                    <p className="text-sm text-muted-foreground">Lihat aktivitas login, voting, dan admin</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" /> Export Hasil
                </CardTitle>
                <CardDescription>Unduh hasil pemilihan</CardDescription>
              </CardHeader>
              <CardContent className="flex gap-3">
                <Button asChild>
                  <a href="/api/export/pdf" target="_blank" rel="noopener">Export PDF</a>
                </Button>
                <Button asChild variant="outline">
                  <a href="/api/export/excel" target="_blank" rel="noopener">Export Excel</a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" /> Aktivitas Terbaru
                </CardTitle>
                <CardDescription>Log aktivitas sistem</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {recentLogs.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Belum ada aktivitas</p>
                  ) : (
                    recentLogs.map((log) => (
                      <div key={log.id} className="flex items-start gap-2 p-2 rounded-md hover:bg-muted/50 text-sm">
                        <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{log.action}</p>
                          <p className="text-xs text-muted-foreground truncate">{log.userEmail}</p>
                        </div>
                        <p className="text-xs text-muted-foreground shrink-0">
                          {new Date(log.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
