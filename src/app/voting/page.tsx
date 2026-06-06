"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Vote, Check, AlertCircle, Target, Eye, Loader2, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

type Candidate = {
  id: string;
  number: number;
  name: string;
  prodi: string;
  photo: string | null;
  vision: string;
  mission: string;
};

export default function VotingPage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [votingOpen, setVotingOpen] = useState(true);
  const [settingInfo, setSettingInfo] = useState<{ startDate: string | null; endDate: string | null }>({ startDate: null, endDate: null });

  useEffect(() => {
    Promise.all([fetchCandidates(), fetchSettings()]).finally(() => setLoading(false));
  }, []);

  const fetchCandidates = async () => {
    try {
      const res = await fetch("/api/candidates");
      if (res.ok) {
        const data = await res.json();
        setCandidates(data);
      }
    } catch (e) {
      toast.error("Gagal memuat kandidat");
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setVotingOpen(data.votingOpen);
        setSettingInfo({ startDate: data.startDate, endDate: data.endDate });
      }
    } catch (e) {}
  };

  const handleVote = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId: selected.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Gagal memberikan suara");
        return;
      }
      toast.success("Suara Anda berhasil direkam!");
      await update();
      router.push("/voting/success");
    } catch (e) {
      toast.error("Terjadi kesalahan");
    } finally {
      setSubmitting(false);
      setSelected(null);
    }
  };

  if (!votingOpen) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container py-12">
          <Card className="max-w-xl mx-auto">
            <CardContent className="pt-8 pb-8 text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-amber-500 mx-auto" />
              <h1 className="text-2xl font-bold">Voting Belum Dibuka</h1>
              <p className="text-muted-foreground">
                Mohon menunggu hingga admin membuka periode pemilihan.
              </p>
              {settingInfo.startDate && (
                <p className="text-sm">Akan dibuka pada: <span className="font-semibold">{new Date(settingInfo.startDate).toLocaleString("id-ID")}</span></p>
              )}
              <Button onClick={() => router.push("/")}>Kembali ke Beranda</Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8 md:py-12">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <Badge variant="outline" className="text-primary border-primary">
              <Vote className="h-3 w-3 mr-1" /> Pilih Kandidat Anda
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold">Calon Ketua Senat Kampus</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Setiap akun hanya dapat memberikan satu suara. Pastikan pilihan Anda dengan teliti.
            </p>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-6 space-y-4">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {candidates.map((c) => (
                <Card key={c.id} className="overflow-hidden hover:shadow-xl transition-shadow group">
                  <div className="relative h-56 gradient-bg overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                    <div className="absolute top-4 left-4 z-10">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-primary text-2xl font-bold shadow-lg">
                        {c.number}
                      </div>
                    </div>
                    {c.photo && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative h-40 w-40 rounded-full overflow-hidden border-4 border-white shadow-xl">
                          <Image src={c.photo} alt={c.name} fill className="object-cover" unoptimized />
                        </div>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6 space-y-4">
                    <div className="text-center">
                      <h3 className="text-xl font-bold">{c.name}</h3>
                      <Badge variant="secondary" className="mt-2">
                        <GraduationCap className="h-3 w-3 mr-1" />
                        {c.prodi}
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <Target className="h-4 w-4 text-primary" />
                          <p className="text-sm font-semibold">Visi</p>
                        </div>
                        <p className="text-sm text-muted-foreground">{c.vision}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <Eye className="h-4 w-4 text-primary" />
                          <p className="text-sm font-semibold">Misi</p>
                        </div>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">{c.mission}</p>
                      </div>
                    </div>
                    <Button
                      variant="gradient"
                      size="lg"
                      className="w-full"
                      onClick={() => setSelected(c)}
                    >
                      <Vote className="h-4 w-4" />
                      Pilih Kandidat Ini
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Dialog open={!!selected} onOpenChange={(o) => !submitting && setSelected(o ? selected : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">Konfirmasi Pilihan</DialogTitle>
            <DialogDescription className="text-center">
              Apakah Anda yakin dengan pilihan ini?
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <Card className="border-2 border-primary">
                <CardContent className="pt-6 text-center space-y-3">
                  <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                    {selected.number}
                  </div>
                  <p className="font-bold text-lg">{selected.name}</p>
                  <Badge variant="secondary">
                    <GraduationCap className="h-3 w-3 mr-1" />
                    {selected.prodi}
                  </Badge>
                </CardContent>
              </Card>
              <div className="p-3 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 text-sm flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <p>Setelah dikonfirmasi, suara tidak dapat diubah atau dibatalkan.</p>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setSelected(null)} disabled={submitting} className="flex-1">
              Batal
            </Button>
            <Button onClick={handleVote} disabled={submitting} className="flex-1">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {submitting ? "Memproses..." : "Ya, Saya Yakin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
