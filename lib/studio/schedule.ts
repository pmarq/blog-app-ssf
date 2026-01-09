import { Timestamp } from "firebase-admin/firestore";

import { firestore } from "@/firebase/server";
import type {
  StudioJob,
  StudioScheduleItem,
  StudioScheduleItemDTO,
  StudioScheduleItemInput,
  StudioScheduleItemUpdate,
} from "./types";

const SCHEDULE_COLLECTION = "studio_schedule_items";
const JOBS_COLLECTION = "studio_jobs";
const DEFAULT_ORG_ID = "default";

function stripUndefined<T extends Record<string, unknown>>(data: T): Partial<T> {
  const entries = Object.entries(data).filter(([, value]) => value !== undefined);
  return Object.fromEntries(entries) as Partial<T>;
}

function ensureId(item: StudioScheduleItem, fallbackId: string): StudioScheduleItem {
  if (item.id) {
    return item;
  }

  return {
    ...item,
    id: fallbackId,
  };
}

export function serializeScheduleItem(
  item: StudioScheduleItem
): StudioScheduleItemDTO {
  return {
    ...item,
    scheduledAt: item.scheduledAt ? item.scheduledAt.toDate().toISOString() : null,
    createdAt: item.createdAt.toDate().toISOString(),
    updatedAt: item.updatedAt.toDate().toISOString(),
  };
}

export async function listWeekItems(
  startOfWeek: Date,
  endOfWeek: Date
): Promise<StudioScheduleItem[]> {
  const startTimestamp = Timestamp.fromDate(startOfWeek);
  const endTimestamp = Timestamp.fromDate(endOfWeek);

  const snapshot = await firestore
    .collection(SCHEDULE_COLLECTION)
    .where("orgId", "==", DEFAULT_ORG_ID)
    .where("scheduledAt", ">=", startTimestamp)
    .where("scheduledAt", "<", endTimestamp)
    .orderBy("scheduledAt", "asc")
    .get();

  return snapshot.docs.map((doc) =>
    ensureId(doc.data() as StudioScheduleItem, doc.id)
  );
}

export async function listMonthItems(
  startOfMonth: Date,
  endOfMonth: Date
): Promise<StudioScheduleItem[]> {
  const startTimestamp = Timestamp.fromDate(startOfMonth);
  const endTimestamp = Timestamp.fromDate(endOfMonth);

  const snapshot = await firestore
    .collection(SCHEDULE_COLLECTION)
    .where("orgId", "==", DEFAULT_ORG_ID)
    .where("scheduledAt", ">=", startTimestamp)
    .where("scheduledAt", "<", endTimestamp)
    .orderBy("scheduledAt", "asc")
    .get();

  return snapshot.docs.map((doc) =>
    ensureId(doc.data() as StudioScheduleItem, doc.id)
  );
}

export async function listBacklogItems(): Promise<StudioScheduleItem[]> {
  const snapshot = await firestore
    .collection(SCHEDULE_COLLECTION)
    .where("orgId", "==", DEFAULT_ORG_ID)
    .where("scheduledAt", "==", null)
    .get();

  const items = snapshot.docs.map((doc) =>
    ensureId(doc.data() as StudioScheduleItem, doc.id)
  );

  return items.sort(
    (a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()
  );
}

export async function createItem(
  input: StudioScheduleItemInput
): Promise<StudioScheduleItem> {
  const ref = firestore.collection(SCHEDULE_COLLECTION).doc();
  const now = Timestamp.now();

  const newItem: StudioScheduleItem = {
    id: ref.id,
    orgId: DEFAULT_ORG_ID,
    title: input.title,
    theme: input.theme,
    channel: input.channel,
    status: input.status,
    scheduledAt: input.scheduledAt ?? null,
    createdAt: now,
    updatedAt: now,
    guardrailScore: input.guardrailScore ?? null,
  };

  await ref.set(newItem);

  return newItem;
}

export async function updateItem(
  id: string,
  partial: StudioScheduleItemUpdate
): Promise<StudioScheduleItem | null> {
  const ref = firestore.collection(SCHEDULE_COLLECTION).doc(id);
  const updateData = stripUndefined({
    ...partial,
    updatedAt: Timestamp.now(),
  });

  await ref.update(updateData);

  const snapshot = await ref.get();
  if (!snapshot.exists) {
    return null;
  }

  return ensureId(snapshot.data() as StudioScheduleItem, snapshot.id);
}

export async function enqueueGenerateDraftJob(
  scheduleItemId: string
): Promise<StudioJob> {
  const ref = firestore.collection(JOBS_COLLECTION).doc();
  const job: StudioJob = {
    id: ref.id,
    orgId: DEFAULT_ORG_ID,
    scheduleItemId,
    type: "generate_draft",
    status: "queued",
    createdAt: Timestamp.now(),
  };

  await ref.set(job);

  return job;
}
