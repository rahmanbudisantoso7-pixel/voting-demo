import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Vote, Sparkles, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function VotingSuccessPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const settings = await prisma.setting.findFirst();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="overflow-hidden border-0 shadow-2xl">
            <div className="gradient-bg p-8 text-white text-center">
              <div className="flex justify-center mb-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <CheckCircle2 className="h-12 w-12" />
                </div>
              </div>
              <h1 className="text-3xl font-bold mb-2">Terima Kasih!</h1>
              <p className="text-white/90">Suara Anda telah berhasil direkam.</p>
            </div>
            <CardContent className="p-8 space-y-6">
              <div className="text-center space-y-2">
                <Badge variant="success" className="text-sm px-4 py-1">
                  <Vote className="h-3 w-3 mr-1" />
                  Hak suara telah digunakan
                </Badge>
                <p className="text-sm text-muted-foreground pt-2">
                  Halo <span className="font-semibold text-foreground">{session.user.name}</span>, suara Anda telah berhasil masuk dalam sistem.
                </p>
              </div>

              <div className="grid gap-3 pt-4 border-t">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                  <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Pilihan Anda Rahasia</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Identitas Anda tidak terhubung dengan kandidat yang Anda pilih. Privasi Anda terjamin.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                  <Calendar className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Waktu Pencatatan</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(new Date())}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button asChild variant="outline" className="flex-1">
                  <Link href="/hasil">Lihat Hasil Realtime</Link>
                </Button>
                <Button asChild className="flex-1">
                  <Link href="/">K ke Beranda</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
