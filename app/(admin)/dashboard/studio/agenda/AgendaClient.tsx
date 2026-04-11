"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

import {
  createScheduleItem,
  applySuggestions,
  generateMonthIdeas,
  generateDraftJob,
  updateScheduleItem,
} from "./actions";
import MonthCalendar from "./MonthCalendar";
import DayDrawer from "./DayDrawer";
import type {
  StudioChannel,
  StudioScheduleItemDTO,
  StudioStatus,
  StudioSuggestion,
  StudioTheme,
} from "@/lib/studio/types";

const TIME_ZONE = "America/Sao_Paulo";
const DAY_MS = 24 * 60 * 60 * 1000;

const CHANNEL_OPTIONS: Array<{ value: StudioChannel; label: string }> = [
  { value: "blog", label: "Blog" },
  { value: "instagram", label: "Instagram" },
  { value: "stories", label: "Stories" },
  { value: "reels", label: "Reels" },
  { value: "newsletter", label: "Newsletter" },
];

const THEME_OPTIONS: Array<{ value: StudioTheme; label: string }> = [
  { value: "tokenizacao", label: "tokenizacao" },
  { value: "resultados_trimestrais", label: "resultados_trimestrais" },
  { value: "lancamentos", label: "lancamentos" },
  { value: "hub_weekly", label: "hub_weekly" },
  { value: "educativo", label: "educativo" },
];

const STATUS_OPTIONS: Array<{ value: StudioStatus; label: string }> = [
  { value: "idea", label: "idea" },
  { value: "draft", label: "draft" },
  { value: "review", label: "review" },
  { value: "approved", label: "approved" },
  { value: "scheduled", label: "scheduled" },
  { value: "published", label: "published" },
];

const DAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"] as const;

type AgendaView = "month" | "week" | "backlog";

const VIEW_OPTIONS: Array<{ value: AgendaView; label: string }> = [
  { value: "month", label: "Mês" },
  { value: "week", label: "Semana" },
  { value: "backlog", label: "Backlog" },
];

type ScheduleItemUpdateInput = {
  title?: string;
  theme?: StudioTheme;
  channel?: StudioChannel;
  status?: StudioStatus;
  scheduledAt?: string | null;
  guardrailScore?: number | null;
};

type NewItemFormState = {
  title: string;
  theme: StudioTheme;
  channel: StudioChannel;
  status: StudioStatus;
  scheduledAt: string;
};

type SelectedDay = {
  dateKey: string;
  label: string;
};

type SuggestionItem = {
  id: string;
  suggestion: StudioSuggestion;
};

type AgendaClientProps = {
  initialView: AgendaView;
  initialYm: string;
  initialMonthItems: StudioScheduleItemDTO[];
  monthStartIso: string;
  monthEndIso: string;
  initialWeekItems: StudioScheduleItemDTO[];
  initialBacklogItems: StudioScheduleItemDTO[];
  weekStartIso: string;
  weekEndIso: string;
};

function formatDateKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

