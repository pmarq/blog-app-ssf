"use server";

import { Timestamp } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";

import {
  createItem,
  enqueueGenerateDraftJob,
  serializeScheduleItem,
  updateItem,
} from "@/lib/studio/schedule";
import type {
  StudioChannel,
  StudioScheduleItemDTO,
  StudioStatus,
  StudioTheme,
} from "@/lib/studio/types";

export type ScheduleItemCreateInput = {
  title: string;
  theme: StudioTheme;
  channel: StudioChannel;
  status: StudioStatus;
  scheduledAt?: string | null;
};

export type ScheduleItemUpdateInput = Partial<
  Omit<ScheduleItemCreateInput, "title"> & {
    title: string;
    guardrailScore: number | null;
  }
>;

function toTimestamp(value?: string | null): Timestamp | null | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (value === null || value === "") {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }
  return Timestamp.fromDate(parsed);
}

export async function createScheduleItem(
  input: ScheduleItemCreateInput
): Promise<{ item?: StudioScheduleItemDTO; error?: string }> {
  const title = input.title.trim();
  if (!title) {
    return { error: "Titulo obrigatorio." };
  }

  const scheduledAt = toTimestamp(input.scheduledAt);
  if (input.scheduledAt && !scheduledAt) {
    return { error: "Data invalida." };
  }

  try {
    const item = await createItem({
      title,
      theme: input.theme,
      channel: input.channel,
      status: input.status,
      scheduledAt: scheduledAt ?? null,
    });

    revalidatePath("/dashboard/studio/agenda");

    return { item: serializeScheduleItem(item) };
  } catch (error) {
    console.error("Erro ao criar item da agenda:", error);
    return { error: "Falha ao criar item." };
  }
}

export async function updateScheduleItem(
  id: string,
  partial: ScheduleItemUpdateInput
): Promise<{ item?: StudioScheduleItemDTO; error?: string }> {
  if (!id) {
    return { error: "ID invalido." };
  }

  if (partial.title !== undefined && !partial.title.trim()) {
    return { error: "Titulo obrigatorio." };
  }

  const scheduledAt = toTimestamp(partial.scheduledAt);
  if (partial.scheduledAt !== undefined && !scheduledAt && partial.scheduledAt) {
    return { error: "Data invalida." };
  }

  try {
    const updated = await updateItem(id, {
      title: partial.title?.trim(),
      theme: partial.theme,
      channel: partial.channel,
      status: partial.status,
      scheduledAt: scheduledAt,
      guardrailScore: partial.guardrailScore,
    });

    if (!updated) {
      return { error: "Item nao encontrado." };
    }

    revalidatePath("/dashboard/studio/agenda");

    return { item: serializeScheduleItem(updated) };
  } catch (error) {
    console.error("Erro ao atualizar item da agenda:", error);
    return { error: "Falha ao atualizar item." };
  }
}

export async function generateDraftJob(
  scheduleItemId: string
): Promise<{ success: boolean; jobId?: string; error?: string }> {
  if (!scheduleItemId) {
    return { success: false, error: "ID invalido." };
  }

  try {
    const job = await enqueueGenerateDraftJob(scheduleItemId);
    revalidatePath("/dashboard/studio/agenda");
    return { success: true, jobId: job.id };
  } catch (error) {
    console.error("Erro ao enfileirar job:", error);
    return { success: false, error: "Falha ao enfileirar job." };
  }
}
