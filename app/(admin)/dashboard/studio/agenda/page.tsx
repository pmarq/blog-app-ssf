export const dynamic = "force-dynamic";

import AdminLayout from "@/app/components/layout/AdminLayout";
import StudioNav from "@/app/components/admin/StudioNav";
import AgendaClient from "./AgendaClient";
import {
  listBacklogItems,
  listMonthItems,
  listWeekItems,
  serializeScheduleItem,
} from "@/lib/studio/schedule";

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

function getWeekRangeUtc(baseDate: Date): { start: Date; end: Date } {
  const parts = getTimeZoneParts(baseDate, TIME_ZONE);
  const localDate = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  const weekday = localDate.getUTCDay();
  const diffToMonday = (weekday + 6) % 7;
  const mondayDate = new Date(localDate.getTime() - diffToMonday * DAY_MS);

  const start = getUtcDateFromTimeZoneParts(
    {
      year: mondayDate.getUTCFullYear(),
      month: mondayDate.getUTCMonth() + 1,
      day: mondayDate.getUTCDate(),
      hour: 0,
      minute: 0,
      second: 0,
    },
    TIME_ZONE
  );

  const end = new Date(start.getTime() + 7 * DAY_MS);

  return { start, end };
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

function isValidYm(value?: string | null): value is string {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) {
    return false;
  }
  const [, monthString] = value.split("-");
  const month = Number(monthString);
  return month >= 1 && month <= 12;
}

function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

type PageProps = {
  searchParams?: Promise<{
    view?: string;
    ym?: string;
  }>;
};

export default async function StudioAgendaPage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const { start, end } = getWeekRangeUtc(new Date());
  const nowParts = getTimeZoneParts(new Date(), TIME_ZONE);
  const defaultYm = `${nowParts.year}-${String(nowParts.month).padStart(2, "0")}`;
  const selectedYm = isValidYm(resolvedSearchParams?.ym)
    ? resolvedSearchParams?.ym
    : defaultYm;
  const [year, month] = selectedYm.split("-").map(Number);
  const { start: monthStart, end: monthEnd } = getMonthRangeUtc(year, month);
  const initialView =
    resolvedSearchParams?.view === "week" ||
    resolvedSearchParams?.view === "backlog" ||
    resolvedSearchParams?.view === "month"
      ? resolvedSearchParams.view
      : "month";

  const [weekItems, backlogItems, monthItems] = await Promise.all([
    listWeekItems(start, end),
    listBacklogItems(),
    listMonthItems(monthStart, monthEnd),
  ]);

  const weekLabel = `${formatShortDate(start)} - ${formatShortDate(
    new Date(end.getTime() - 1)
  )}`;

  return (
    <AdminLayout>
      <div className="max-w-5xl space-y-4">
        <StudioNav />
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-highlight-light dark:text-highlight-dark">
            Agenda
          </h1>
          <p className="text-secondary-dark dark:text-secondary-light">
            Calendario editorial para planejar, revisar e agendar publicacoes.
          </p>
          <p className="text-xs text-secondary-dark/70 dark:text-secondary-light/70">
            Semana atual: {weekLabel} ({TIME_ZONE})
          </p>
        </div>

        <AgendaClient
          initialView={initialView}
          initialYm={selectedYm}
          initialMonthItems={monthItems.map(serializeScheduleItem)}
          initialWeekItems={weekItems.map(serializeScheduleItem)}
          initialBacklogItems={backlogItems.map(serializeScheduleItem)}
          monthStartIso={monthStart.toISOString()}
          monthEndIso={monthEnd.toISOString()}
          weekStartIso={start.toISOString()}
          weekEndIso={end.toISOString()}
        />
      </div>
    </AdminLayout>
  );
}
