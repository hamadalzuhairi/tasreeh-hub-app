import { db } from "../db/client";
import { notifications } from "../db/schema";
import type { NotificationType } from "@tasreeh/shared";

export async function createNotification(params: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  requestId?: string;
}) {
  await db.insert(notifications).values({
    userId: params.userId,
    type: params.type,
    title: params.title,
    body: params.body,
    requestId: params.requestId,
  });
}
