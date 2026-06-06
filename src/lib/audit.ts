import { prisma } from "./prisma";

export type AuditAction =
  | "LOGIN"
  | "LOGIN_FAILED"
  | "LOGOUT"
  | "VOTE_CAST"
  | "VOTE_FAILED"
  | "ADMIN_CANDIDATE_CREATE"
  | "ADMIN_CANDIDATE_UPDATE"
  | "ADMIN_CANDIDATE_DELETE"
  | "ADMIN_VOTING_OPEN"
  | "ADMIN_VOTING_CLOSE"
  | "ADMIN_VOTING_SETTINGS_UPDATE"
  | "ADMIN_EXPORT_PDF"
  | "ADMIN_EXPORT_EXCEL";

export async function logAudit(
  userEmail: string,
  action: AuditAction,
  details?: string
) {
  try {
    await prisma.auditLog.create({
      data: {
        userEmail,
        action,
        details,
      },
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}
