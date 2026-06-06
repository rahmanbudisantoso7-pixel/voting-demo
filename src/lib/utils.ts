import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(d);
}

export function formatDateOnly(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
  }).format(d);
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export const ALLOWED_DOMAIN = "tp.idu.ac.id";

export function isValidCampusEmail(email: string): boolean {
  return email.toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`);
}

export function isAdminEmail(email: string): boolean {
  const adminEmails = process.env.ADMIN_EMAILS?.split(",").map((e) => e.trim().toLowerCase()) || [];
  return adminEmails.includes(email.toLowerCase());
}
