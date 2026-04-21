import { prisma } from "@/lib/prisma"

export interface AuditLogParams {
  userId: string
  action: "CREATE" | "READ" | "UPDATE" | "DELETE" | "LOGIN" | "EXPORT" | (string & {})
  resource: "health_entry" | "mood_entry" | "journal" | "wallet" | "profile" | (string & {})
  resourceId?: string
  metadata?: Record<string, unknown> | string
  ip?: string
}

/**
 * Write an audit log entry to the database.
 *
 * Non-blocking by default — fires and forgets so it never slows down the
 * request that triggered it.  If you need to await the write (e.g. in tests),
 * await the returned promise.
 */
export function auditLog(params: AuditLogParams): Promise<void> {
  const { userId, action, resource, resourceId, metadata, ip } = params

  const metadataStr =
    metadata === undefined
      ? undefined
      : typeof metadata === "string"
        ? metadata
        : JSON.stringify(metadata)

  return prisma.auditLog
    .create({
      data: {
        userId,
        action,
        resource,
        resourceId: resourceId ?? null,
        metadata: metadataStr ?? null,
        ip: ip ?? null,
      },
    })
    .then(() => {})
    .catch((err) => {
      // Never let audit logging crash the caller
      console.error("[audit] Failed to write audit log:", err)
    })
}
