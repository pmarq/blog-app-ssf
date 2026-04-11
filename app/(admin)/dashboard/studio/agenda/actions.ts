"use server";

import { Timestamp } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";

import {
  createItem,
  enqueueGenerateDraftJob,
  listMonthItems,
  serializeScheduleItem,
  updateItem,
} from "@/lib/studio/schedule";
import { createJob, updateJob } from "@/lib/studio/jobs";
import { getEditorialSettings } from "@/lib/studio/settings";
import {
  generateMonthIdeas as generateMonthIdeasLib,
  SUGGESTION_SCHEMA,
} from "@/lib/ai/generateMonthIdeas";
import type {
  StudioChannel,
  StudioScheduleItemDTO,
  StudioStatus,
  StudioTheme,
  StudioSuggestion,
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

const TIME_ZONE = "America/Sao_Paulo";
const DAY_MS = 24 * 60 * 60 * 1000;

function getTimeZoneParts(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const lookup: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== "literal") {
      lookup[part.type] = part.value;
    }
  }

  return {
    year: Number(lookup.year),
    month: Number(lookup.month),
    day: Number(lookup.day),
    hour: Number(lookup.hour),
    minute: Number(lookup.minute),
    second: Number(lookup.second),
  };
}

function getTimeZoneOffsetMinutes(date: Date, timeZone: string): number {
  const parts = getTimeZoneParts(date, timeZone);
  const utc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  );
  return (utc - date.getTime()) / 60000;
}

function getUtcDateFromTimeZoneParts(
  parts: ReturnType<typeof getTimeZoneParts>,
  timeZone: string
): Date {
  const utc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  );
  const offsetMinutes = getTimeZoneOffsetMinutes(new Date(utc), timeZone);
  return new Date(utc - offsetMinutes * 60000);
}

function getMonthRangeUtc(year: number, month: number): { start: Date; end: Date } {
  const start = getUtcDateFromTimeZoneParts(
    {
      year,
      month,
      day: 1,
      hour: 0,
      minute: 0,
      second: 0,
    },
    TIME_ZONE
  );

  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;

  const end = getUtcDateFromTimeZoneParts(
    {
      year: nextYear,
      month: nextMonth,
      day: 1,
      hour: 0,
      minute: 0,
      second: 0,
    },
    TIME_ZONE
  );

  return { start, end };
}

function formatDateKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function toWeekday(dateKey: string): number {
  const date = new Date(`${dateKey}T00:00:00-03:00`);
  return date.getUTCDay();
}

function isValidYm(value: string): boolean {
  if (!/^\d{4}-\d{2}$/.test(value)) {
    return false;
  }
  const [, monthString] = value.split("-");
  const month = Number(monthString);
  return month >= 1 && month <= 12;
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

export async function generateMonthIdeas(input: {
  ym: string;
}): Promise<{
  jobId?: string;
  suggestions?: StudioSuggestion[];
  status: "done" | "failed";
  error?: string;
}> {
  if (!isValidYm(input.ym)) {
    return { status: "failed", error: "Mes invalido." };
  }

  const [year, month] = input.ym.split("-").map(Number);
  const { start, end } = getMonthRangeUtc(year, month);

  const job = await createJob({
    type: "generate_month_ideas",
    status: "processing",
    payload: { ym: input.ym, timezone: TIME_ZONE },
  });

  try {
    const [settings, monthItems] = await Promise.all([
      getEditorialSettings(),
      listMonthItems(start, end),
    ]);

    const occupied = new Set(
      monthItems
        .filter((item) => item.scheduledAt)
        .map((item) => formatDateKey(item.scheduledAt!.toDate()))
    );

    const days: Array<{ dateKey: string; isOccupied: boolean; weekday: number }> =
      [];
    for (let cursor = start; cursor < end; cursor = new Date(cursor.getTime() + DAY_MS)) {
      const dateKey = formatDateKey(cursor);
      days.push({
        dateKey,
        isOccupied: occupied.has(dateKey),
        weekday: toWeekday(dateKey),
      });
    }

    const availableDays = days.filter((day) => !day.isOccupied).length;
    const targetCount =
      availableDays < 6
        ? Math.max(1, availableDays)
        : availableDays < 12
        ? 6
        : Math.min(20, Math.max(12, Math.round(availableDays * 0.35)));

    const result = await generateMonthIdeasLib({
      ym: input.ym,
      timezone: TIME_ZONE,
      days,
      settings,
      targetCount,
    });

    const status = result.source === "fallback" && result.error ? "failed" : "done";

    await updateJob(job.id, {
      status,
      result: { suggestions: result.suggestions, source: result.source },
      error: result.error ?? null,
    });

    revalidatePath("/dashboard/studio/agenda");

    return {
      jobId: job.id,
      suggestions: result.suggestions,
      status,
      error: result.error,
    };
  } catch (error) {
    console.error("Erro ao gerar pautas do mes:", error);
    const message = (error as Error).message || "Falha ao gerar pautas.";
    await updateJob(job.id, { status: "failed", error: message });
    return { jobId: job.id, status: "failed", error: message };
  }
}

export async function applySuggestions(input: {
  suggestions: StudioSuggestion[];
}): Promise<{ items?: StudioScheduleItemDTO[]; error?: string }> {
  if (!input.suggestions.length) {
    return { error: "Nenhuma sugestao selecionada." };
  }

  const suggestionListSchema = SUGGESTION_SCHEMA.array().min(1).max(20);

  let suggestions: StudioSuggestion[];
  try {
    suggestions = suggestionListSchema.parse(input.suggestions);
  } catch (error) {
    console.error("Sugestoes invalidas:", error);
    return { error: "Sugestoes invalidas." };
  }

  try {
    const created = await Promise.all(
      suggestions.map((suggestion) => {
        const scheduledAt = toTimestamp(suggestion.scheduledAt);
        if (!scheduledAt) {
          throw new Error("Data invalida na sugestao.");
        }
        return createItem({
          title: suggestion.title,
          theme: suggestion.theme,
          channel: suggestion.channel,
          status: "idea",
          scheduledAt,
        });
      })
    );

    revalidatePath("/dashboard/studio/agenda");

    return { items: created.map(serializeScheduleItem) };
  } catch (error) {
    console.error("Erro ao aplicar sugestoes:", error);
    return { error: "Falha ao aplicar sugestoes." };
  }
}
