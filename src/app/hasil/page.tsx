"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Users, Vote, TrendingUp, Trophy, Activity } from "lucide-react";

type Result = {
  candidateId: string;
  number: number;
  name: string;
  photo: string | null;
  votes: number;
  percentage: number;
};

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [stats, setStats] = useState({ totalVotes: 0, totalUsers: 0, participation: 0 });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [live, setLive] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource("/api/results/stream");

    eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        setResults(data.results);
        setStats(data.stats);
        setLastUpdate(new Date(data.timestamp));
        setLive(true);
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    };

    eventSource.onerror = () => {
      setLive(false);
      setLoading(false);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const winner = results.length > 0 ? results.reduce((max, r) => (r.votes > max.votes ? r : max), results[0]) : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8 md:py-12">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <Badge variant="outline" className={live ? "text-emerald-600 border-emerald-500" : "text-muted-foreground"}>
              <span className={`relative flex h-2 w-2 mr-2`}>
                {live && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${live ? "bg-emerald-500" : "bg-muted"}`}></span>
              </span>
              {live ? "Live Connected" : "Connecting..."}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold">Hasil Pemilihan Realtime</h1>
            <p className="text-muted-foreground">
              Data diperbarui otomatis setiap 3 detik. Update terakhir: {lastUpdate.toLocaleTimeString("id-ID")}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                    <Vote className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{loading ? "-" : stats.totalVotes}</p>
                    <p className="text-xs text-muted-foreground">Total Suara</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{loading ? "-" : stats.totalUsers}</p>
                    <p className="text-xs text-muted-foreground">Mahasiswa</p>
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
                    <p className="text-2xl font-bold">{loading ? "-" : `${stats.participation}%`}</p>
                    <p className="text-xs text-muted-foreground">Partisipasi</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{loading || !winner ? "-" : `#${winner.number}`}</p>
                    <p className="text-xs text-muted-foreground">Unggul</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {winner && winner.votes > 0 && (
            <Card className="overflow-hidden border-0 shadow-2xl">
              <div className="gradient-bg p-6 text-white">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                      <Trophy className="h-8 w-8" />
                    </div>
                    <div>
                      <p className="text-sm text-white/80">Saat Ini Unggul</p>
                      <h2 className="text-2xl font-bold">{winner.name}</h2>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold">{winner.percentage.toFixed(1)}%</p>
                    <p className="text-sm text-white/80">{winner.votes} suara</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          <Tabs defaultValue="bar" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="bar">Grafik Batang</TabsTrigger>
              <TabsTrigger value="pie">Pie Chart</TabsTrigger>
            </TabsList>

            <TabsContent value="bar">
              <Card>
                <CardHeader>
                  <CardTitle>Distribusi Suara per Kandidat</CardTitle>
                  <CardDescription>Jumlah suara yang diterima masing-masing kandidat</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-80 w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={results} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                          formatter={(value: number) => [`${value} suara`, "Jumlah"]}
                        />
                        <Bar dataKey="votes" radius={[8, 8, 0, 0]}>
                          {results.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pie">
              <Card>
                <CardHeader>
                  <CardTitle>Persentase Suara</CardTitle>
                  <CardDescription>Proporsi suara dalam bentuk pie chart</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-80 w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={400}>
                      <PieChart>
                        <Pie
                          data={results}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="votes"
                        >
                          {results.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                          formatter={(value: number) => [`${value} suara`, "Jumlah"]}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle>Detail Perolehan Suara</CardTitle>
              <CardDescription>Persentase dan progress masing-masing kandidat</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                results.map((r, idx) => (
                  <div key={r.candidateId} className="space-y-2 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white font-bold"
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        >
                          {r.number}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{r.name}</p>
                          <p className="text-xs text-muted-foreground">{r.votes} suara</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-base font-bold">
                        {r.percentage.toFixed(1)}%
                      </Badge>
                    </div>
                    <Progress value={r.percentage} className="h-2" />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
