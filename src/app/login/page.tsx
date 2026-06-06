"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Mail, Loader2, AlertCircle, ShieldCheck, Vote, UserCog, User } from "lucide-react";

function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/voting";
  const error = searchParams.get("error");
  const [loading, setLoading] = useState(false);
  const [demoEmail, setDemoEmail] = useState("");
  const [demoName, setDemoName] = useState("");

  const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  const handleMicrosoftLogin = async () => {
    setLoading(true);
    try {
      await signIn("microsoft-entra-id", { callbackUrl });
    } catch (err) {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: "voter" | "admin") => {
    setLoading(true);
    const email = role === "admin" ? "admin@tp.idu.ac.id" : (demoEmail || "mahasiswa@tp.idu.ac.id");
    const name = role === "admin" ? "Admin Demo" : (demoName || "Mahasiswa Demo");
    try {
      await signIn("demo", { email, name, role, callbackUrl });
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-bg">
      <Card className="w-full max-w-md animate-fade-in">
        <CardContent className="pt-8 pb-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-blue-700 text-white">
              <Vote className="h-8 w-8" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">Selamat Datang di SenatVote</h1>
            <p className="text-sm text-muted-foreground">
              {isDemo ? "Mode Demo — Pilih role untuk masuk" : "Masuk menggunakan akun Microsoft kampus Anda."}
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm text-left">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <p>Akses ditolak. Pastikan Anda menggunakan akun kampus (@tp.idu.ac.id).</p>
            </div>
          )}

          {isDemo ? (
            <div className="space-y-3">
              <Button onClick={() => handleDemoLogin("voter")} disabled={loading} size="xl" variant="gradient" className="w-full">
                <User className="h-5 w-5" /> Login sebagai Mahasiswa
              </Button>
              <Button onClick={() => handleDemoLogin("admin")} disabled={loading} size="xl" variant="outline" className="w-full">
                <UserCog className="h-5 w-5" /> Login sebagai Admin
              </Button>
              <p className="text-xs text-muted-foreground">
                Demo mode menggunakan SQLite lokal. Tidak perlu setup Supabase / Microsoft Entra ID.
              </p>
            </div>
          ) : (
            <>
              <Button onClick={handleMicrosoftLogin} disabled={loading} size="xl" variant="gradient" className="w-full">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mail className="h-5 w-5" />}
                {loading ? "Menghubungkan..." : "Login dengan Microsoft"}
              </Button>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Otentikasi aman via Microsoft Entra ID</span>
              </div>
            </>
          )}

          <div className="pt-4 border-t text-xs text-muted-foreground space-y-1">
            <p>Hanya email dengan domain <span className="font-mono font-semibold">@tp.idu.ac.id</span> yang diizinkan.</p>
            <p>Suara Anda bersifat rahasia dan tidak dapat diubah.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
