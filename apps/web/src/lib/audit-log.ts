import { prisma } from "@/lib/prisma";

type AuditInput = {
  actorUserId: number;
  action: string;
  entityType: string;
  entityId: string;
  metaJson?: string;
};

export async function writeAuditLog(input: AuditInput) {
  await prisma.auditLog.create({
    data: {
      actorUserId: input.actorUserId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      metaJson: input.metaJson,
    },
  });
}
