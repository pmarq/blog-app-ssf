"use client";

import { useMemo } from "react";

import type {
  StudioChannel,
  StudioScheduleItemDTO,
} from "@/lib/studio/types";

const TIME_ZONE = "America/Sao_Paulo";
const DAY_MS = 24 * 60 * 60 * 1000;

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"] as const;

const CHANNEL_STYLES: Record<StudioChannel, string> = {
  blog: "border-highlight-light/70 text-highlight-light dark:border-highlight-dark/70 dark:text-highlight-dark",
  instagram:
    "border-secondary-dark/40 text-secondary-dark dark:border-secondary-light/40 dark:text-secondary-light",
  stories:
    "border-secondary-dark/30 text-secondary-dark/80 dark:border-secondary-light/30 dark:text-secondary-light/80 bg-secondary-light/20 dark:bg-secondary-dark/20",
  reels:
    "border-highlight-light/40 text-highlight-light/80 dark:border-highlight-dark/40 dark:text-highlight-dark/80 bg-secondary-light/20 dark:bg-secondary-dark/20",
  newsletter:
    "border-secondary-dark/50 text-secondary-dark dark:border-secondary-light/50 dark:text-secondary-light bg-secondary-light/10 dark:bg-secondary-dark/10",
};

type SelectedDay = {
  dateKey: string;
  label: string;
};

type MonthCalendarProps = {
  ym: string;
  itemsByDay: Record<string, StudioScheduleItemDTO[]>;
  onDaySelect: (day: SelectedDay) => void;
  onMonthChange: (ym: string) => void;
};

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

function formatMonthLabel(date: Date): string {
  const raw = new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIME_ZONE,
    month: "long",
    year: "numeric",
  }).format(date);
  const normalized = raw.replace(" de ", " ");
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function formatLongDate(date: Date): string {
  const raw = new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIME_ZONE,
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function formatDateKeyFromUtc(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(
    date.getUTCDate()
  ).padStart(2, "0")}`;
}

export default function MonthCalendar({
  ym,
  itemsByDay,
  onDaySelect,
  onMonthChange,
}: MonthCalendarProps) {
  const [yearString, monthString] = ym.split("-");
  const year = Number(yearString);
  const month = Number(monthString);

  const monthStart = useMemo(() => {
    return getUtcDateFromTimeZoneParts(
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
  }, [year, month]);

  const days = useMemo(() => {
    const startWeekday = monthStart.getUTCDay();
    const gridStart = new Date(monthStart.getTime() - startWeekday * DAY_MS);

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart.getTime() + index * DAY_MS);
      const dateKey = formatDateKeyFromUtc(date);
      const isCurrentMonth = date.getUTCMonth() + 1 === month;

      return {
        date,
        dateKey,
        dayNumber: date.getUTCDate(),
        isCurrentMonth,
      };
    });
  }, [monthStart, month]);

  const monthLabel = useMemo(() => formatMonthLabel(monthStart), [monthStart]);

  const prevYm =
    month === 1
      ? `${year - 1}-12`
      : `${year}-${String(month - 1).padStart(2, "0")}`;
  const nextYm =
    month === 12
      ? `${year + 1}-01`
      : `${year}-${String(month + 1).padStart(2, "0")}`;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onMonthChange(prevYm)}
          className="text-xs px-2 py-1 border rounded border-secondary-dark/40 dark:border-secondary-light/40 hover:bg-secondary-light/30 dark:hover:bg-secondary-dark/30 transition"
          aria-label="Mes anterior"
        >
          &larr;
        </button>
        <h2 className="text-lg font-semibold text-highlight-light dark:text-highlight-dark">
          {monthLabel}
        </h2>
        <button
          type="button"
          onClick={() => onMonthChange(nextYm)}
          className="text-xs px-2 py-1 border rounded border-secondary-dark/40 dark:border-secondary-light/40 hover:bg-secondary-light/30 dark:hover:bg-secondary-dark/30 transition"
          aria-label="Mes seguinte"
        >
          &rarr;
        </button>
      </div>

      <div className="grid grid-cols-7 rounded border border-secondary-dark/30 dark:border-secondary-light/30 overflow-hidden">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="bg-secondary-light/40 dark:bg-secondary-dark/40 text-xs px-2 py-2 text-secondary-dark dark:text-secondary-light font-semibold"
          >
            {label}
          </div>
        ))}
        {days.map((day) => {
          const items = itemsByDay[day.dateKey] ?? [];
          const visibleItems = day.isCurrentMonth ? items : [];
          const overflowCount =
            visibleItems.length > 3 ? visibleItems.length - 3 : 0;

          return (
            <button
              key={day.dateKey}
              type="button"
              onClick={() =>
                onDaySelect({
                  dateKey: day.dateKey,
                  label: formatLongDate(day.date),
                })
              }
              className={`min-h-[110px] p-2 text-left border-t border-r border-secondary-dark/20 dark:border-secondary-light/20 transition hover:bg-secondary-light/20 dark:hover:bg-secondary-dark/20 ${
                day.isCurrentMonth
                  ? "text-secondary-dark dark:text-secondary-light"
                  : "text-secondary-dark/40 dark:text-secondary-light/40"
              }`}
            >
              <div className="text-xs font-semibold">{day.dayNumber}</div>
              <div className="mt-2 space-y-1">
                {visibleItems.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className={`text-[10px] px-2 py-0.5 border rounded ${
                      CHANNEL_STYLES[item.channel]
                    }`}
                  >
                    {item.title}
                  </div>
                ))}
                {overflowCount > 0 && (
                  <div className="text-[10px] text-secondary-dark/70 dark:text-secondary-light/70">
                    +{overflowCount}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
