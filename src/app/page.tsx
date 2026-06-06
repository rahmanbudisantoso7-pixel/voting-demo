import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";
import { Calendar, ShieldCheck, Vote, Users, BarChart3, Lock } from "lucide-react";
import { formatDateOnly } from "@/lib/utils";

export default async function HomePage() {
  const [settings, candidateCount, totalUsers, totalVotes] = await Promise.all([
    prisma.setting.findFirst(),
    prisma.candidate.count(),
    prisma.user.count(),
    prisma.vote.count(),
  ]);

  const electionName = settings?.electionName || "Pemilihan Ketua Senat Kampus";
  const votingOpen = settings?.votingOpen || false;
  const startDate = settings?.startDate;
  const endDate = settings?.endDate;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="relative overflow-hidden gradient-bg text-white">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="container relative py-20 md:py-32">
            <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <Vote className="h-3 w-3 mr-1" /> Sistem E-Voting Kampus UNHAN RI
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                {electionName}
              </h1>
              <p className="text-lg md:text-xl text-white/80">
                Gunakan hak suara Anda untuk Pemilihan Ketua yang aman, transparan, dan dapat diverifikasi.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Button asChild size="xl" variant="secondary" className="text-primary">
                  <Link href="/login">
                    <Lock className="h-5 w-5" />
                    Login dengan Microsoft
                  </Link>
                </Button>
                <Button asChild size="xl" variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20">
                  <Link href="/hasil">Lihat Hasil</Link>
                </Button>
              </div>
              {votingOpen ? (
                <Badge className="bg-emerald-500 text-white text-sm px-4 py-1.5">
                  <span className="relative flex h-2 w-2 mr-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  Voting Sedang Dibuka
                </Badge>
              ) : (
                <Badge className="bg-red-500 text-white text-sm px-4 py-1.5">
                  Voting Belum Dibuka
                </Badge>
              )}
            </div>
          </div>
        </section>

        <section className="container py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Kandidat", value: candidateCount, icon: Users },
              { label: "Mahasiswa Terdaftar", value: totalUsers, icon: ShieldCheck },
              { label: "Suara Masuk", value: totalVotes, icon: Vote },
              { label: "Partisipasi", value: totalUsers > 0 ? `${Math.round((totalVotes / totalUsers) * 100)}%` : "0%", icon: BarChart3 },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="container py-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Jadwal Pemilihan</h2>
              <p className="text-muted-foreground mb-6">
                Pastikan Anda tidak melewatkan periode pemilihan. Login dengan akun Microsoft kampus Anda untuk memberikan suara.
              </p>
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-semibold">Tanggal Mulai</p>
                      <p className="text-sm text-muted-foreground">
                        {startDate ? formatDateOnly(startDate) : "Akan diumumkan"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-semibold">Tanggal Selesai</p>
                      <p className="text-sm text-muted-foreground">
                        {endDate ? formatDateOnly(endDate) : "Akan diumumkan"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-4">
              {[
                { icon: ShieldCheck, title: "Aman & Terverifikasi", desc: "Login menggunakan akun Microsoft Entra ID kampus Anda." },
                { icon: Lock, title: "Privasi Terjaga", desc: "Identitas pemilih tidak terhubung dengan pilihan suara." },
                { icon: BarChart3, title: "Realtime Result", desc: "Pantau hasil pemilihan secara langsung dan transparan." },
              ].map((f) => (
                <Card key={f.title}>
                  <CardContent className="pt-6 flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <f.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{f.title}</h3>
                      <p className="text-sm text-muted-foreground">{f.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; 2026 SenatVote. Sistem E-Voting Kampus UNHAN RI by CDE.</p>
        </div>
      </footer>
    </div>
  );
}
