import { Timestamp } from "firebase-admin/firestore";

import { firestore } from "@/firebase/server";
import type { StudioJob, StudioJobStatus, StudioJobType } from "./types";

const JOBS_COLLECTION = "studio_jobs";
const DEFAULT_ORG_ID = "default";

function stripUndefined<T extends Record<string, unknown>>(data: T): Partial<T> {
  const entries = Object.entries(data).filter(([, value]) => value !== undefined);
  return Object.fromEntries(entries) as Partial<T>;
}

export type CreateJobInput = {
  type: StudioJobType;
  status: StudioJobStatus;
  payload?: Record<string, unknown>;
  result?: Record<string, unknown>;
  error?: string | null;
  scheduleItemId?: string;
};

export async function createJob(input: CreateJobInput): Promise<StudioJob> {
  const ref = firestore.collection(JOBS_COLLECTION).doc();
  const now = Timestamp.now();

  const job: StudioJob = {
    id: ref.id,
    orgId: DEFAULT_ORG_ID,
    scheduleItemId: input.scheduleItemId,
    type: input.type,
    status: input.status,
    payload: input.payload,
    result: input.result,
    error: input.error ?? null,
    createdAt: now,
    updatedAt: now,
  };

  await ref.set(job);

  return job;
}

export async function updateJob(
  id: string,
  updates: Partial<Omit<StudioJob, "id" | "orgId" | "createdAt">>
): Promise<StudioJob | null> {
  const ref = firestore.collection(JOBS_COLLECTION).doc(id);
  const updateData = stripUndefined({
    ...updates,
    updatedAt: Timestamp.now(),
  });

  await ref.update(updateData);

  const snapshot = await ref.get();
  if (!snapshot.exists) {
    return null;
  }

  return {
    ...(snapshot.data() as StudioJob),
    id: snapshot.id,
  };
}