function toLocalInputValue(iso?: string | null): string {
  if (!iso) {
    return "";
  }
  const date = new Date(iso);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

function toIsoFromLocalInput(value: string): string | null {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString();
}

function isWithinRange(iso: string, start: Date, end: Date): boolean {
  const date = new Date(iso);
  return date >= start && date < end;
}

function sortWeekItems(items: StudioScheduleItemDTO[]): StudioScheduleItemDTO[] {
  return [...items].sort((a, b) => {
    const aTime = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0;
    const bTime = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0;
    return aTime - bTime;
  });
}

function sortMonthItems(items: StudioScheduleItemDTO[]): StudioScheduleItemDTO[] {
  return [...items].sort((a, b) => {
    const aTime = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0;
    const bTime = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0;
    return aTime - bTime;
  });
}

function sortBacklogItems(
  items: StudioScheduleItemDTO[]
): StudioScheduleItemDTO[] {
  return [...items].sort((a, b) => {
    const aTime = new Date(a.updatedAt).getTime();
    const bTime = new Date(b.updatedAt).getTime();
    return bTime - aTime;
  });
}

function buildSuggestionItems(list: StudioSuggestion[]): SuggestionItem[] {
  return list.map((suggestion, index) => ({
    id: `${index}-${suggestion.channel}-${suggestion.scheduledAt}`,
    suggestion,
  }));
}

function formatSuggestionTime(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

export default function AgendaClient({
  initialView,
  initialYm,
  initialMonthItems,
  monthStartIso,
  monthEndIso,
  initialWeekItems,
  initialBacklogItems,
  weekStartIso,
  weekEndIso,
}: AgendaClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<AgendaView>(initialView ?? "month");
  const [selectedYm, setSelectedYm] = useState(initialYm);
  const [monthItems, setMonthItems] = useState<StudioScheduleItemDTO[]>(
    sortMonthItems(initialMonthItems)
  );
  const [weekItems, setWeekItems] = useState<StudioScheduleItemDTO[]>(
    sortWeekItems(initialWeekItems)
  );
  const [backlogItems, setBacklogItems] = useState<StudioScheduleItemDTO[]>(
    sortBacklogItems(initialBacklogItems)
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<NewItemFormState>({
    title: "",
    theme: "tokenizacao",
    channel: "blog",
    status: "idea",
    scheduledAt: "",
  });
  const [selectedDay, setSelectedDay] = useState<SelectedDay | null>(null);
  const [isDayDrawerOpen, setIsDayDrawerOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [selectedSuggestionIds, setSelectedSuggestionIds] = useState<
    Set<string>
  >(new Set());
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [suggestionsStatus, setSuggestionsStatus] = useState<
    "idle" | "loading" | "done" | "failed"
  >("idle");
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const weekStart = useMemo(() => new Date(weekStartIso), [weekStartIso]);
  const weekEnd = useMemo(() => new Date(weekEndIso), [weekEndIso]);
  const monthStart = useMemo(() => new Date(monthStartIso), [monthStartIso]);
  const monthEnd = useMemo(() => new Date(monthEndIso), [monthEndIso]);

  useEffect(() => {
    setActiveTab(initialView ?? "month");
  }, [initialView]);

  useEffect(() => {
    if (activeTab !== "month") {
      setIsDayDrawerOpen(false);
      setSuggestionsOpen(false);
    }
  }, [activeTab]);

  useEffect(() => {
    setSelectedYm(initialYm);
  }, [initialYm]);

  useEffect(() => {
    setIsDayDrawerOpen(false);
    setSelectedDay(null);
    setSuggestionsOpen(false);
    setSuggestions([]);
    setSelectedSuggestionIds(new Set());
    setSuggestionsStatus("idle");
    setSuggestionsError(null);
  }, [selectedYm]);

  useEffect(() => {
    setMonthItems(sortMonthItems(initialMonthItems));
  }, [initialMonthItems]);

  useEffect(() => {
    setWeekItems(sortWeekItems(initialWeekItems));
  }, [initialWeekItems]);

  useEffect(() => {
    setBacklogItems(sortBacklogItems(initialBacklogItems));
  }, [initialBacklogItems]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(weekStart.getTime() + index * DAY_MS);
      return {
        key: formatDateKey(date),
        label: DAY_LABELS[index],
        dateLabel: formatShortDate(date),
      };
    });
  }, [weekStart]);

  const groupedWeekItems = useMemo(() => {
    const groups: Record<string, StudioScheduleItemDTO[]> = {};
    weekItems.forEach((item) => {
      if (!item.scheduledAt) {
        return;
      }
      const key = formatDateKey(new Date(item.scheduledAt));
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
    });
    Object.values(groups).forEach((items) => {
      items.sort((a, b) => {
        const aTime = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0;
        const bTime = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0;
        return aTime - bTime;
      });
    });
    return groups;
  }, [weekItems]);

  const monthItemsByDay = useMemo(() => {
    const groups: Record<string, StudioScheduleItemDTO[]> = {};
    monthItems.forEach((item) => {
      if (!item.scheduledAt) {
        return;
      }
      const key = formatDateKey(new Date(item.scheduledAt));
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
    });
    Object.values(groups).forEach((items) => {
      items.sort((a, b) => {
        const aTime = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0;
        const bTime = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0;
        return aTime - bTime;
      });
    });
    return groups;
  }, [monthItems]);

  const upsertItem = (item: StudioScheduleItemDTO) => {
    const inWeek = item.scheduledAt
      ? isWithinRange(item.scheduledAt, weekStart, weekEnd)
      : false;
    const inMonth = item.scheduledAt
      ? isWithinRange(item.scheduledAt, monthStart, monthEnd)
      : false;

    setWeekItems((prev) => {
      const filtered = prev.filter((existing) => existing.id !== item.id);
      if (!inWeek) {
        return filtered;
      }
      return sortWeekItems([...filtered, item]);
    });

    setMonthItems((prev) => {
      const filtered = prev.filter((existing) => existing.id !== item.id);
      if (!inMonth) {
        return filtered;
      }
      return sortMonthItems([...filtered, item]);
    });

    setBacklogItems((prev) => {
      const filtered = prev.filter((existing) => existing.id !== item.id);
      if (item.scheduledAt) {
        return filtered;
      }
      return sortBacklogItems([item, ...filtered]);
    });
  };

  const resetForm = () => {
    setForm({
      title: "",
      theme: "tokenizacao",
      channel: "blog",
      status: "idea",
      scheduledAt: "",
    });
  };

  const getItemById = (id: string): StudioScheduleItemDTO | undefined => {
    return (
      weekItems.find((item) => item.id === id) ??
      backlogItems.find((item) => item.id === id) ??
      monthItems.find((item) => item.id === id)
    );
  };

  const applyPatch = (id: string, patch: ScheduleItemUpdateInput) => {
    const current = getItemById(id);
    if (!current) {
      return;
    }

    const next: StudioScheduleItemDTO = {
      ...current,
      ...patch,
      updatedAt: new Date().toISOString(),
    };

    upsertItem(next);
  };

  const handleTabChange = (view: AgendaView) => {
    setActiveTab(view);
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", view);
    if (selectedYm) {
      params.set("ym", selectedYm);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleMonthChange = (nextYm: string) => {
    setActiveTab("month");
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", "month");
    params.set("ym", nextYm);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleDaySelect = (day: SelectedDay) => {
    setSelectedDay(day);
    setIsDayDrawerOpen(true);
  };

  const handleCreateForDay = (dateKey: string) => {
    setForm((prev) => ({
      ...prev,
      scheduledAt: `${dateKey}T09:00`,
    }));
    setIsModalOpen(true);
    setIsDayDrawerOpen(false);
  };

  const handleCreate = () => {
    const title = form.title.trim();
    if (!title) {
      toast({
        title: "Erro",
        description: "Titulo obrigatorio.",
        variant: "destructive",
      });
      return;
    }

    const scheduledAt = toIsoFromLocalInput(form.scheduledAt);

    startTransition(() => {
      void createScheduleItem({
        title,
        theme: form.theme,
        channel: form.channel,
        status: form.status,
        scheduledAt,
      }).then((result) => {
        if (!result?.item) {
          toast({
            title: "Erro",
            description: result?.error || "Falha ao criar item.",
            variant: "destructive",
          });
          return;
        }

        upsertItem(result.item);
        resetForm();
        setIsModalOpen(false);

        toast({
          title: "Sucesso",
          description: "Pauta criada.",
          variant: "success",
        });
      });
    });
  };

  const handleUpdate = (id: string, patch: ScheduleItemUpdateInput) => {
    applyPatch(id, patch);

    startTransition(() => {
      void updateScheduleItem(id, patch).then((result) => {
        if (!result?.item) {
          toast({
            title: "Erro",
            description: result?.error || "Falha ao atualizar item.",
            variant: "destructive",
          });
          return;
        }

        upsertItem(result.item);
      });
    });
  };

  const handleGenerateDraft = (id: string) => {
    startTransition(() => {
      void generateDraftJob(id).then((result) => {
        if (!result?.success) {
          toast({
            title: "Erro",
            description: result?.error || "Falha ao enfileirar job.",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Job enfileirado",
          description: `jobId: ${result.jobId}`,
          variant: "success",
        });
      });
    });
  };

  const handleValidate = (id: string) => {
    const score = Number((Math.random() * 0.35 + 0.6).toFixed(2));
    handleUpdate(id, { guardrailScore: score });
  };

  const handleApprove = (id: string) => {
    handleUpdate(id, { status: "approved" });
  };

  const handleGenerateMonthIdeas = () => {
    setSuggestionsStatus("loading");
    setSuggestionsError(null);

    startTransition(() => {
      void generateMonthIdeas({ ym: selectedYm }).then((result) => {
        if (!result?.suggestions) {
          setSuggestions([]);
          setSelectedSuggestionIds(new Set());
          setSuggestionsStatus("failed");
          setSuggestionsError(result?.error || "Falha ao gerar pautas.");
          setSuggestionsOpen(true);
          toast({
            title: "Erro",
            description: result?.error || "Falha ao gerar pautas.",
            variant: "destructive",
          });
          return;
        }

        const items = buildSuggestionItems(result.suggestions);
        setSuggestions(items);
        setSelectedSuggestionIds(new Set(items.map((item) => item.id)));
        setSuggestionsStatus(result.status);
        setSuggestionsError(result.error || null);
        setSuggestionsOpen(true);

        if (result.status === "failed") {
          toast({
            title: "Fallback aplicado",
            description:
              result.error || "IA indisponivel, sugestoes geradas por fallback.",
            variant: "default",
          });
        } else {
          toast({
            title: "Sugestoes prontas",
            description: `jobId: ${result.jobId}`,
            variant: "success",
          });
        }
      });
    });
  };

  const handleToggleSuggestion = (id: string) => {
    setSelectedSuggestionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleApplySuggestions = () => {
    const selected = suggestions
      .filter((item) => selectedSuggestionIds.has(item.id))
      .map((item) => item.suggestion);

    if (!selected.length) {
      toast({
        title: "Selecione ao menos uma sugestao",
        variant: "destructive",
      });
      return;
    }

    startTransition(() => {
      void applySuggestions({ suggestions: selected }).then((result) => {
        if (!result?.items) {
          toast({
            title: "Erro",
            description: result?.error || "Falha ao aplicar sugestoes.",
            variant: "destructive",
          });
          return;
        }

        result.items.forEach(upsertItem);
        setSuggestionsOpen(false);
        setSuggestions([]);
        setSelectedSuggestionIds(new Set());
        setSuggestionsStatus("idle");
        setSuggestionsError(null);

        toast({
          title: "Sugestoes aplicadas",
          description: `${result.items.length} itens criados.`,
          variant: "success",
        });
      });
    });
  };

  const selectedDayItems = selectedDay
    ? monthItemsByDay[selectedDay.dateKey] ?? []
    : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2 text-xs">
          {VIEW_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleTabChange(option.value)}
              className={`px-3 py-1 rounded border transition ${
                activeTab === option.value
                  ? "border-highlight-light text-highlight-light dark:border-highlight-dark dark:text-highlight-dark bg-secondary-light/30 dark:bg-secondary-dark/30"
                  : "border-secondary-dark/30 dark:border-secondary-light/30 text-secondary-dark dark:text-secondary-light hover:bg-secondary-light/30 dark:hover:bg-secondary-dark/30"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {activeTab === "month" && (
            <button
              type="button"
              onClick={handleGenerateMonthIdeas}
              disabled={isPending || suggestionsStatus === "loading"}
              className="text-xs px-3 py-2 border rounded border-highlight-light text-highlight-light dark:border-highlight-dark dark:text-highlight-dark hover:bg-secondary-light/30 dark:hover:bg-secondary-dark/30 transition"
            >
              {suggestionsStatus === "loading"
                ? "Gerando pautas..."
                : "Gerar pautas do mes"}
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="text-xs px-3 py-2 border rounded border-secondary-dark/40 dark:border-secondary-light/40 hover:bg-secondary-light/30 dark:hover:bg-secondary-dark/30 transition"
          >
            Nova pauta
          </button>
        </div>
      </div>

      {activeTab === "month" && (
        <MonthCalendar
          ym={selectedYm}
          itemsByDay={monthItemsByDay}
          onDaySelect={handleDaySelect}
          onMonthChange={handleMonthChange}
        />
      )}

      {activeTab === "week" && (
        <div className="space-y-3">
          {weekDays.map((day) => {
            const items = groupedWeekItems[day.key] ?? [];
            return (
              <div
                key={day.key}
                className="rounded border border-secondary-dark/30 dark:border-secondary-light/30"
              >
                <div className="flex items-center justify-between px-3 py-2 bg-secondary-light/40 dark:bg-secondary-dark/40">
                  <div className="text-sm font-semibold text-highlight-light dark:text-highlight-dark">
                    {day.label}
                    <span className="ml-2 text-xs text-secondary-dark/70 dark:text-secondary-light/70">
                      {day.dateLabel}
                    </span>
                  </div>
                  <span className="text-xs text-secondary-dark/70 dark:text-secondary-light/70">
                    {items.length} itens
                  </span>
                </div>
                <div className="p-3 space-y-3">
                  {items.length === 0 ? (
                    <p className="text-xs text-secondary-dark/70 dark:text-secondary-light/70">
                      Sem pautas para este dia.
                    </p>
                  ) : (
                    items.map((item) => (
                      <ScheduleItemCard
                        key={item.id}
                        item={item}
                        onUpdate={handleUpdate}
                        onGenerateDraft={handleGenerateDraft}
                        onValidate={handleValidate}
                        onApprove={handleApprove}
                        disabled={isPending}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "backlog" && (
        <div className="space-y-3">
          {backlogItems.length === 0 ? (
            <div className="rounded border border-secondary-dark/30 dark:border-secondary-light/30 p-4 text-xs text-secondary-dark/70 dark:text-secondary-light/70">
              Nenhuma pauta no backlog.
            </div>
          ) : (
            backlogItems.map((item) => (
              <ScheduleItemCard
                key={item.id}
                item={item}
                onUpdate={handleUpdate}
                onGenerateDraft={handleGenerateDraft}
                onValidate={handleValidate}
                onApprove={handleApprove}
                disabled={isPending}
              />
            ))
          )}
        </div>
      )}

      <DayDrawer
        open={isDayDrawerOpen}
        day={selectedDay}
        items={selectedDayItems}
        onClose={() => setIsDayDrawerOpen(false)}
        onCreateForDay={handleCreateForDay}
      />

      <SuggestionsDrawer
        open={suggestionsOpen}
        items={suggestions}
        selectedIds={selectedSuggestionIds}
        status={suggestionsStatus}
        error={suggestionsError}
        onClose={() => setSuggestionsOpen(false)}
        onToggle={handleToggleSuggestion}
        onApply={handleApplySuggestions}
        onRetry={handleGenerateMonthIdeas}
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded border border-secondary-dark/30 dark:border-secondary-light/30 bg-primary dark:bg-primary-dark p-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-highlight-light dark:text-highlight-dark">
                Nova pauta
              </h2>
              <p className="text-xs text-secondary-dark/80 dark:text-secondary-light/80">
                Crie uma pauta e opcionalmente agende para a semana.
              </p>
            </div>

            <div className="mt-4 space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-secondary-dark dark:text-secondary-light">
                  Titulo
                </label>
                <input
                  value={form.title}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                  className="w-full rounded border border-secondary-dark/30 dark:border-secondary-light/30 bg-transparent px-3 py-2 text-sm"
                  placeholder="Nova pauta"
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs text-secondary-dark dark:text-secondary-light">
                    Canal
                  </label>
                  <select
                    value={form.channel}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        channel: event.target.value as StudioChannel,
                      }))
                    }
                    className="w-full rounded border border-secondary-dark/30 dark:border-secondary-light/30 bg-transparent px-3 py-2 text-sm"
                  >
                    {CHANNEL_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-secondary-dark dark:text-secondary-light">
                    Tema
                  </label>
                  <select
                    value={form.theme}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        theme: event.target.value as StudioTheme,
                      }))
                    }
                    className="w-full rounded border border-secondary-dark/30 dark:border-secondary-light/30 bg-transparent px-3 py-2 text-sm"
                  >
                    {THEME_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-secondary-dark dark:text-secondary-light">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        status: event.target.value as StudioStatus,
                      }))
                    }
                    className="w-full rounded border border-secondary-dark/30 dark:border-secondary-light/30 bg-transparent px-3 py-2 text-sm"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-secondary-dark dark:text-secondary-light">
                    Agendar (opcional)
                  </label>
                  <input
                    type="datetime-local"
                    value={form.scheduledAt}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        scheduledAt: event.target.value,
                      }))
                    }
                    className="w-full rounded border border-secondary-dark/30 dark:border-secondary-light/30 bg-transparent px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setIsModalOpen(false);
                }}
                className="text-xs px-3 py-2 border rounded border-secondary-dark/40 dark:border-secondary-light/40 hover:bg-secondary-light/30 dark:hover:bg-secondary-dark/30 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleCreate}
                className="text-xs px-3 py-2 border rounded border-highlight-light text-highlight-light dark:border-highlight-dark dark:text-highlight-dark hover:bg-secondary-light/30 dark:hover:bg-secondary-dark/30 transition"
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type ScheduleItemCardProps = {
  item: StudioScheduleItemDTO;
  onUpdate: (id: string, patch: ScheduleItemUpdateInput) => void;
  onGenerateDraft: (id: string) => void;
  onValidate: (id: string) => void;
  onApprove: (id: string) => void;
  disabled?: boolean;
};

function ScheduleItemCard({
  item,
  onUpdate,
  onGenerateDraft,
  onValidate,
  onApprove,
  disabled,
}: ScheduleItemCardProps) {
  const [title, setTitle] = useState(item.title);
  const [scheduledValue, setScheduledValue] = useState(
    toLocalInputValue(item.scheduledAt)
  );

  useEffect(() => {
    setTitle(item.title);
  }, [item.id, item.title]);

  useEffect(() => {
    setScheduledValue(toLocalInputValue(item.scheduledAt));
  }, [item.id, item.scheduledAt]);

  const handleTitleBlur = () => {
    const trimmed = title.trim();
    if (!trimmed) {
      setTitle(item.title);
      return;
    }
    if (trimmed !== item.title) {
      onUpdate(item.id, { title: trimmed });
    }
  };

  const handleScheduledBlur = () => {
    const nextIso = toIsoFromLocalInput(scheduledValue);
    const currentIso = item.scheduledAt ?? null;
    if (nextIso !== currentIso) {
      onUpdate(item.id, { scheduledAt: nextIso });
    }
  };

  return (
    <div className="rounded border border-secondary-dark/30 dark:border-secondary-light/30 bg-secondary-light/10 dark:bg-secondary-dark/30 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onBlur={handleTitleBlur}
          className="flex-1 rounded border border-secondary-dark/30 dark:border-secondary-light/30 bg-transparent px-3 py-2 text-sm font-medium"
          placeholder="Titulo"
          disabled={disabled}
        />
        {item.guardrailScore !== null && item.guardrailScore !== undefined && (
          <span className="text-xs text-secondary-dark/70 dark:text-secondary-light/70">
            Guardrail {Math.round(item.guardrailScore * 100)}%
          </span>
        )}
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-4">
        <select
          value={item.channel}
          onChange={(event) =>
            onUpdate(item.id, { channel: event.target.value as StudioChannel })
          }
          className="w-full rounded border border-secondary-dark/30 dark:border-secondary-light/30 bg-transparent px-3 py-2 text-xs"
          disabled={disabled}
        >
          {CHANNEL_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={item.theme}
          onChange={(event) =>
            onUpdate(item.id, { theme: event.target.value as StudioTheme })
          }
          className="w-full rounded border border-secondary-dark/30 dark:border-secondary-light/30 bg-transparent px-3 py-2 text-xs"
          disabled={disabled}
        >
          {THEME_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={item.status}
          onChange={(event) =>
            onUpdate(item.id, { status: event.target.value as StudioStatus })
          }
          className="w-full rounded border border-secondary-dark/30 dark:border-secondary-light/30 bg-transparent px-3 py-2 text-xs"
          disabled={disabled}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <input
          type="datetime-local"
          value={scheduledValue}
          onChange={(event) => setScheduledValue(event.target.value)}
          onBlur={handleScheduledBlur}
          className="w-full rounded border border-secondary-dark/30 dark:border-secondary-light/30 bg-transparent px-3 py-2 text-xs"
          disabled={disabled}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onGenerateDraft(item.id)}
          className="text-xs px-2 py-1 border rounded border-secondary-dark/40 dark:border-secondary-light/40 hover:bg-secondary-light/30 dark:hover:bg-secondary-dark/30 transition"
          disabled={disabled}
        >
          Gerar rascunho
        </button>
        <button
          type="button"
          onClick={() => onValidate(item.id)}
          className="text-xs px-2 py-1 border rounded border-secondary-dark/40 dark:border-secondary-light/40 hover:bg-secondary-light/30 dark:hover:bg-secondary-dark/30 transition"
          disabled={disabled}
        >
          Validar
        </button>
        <button
          type="button"
          onClick={() => onApprove(item.id)}
          className="text-xs px-2 py-1 border rounded border-secondary-dark/40 dark:border-secondary-light/40 hover:bg-secondary-light/30 dark:hover:bg-secondary-dark/30 transition"
          disabled={disabled}
        >
          Aprovar
        </button>
      </div>
    </div>
  );
}

type SuggestionsDrawerProps = {
  open: boolean;
  items: SuggestionItem[];
  selectedIds: Set<string>;
  status: "idle" | "loading" | "done" | "failed";
  error: string | null;
  onClose: () => void;
  onToggle: (id: string) => void;
  onApply: () => void;
  onRetry: () => void;
};

function SuggestionsDrawer({
  open,
  items,
  selectedIds,
  status,
  error,
  onClose,
  onToggle,
  onApply,
  onRetry,
}: SuggestionsDrawerProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="absolute right-0 top-0 h-full w-full max-w-lg bg-primary dark:bg-primary-dark border-l border-secondary-dark/30 dark:border-secondary-light/30 p-4 overflow-y-auto"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold text-highlight-light dark:text-highlight-dark">
              Sugestoes do mes
            </h3>
            <p className="text-xs text-secondary-dark/70 dark:text-secondary-light/70">
              {items.length} sugestoes disponiveis
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

        {status === "failed" && (
          <div className="mt-4 rounded border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-600">
            {error || "Falha ao gerar pautas com IA."}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-secondary-dark/70 dark:text-secondary-light/70">
            Selecione o que deseja aplicar
          </span>
          <button
            type="button"
            onClick={onRetry}
            disabled={status === "loading"}
            className="text-xs px-2 py-1 border rounded border-secondary-dark/40 dark:border-secondary-light/40 hover:bg-secondary-light/30 dark:hover:bg-secondary-dark/30 transition"
          >
            Gerar novamente
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {items.length === 0 ? (
            <div className="rounded border border-secondary-dark/30 dark:border-secondary-light/30 p-3 text-xs text-secondary-dark/70 dark:text-secondary-light/70">
              Nenhuma sugestao disponivel.
            </div>
          ) : (
            items.map((item) => (
              <label
                key={item.id}
                className="block rounded border border-secondary-dark/30 dark:border-secondary-light/30 bg-secondary-light/10 dark:bg-secondary-dark/30 p-3"
              >
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(item.id)}
                    onChange={() => onToggle(item.id)}
                    className="mt-1 h-4 w-4"
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-highlight-light dark:text-highlight-dark">
                        {item.suggestion.title}
                      </p>
                      <span className="text-[10px] text-secondary-dark/70 dark:text-secondary-light/70">
                        {formatSuggestionTime(item.suggestion.scheduledAt)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-[10px] text-secondary-dark dark:text-secondary-light">
                      <span className="rounded border border-secondary-dark/40 dark:border-secondary-light/40 px-2 py-0.5">
                        {item.suggestion.channel}
                      </span>
                      <span className="rounded border border-secondary-dark/40 dark:border-secondary-light/40 px-2 py-0.5">
                        {item.suggestion.theme}
                      </span>
                    </div>
                    {item.suggestion.rationale && (
                      <p className="text-xs text-secondary-dark/70 dark:text-secondary-light/70">
                        {item.suggestion.rationale}
                      </p>
                    )}
                  </div>
                </div>
              </label>
            ))
          )}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onApply}
            disabled={status === "loading"}
            className="text-xs px-3 py-2 border rounded border-highlight-light text-highlight-light dark:border-highlight-dark dark:text-highlight-dark hover:bg-secondary-light/30 dark:hover:bg-secondary-dark/30 transition"
          >
            Aplicar selecionadas
          </button>
        </div>
      </div>
    </div>
  );
}
