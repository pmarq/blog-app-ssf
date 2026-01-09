"use client";

import type { StudioChannel, StudioScheduleItemDTO } from "@/lib/studio/types";

const TIME_ZONE = "America/Sao_Paulo";

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

type DayDrawerProps = {
  open: boolean;
  day: SelectedDay | null;
  items: StudioScheduleItemDTO[];
  onClose: () => void;
  onCreateForDay: (dateKey: string) => void;
};

function formatTime(iso?: string | null): string {
  if (!iso) {
    return "";
  }
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

export default function DayDrawer({
  open,
  day,
  items,
  onClose,
  onCreateForDay,
}: DayDrawerProps) {
  if (!open || !day) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="absolute right-0 top-0 h-full w-full max-w-md bg-primary dark:bg-primary-dark border-l border-secondary-dark/30 dark:border-secondary-light/30 p-4"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold text-highlight-light dark:text-highlight-dark">
              {day.label}
            </h3>
            <p className="text-xs text-secondary-dark/70 dark:text-secondary-light/70">
              {items.length} itens agendados
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs px-2 py-1 border rounded border-secondary-dark/40 dark:border-secondary-light/40 hover:bg-secondary-light/30 dark:hover:bg-secondary-dark/30 transition"
          >
            Fechar
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-secondary-dark/70 dark:text-secondary-light/70">
            Pautas do dia
          </span>
          <button
            type="button"
            onClick={() => onCreateForDay(day.dateKey)}
            className="text-xs px-2 py-1 border rounded border-highlight-light text-highlight-light dark:border-highlight-dark dark:text-highlight-dark hover:bg-secondary-light/30 dark:hover:bg-secondary-dark/30 transition"
          >
            Nova pauta neste dia
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {items.length === 0 ? (
            <div className="rounded border border-secondary-dark/30 dark:border-secondary-light/30 p-3 text-xs text-secondary-dark/70 dark:text-secondary-light/70">
              Nenhuma pauta agendada para este dia.
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="rounded border border-secondary-dark/30 dark:border-secondary-light/30 bg-secondary-light/10 dark:bg-secondary-dark/30 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-highlight-light dark:text-highlight-dark">
                      {item.title}
                    </p>
                    <p className="text-xs text-secondary-dark/70 dark:text-secondary-light/70">
                      {formatTime(item.scheduledAt) || "Sem horario"}
                    </p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 border rounded border-secondary-dark/40 dark:border-secondary-light/40 text-secondary-dark dark:text-secondary-light">
                    {item.status}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span
                    className={`text-[10px] px-2 py-0.5 border rounded ${
                      CHANNEL_STYLES[item.channel]
                    }`}
                  >
                    {item.channel}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 border rounded border-secondary-dark/40 dark:border-secondary-light/40 text-secondary-dark dark:text-secondary-light">
                    {item.theme}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
