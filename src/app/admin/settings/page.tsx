"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Settings, Save, Power, PowerOff, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

type Settings = {
  votingOpen: boolean;
  startDate: string | null;
  endDate: string | null;
  electionName: string;
};

export default function VotingSettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    votingOpen: false,
    startDate: null,
    endDate: null,
    electionName: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings({
          votingOpen: data.votingOpen,
          startDate: data.startDate,
          endDate: data.endDate,
          electionName: data.electionName || "",
        });
      }
    } catch (e) {
      toast.error("Gagal memuat pengaturan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const toDateTimeLocal = (iso: string | null) => {
    if (!iso) return "";
    const d = new Date(iso);
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 16);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          votingOpen: settings.votingOpen,
          startDate: settings.startDate || null,
          endDate: settings.endDate || null,
          electionName: settings.electionName,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Gagal menyimpan");
        return;
      }
      toast.success("Pengaturan berhasil disimpan");
      fetchSettings();
    } catch (e) {
      toast.error("Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  };

  const toggleVoting = async () => {
    const newState = !settings.votingOpen;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ votingOpen: newState }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Gagal mengubah status voting");
        return;
      }
      setSettings({ ...settings, votingOpen: newState });
      toast.success(newState ? "Voting berhasil dibuka" : "Voting berhasil ditutup");
    } catch (e) {
      toast.error("Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container py-8">
          <div className="max-w-2xl mx-auto">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Pengaturan Voting</h1>
            <p className="text-muted-foreground">Kelola status dan jadwal pemilihan</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Power className="h-5 w-5" /> Status Voting
                </span>
                <Badge variant={settings.votingOpen ? "success" : "destructive"}>
                  {settings.votingOpen ? "AKTIF" : "NONAKTIF"}
                </Badge>
              </CardTitle>
              <CardDescription>
                {settings.votingOpen ? "Voting sedang dibuka dan mahasiswa dapat memberikan suara." : "Voting ditutup, mahasiswa tidak dapat memberikan suara."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={toggleVoting}
                disabled={saving}
                variant={settings.votingOpen ? "destructive" : "default"}
                className="w-full"
              >
                {settings.votingOpen ? (
                  <><PowerOff className="h-4 w-4" /> Tutup Voting</>
                ) : (
                  <><Power className="h-4 w-4" /> Buka Voting</>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" /> Pengaturan Umum
              </CardTitle>
              <CardDescription>Atur nama pemilihan dan jadwal voting</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="electionName">Nama Pemilihan</Label>
                  <Input
                    id="electionName"
                    value={settings.electionName}
                    onChange={(e) => setSettings({ ...settings, electionName: e.target.value })}
                    placeholder="Pemilihan Ketua Senat Kampus 2026"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Tanggal Mulai</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={toDateTimeLocal(settings.startDate)}
                      onChange={(e) => setSettings({ ...settings, startDate: e.target.value ? new Date(e.target.value).toISOString() : null })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Tanggal Selesai</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={toDateTimeLocal(settings.endDate)}
                      onChange={(e) => setSettings({ ...settings, endDate: e.target.value ? new Date(e.target.value).toISOString() : null })}
                    />
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 text-sm">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <p>Pastikan jadwal telah sesuai. Perubahan akan langsung berlaku untuk semua pengguna.</p>
                </div>
                <Button type="submit" disabled={saving} className="w-full">
                  <Save className="h-4 w-4" /> {saving ? "Menyimpan..." : "Simpan Pengaturan"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
