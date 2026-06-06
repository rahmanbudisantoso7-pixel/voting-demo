"use client";

import { useEffect, useState, useRef } from "react";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2, Users, GraduationCap, Upload, X, ImageIcon, Loader2 } from "lucide-react";
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
  _count?: { votes: number };
};

export default function CandidatesManagementPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Candidate | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ number: "", name: "", prodi: "", photo: "", vision: "", mission: "" });
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCandidates = async () => {
    try {
      const res = await fetch("/api/admin/candidates");
      if (res.ok) {
        const data = await res.json();
        setCandidates(data);
      }
    } catch (e) {
      toast.error("Gagal memuat kandidat");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Gagal upload foto");
        return;
      }
      setForm({ ...form, photo: data.url });
      setPreview(data.url);
      toast.success("Foto berhasil diupload");
    } catch (err) {
      toast.error("Terjadi kesalahan saat upload");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editing ? `/api/admin/candidates/${editing.id}` : "/api/admin/candidates";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          number: parseInt(form.number),
          name: form.name,
          prodi: form.prodi,
          photo: form.photo || null,
          vision: form.vision,
          mission: form.mission,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Gagal menyimpan");
        return;
      }
      toast.success(editing ? "Kandidat berhasil diperbarui" : "Kandidat berhasil ditambahkan");
      setOpen(false);
      setEditing(null);
      resetForm();
      fetchCandidates();
    } catch (e) {
      toast.error("Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (c: Candidate) => {
    setEditing(c);
    setForm({
      number: c.number.toString(),
      name: c.name,
      prodi: c.prodi,
      photo: c.photo || "",
      vision: c.vision,
      mission: c.mission,
    });
    setPreview(c.photo);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus kandidat ini? Semua suara untuk kandidat ini juga akan dihapus.")) return;
    try {
      const res = await fetch(`/api/admin/candidates/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Gagal menghapus");
        return;
      }
      toast.success("Kandidat berhasil dihapus");
      fetchCandidates();
    } catch (e) {
      toast.error("Terjadi kesalahan");
    }
  };

  const resetForm = () => {
    setForm({ number: "", name: "", prodi: "", photo: "", vision: "", mission: "" });
    setPreview(null);
  };

  const openAdd = () => {
    setEditing(null);
    resetForm();
    setOpen(true);
  };

  const removePhoto = () => {
    setForm({ ...form, photo: "" });
    setPreview(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Manajemen Kandidat</h1>
              <p className="text-muted-foreground">Kelola data calon ketua senat</p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={openAdd}>
                  <Plus className="h-4 w-4" /> Tambah Kandidat
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editing ? "Edit Kandidat" : "Tambah Kandidat"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="number">Nomor Urut</Label>
                    <Input id="number" type="number" min="1" required value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Lengkap</Label>
                    <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prodi">Program Studi (Prodi)</Label>
                    <Input id="prodi" required placeholder="Contoh: Teknologi Daya Gerak" value={form.prodi} onChange={(e) => setForm({ ...form, prodi: e.target.value })} />
                  </div>

                  <div className="space-y-2">
                    <Label>Foto Kandidat</Label>
                    {preview || form.photo ? (
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-dashed bg-muted group">
                        <Image src={preview || form.photo} alt="Preview" fill className="object-cover" unoptimized />
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-32 h-32 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center text-muted-foreground bg-muted/30">
                        <ImageIcon className="h-8 w-8 mb-1" />
                        <span className="text-xs">Belum ada foto</span>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Mengupload...</>
                      ) : (
                        <><Upload className="h-4 w-4" /> Upload Foto</>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground">JPG, PNG, WebP, atau SVG. Maks 5MB.</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vision">Visi</Label>
                    <Textarea id="vision" required rows={3} value={form.vision} onChange={(e) => setForm({ ...form, vision: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mission">Misi</Label>
                    <Textarea id="mission" required rows={5} value={form.mission} onChange={(e) => setForm({ ...form, mission: e.target.value })} />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                    <Button type="submit" disabled={submitting || uploading}>{submitting ? "Menyimpan..." : "Simpan"}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-32 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : candidates.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center space-y-3">
                <Users className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">Belum ada kandidat. Klik "Tambah Kandidat" untuk memulai.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {candidates.map((c) => (
                <Card key={c.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full gradient-bg text-white font-bold">
                          {c.number}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{c.name}</CardTitle>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                            <GraduationCap className="h-3 w-3" />
                            <span>{c.prodi}</span>
                          </div>
                          <CardDescription className="mt-1">Suara: {c._count?.votes || 0}</CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(c)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(c.id)} className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div>
                      <p className="font-semibold text-xs text-muted-foreground">VISI</p>
                      <p>{c.vision}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-muted-foreground">MISI</p>
                      <p className="whitespace-pre-line line-clamp-3">{c.mission}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
