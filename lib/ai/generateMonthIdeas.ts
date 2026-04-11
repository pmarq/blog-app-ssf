import { z } from "zod";

import type {
  StudioChannel,
  StudioEditorialSettings,
  StudioSuggestion,
  StudioTheme,
} from "@/lib/studio/types";
import { generateJson } from "./openai";

const THEMES: StudioTheme[] = [
  "tokenizacao",
  "resultados_trimestrais",
  "lancamentos",
  "hub_weekly",
  "educativo",
];

const CHANNELS: StudioChannel[] = [
  "blog",
  "instagram",
  "stories",
  "reels",
  "newsletter",
];

export const SUGGESTION_SCHEMA = z.object({
  title: z.string().min(4),
  theme: z.enum([
    "tokenizacao",
    "resultados_trimestrais",
    "lancamentos",
    "hub_weekly",
    "educativo",
  ]),
  channel: z.enum(["blog", "instagram", "stories", "reels", "newsletter"]),
  scheduledAt: z.string(),
  rationale: z.string().optional(),
});

export const SUGGESTIONS_SCHEMA = z.object({
  suggestions: z.array(SUGGESTION_SCHEMA).min(1).max(20),
});

export type GenerateMonthIdeasInput = {
  ym: string;
  timezone: string;
  days: Array<{ dateKey: string; isOccupied: boolean; weekday: number }>;
  settings: StudioEditorialSettings;
  targetCount: number;
};

export type GenerateMonthIdeasResult = {
  suggestions: StudioSuggestion[];
  source: "ai" | "fallback";
  error?: string;
};

const DEFAULT_TIME_BY_CHANNEL: Record<StudioChannel, string> = {
  blog: "09:00",
  newsletter: "09:00",
  instagram: "12:00",
  stories: "10:00",
  reels: "10:00",
};

function buildPrompt(input: GenerateMonthIdeasInput): string {
  const enabledPillars = input.settings.pillars
    .filter((pillar) => pillar.enabled)
    .map((pillar) => ({ key: pillar.key, weight: pillar.weight ?? 0 }));

  const availableDays = input.days
    .filter((day) => !day.isOccupied)
    .map((day) => day.dateKey);

  return [
    "Voce eh um planner editorial. Gere pautas com base nas configuracoes abaixo.",
    "Responda SOMENTE com JSON valido no formato: {\"suggestions\": Suggestion[] }.",
    "Suggestion: { title, theme, channel, scheduledAt, rationale? }.",
    `Mes (ym): ${input.ym}. Timezone: ${input.timezone}.`,
    `Total de sugestoes desejado: ${input.targetCount}.`,
    `Dias disponiveis (sem item): ${availableDays.join(", ")}.`,
    `Pilares ativos (com peso): ${JSON.stringify(enabledPillars)}.`,
    `Cadencia por canal (por semana): ${JSON.stringify(input.settings.cadence)}.`,
    `Tom de voz: ${input.settings.tone}.`,
    `Guardrails: ${input.settings.guardrails.join(" | ")}.`,
    "Regras:",
    "- Use somente os dias disponiveis.",
    "- Evite repetir o mesmo tema em sequencia.",
    "- Use 'hub_weekly' preferencialmente em segunda ou sexta.",
    "- Use horarios padrao por canal:",
    `  blog/newsletter: ${DEFAULT_TIME_BY_CHANNEL.blog}, instagram: ${DEFAULT_TIME_BY_CHANNEL.instagram} ou 19:00, stories/reels: ${DEFAULT_TIME_BY_CHANNEL.stories}.`,
    "- scheduledAt deve ser ISO com offset -03:00, exemplo: 2026-01-14T09:00:00-03:00.",
    "- Nao invente canais/temas fora da lista.",
    "- Gere entre 12 e 20 sugestoes, ou menos se houver poucos dias disponiveis.",
  ].join("\n");
}

function formatScheduledAt(dateKey: string, time: string): string {
  return `${dateKey}T${time}:00-03:00`;
}

function fallbackSuggestions(input: GenerateMonthIdeasInput): StudioSuggestion[] {
  const availableDays = input.days.filter((day) => !day.isOccupied);
  if (availableDays.length === 0) {
    return [];
  }

  const enabledPillars = input.settings.pillars
    .filter((pillar) => pillar.enabled)
    .map((pillar) => pillar.key);

  const targetCount = Math.min(6, availableDays.length);
  const results: StudioSuggestion[] = [];
  const usedDates = new Set<string>();

  for (let index = 0; index < targetCount; index += 1) {
    const slotIndex = Math.floor(
      (index / targetCount) * availableDays.length
    );
    const day = availableDays[Math.min(slotIndex, availableDays.length - 1)];
    if (usedDates.has(day.dateKey)) {
      continue;
    }

    const channel = CHANNELS[index % CHANNELS.length];
    const theme = enabledPillars[index % enabledPillars.length] ?? "educativo";
    const time = DEFAULT_TIME_BY_CHANNEL[channel];

    results.push({
      title: `${theme} - pauta ${index + 1}`,
      theme,
      channel,
      scheduledAt: formatScheduledAt(day.dateKey, time),
      rationale: "Sugestao padrao (fallback).",
    });

    usedDates.add(day.dateKey);
  }

  const hubWeeklyIndex = results.findIndex(
    (item) => item.theme === "hub_weekly"
  );

  if (hubWeeklyIndex >= 0) {
    const mondayOrFriday = availableDays.find(
      (day) => (day.weekday === 1 || day.weekday === 5) && !day.isOccupied
    );
    if (mondayOrFriday) {
      results[hubWeeklyIndex] = {
        ...results[hubWeeklyIndex],
        scheduledAt: formatScheduledAt(
          mondayOrFriday.dateKey,
          DEFAULT_TIME_BY_CHANNEL[results[hubWeeklyIndex].channel]
        ),
      };
    }
  }

  return results;
}

function filterValidSuggestions(
  suggestions: StudioSuggestion[],
  input: GenerateMonthIdeasInput
): StudioSuggestion[] {
  const available = new Set(
    input.days.filter((day) => !day.isOccupied).map((day) => day.dateKey)
  );

  const filtered: StudioSuggestion[] = [];
  for (const suggestion of suggestions) {
    const dateKey = suggestion.scheduledAt.slice(0, 10);
    if (!available.has(dateKey)) {
      continue;
    }
    if (!THEMES.includes(suggestion.theme)) {
      continue;
    }
    if (!CHANNELS.includes(suggestion.channel)) {
      continue;
    }
    filtered.push(suggestion);
    if (filtered.length >= input.targetCount) {
      break;
    }
  }

  return filtered;
}

export async function generateMonthIdeas(
  input: GenerateMonthIdeasInput
): Promise<GenerateMonthIdeasResult> {
  const prompt = buildPrompt(input);

  try {
    const parsed = await generateJson({ prompt, schema: SUGGESTIONS_SCHEMA });
    const suggestions = filterValidSuggestions(parsed.suggestions, input);

    if (suggestions.length === 0) {
      return {
        suggestions: fallbackSuggestions(input),
        source: "fallback",
        error: "Resposta da IA vazia ou invalida.",
      };
    }

    return { suggestions, source: "ai" };
  } catch (error) {
    console.error("Falha ao gerar ideias com IA:", error);
    return {
      suggestions: fallbackSuggestions(input),
      source: "fallback",
      error: (error as Error).message || "Falha ao gerar pautas.",
    };
  }
}
