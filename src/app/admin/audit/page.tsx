"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Search, Filter } from "lucide-react";
import { formatDate } from "@/lib/utils";

type AuditLog = {
  id: string;
  userEmail: string;
  action: string;
  details: string | null;
  createdAt: string;
};

const ACTION_COLORS: Record<string, "default" | "success" | "destructive" | "secondary" | "outline"> = {
  LOGIN: "default",
  LOGIN_FAILED: "destructive",
  LOGOUT: "secondary",
  VOTE_CAST: "success",
  VOTE_FAILED: "destructive",
  ADMIN_CANDIDATE_CREATE: "outline",
  ADMIN_CANDIDATE_UPDATE: "outline",
  ADMIN_CANDIDATE_DELETE: "destructive",
  ADMIN_VOTING_OPEN: "success",
  ADMIN_VOTING_CLOSE: "destructive",
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("ALL");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/admin/audit");
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = logs.filter((log) => {
    const matchSearch = !search ||
      log.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      (log.details?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchAction = filterAction === "ALL" || log.action === filterAction;
    return matchSearch && matchAction;
  });

  const uniqueActions = Array.from(new Set(logs.map((l) => l.action)));

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Audit Log</h1>
            <p className="text-muted-foreground">Riwayat aktivitas sistem</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" /> Log Aktivitas
              </CardTitle>
              <CardDescription>Total {logs.length} aktivitas tercatat</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Cari email, aksi, atau detail..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                </div>
                <Select value={filterAction} onValueChange={setFilterAction}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Semua Aksi</SelectItem>
                    {uniqueActions.map((a) => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Tidak ada log yang cocok</p>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {filtered.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                      <div className="flex flex-col items-center justify-center w-20 shrink-0">
                        <p className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}</p>
                        <p className="text-xs font-mono">{new Date(log.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</p>
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={ACTION_COLORS[log.action] || "outline"}>
                            {log.action}
                          </Badge>
                          <p className="text-sm font-medium truncate">{log.userEmail}</p>
                        </div>
                        {log.details && <p className="text-xs text-muted-foreground">{log.details}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
