"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Vote, LayoutDashboard, Users, Settings, FileText, BarChart3, LogOut, Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { ThemeToggle } from "./theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useState } from "react";
import { cn, getInitials } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const isAdmin = session?.user?.isAdmin;
  const hasVoted = session?.user?.hasVoted;

  const userLinks = [
    { href: "/", label: "Beranda" },
    { href: "/hasil", label: "Hasil" },
  ];

  const adminLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/candidates", label: "Kandidat", icon: Users },
    { href: "/admin/settings", label: "Pengaturan", icon: Settings },
    { href: "/admin/audit", label: "Audit Log", icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-blue-700 text-white">
            <Vote className="h-5 w-5" />
          </div>
          <span>SenatVote</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {userLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                pathname === link.href ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
          {session && !hasVoted && (
            <Link
              href="/voting"
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                pathname === "/voting" ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Voting
            </Link>
          )}
          {isAdmin && (
            <div className="flex items-center gap-1 ml-2 pl-2 border-l">
              {adminLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5",
                    pathname === link.href ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {session ? (
            <div className="hidden md:flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                  <AvatarFallback className="text-xs">{getInitials(session.user?.name || "U")}</AvatarFallback>
                </Avatar>
                <div className="text-xs">
                  <p className="font-medium leading-none">{session.user?.name}</p>
                  <p className="text-muted-foreground leading-none mt-0.5">{session.user?.email}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => signOut({ callbackUrl: "/" })}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button asChild size="sm" className="hidden md:inline-flex">
              <Link href="/login">Login</Link>
            </Button>
          )}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(!open)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t bg-background p-4 space-y-2">
          {userLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md hover:bg-muted">
              {link.label}
            </Link>
          ))}
          {session && !hasVoted && (
            <Link href="/voting" onClick={() => setOpen(false)} className="block px-3 py-2 rounded-md hover:bg-muted">
              Voting
            </Link>
          )}
          {isAdmin && adminLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted">
              <link.icon className="h-4 w-4" /> {link.label}
            </Link>
          ))}
          {session ? (
            <Button variant="outline" className="w-full" onClick={() => signOut({ callbackUrl: "/" })}>
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          ) : (
            <Button asChild className="w-full"><Link href="/login">Login</Link></Button>
          )}
        </div>
      )}
    </header>
  );
}
