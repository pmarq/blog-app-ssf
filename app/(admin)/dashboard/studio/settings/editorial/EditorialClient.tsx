"use client";

import { useEffect, useState, useTransition } from "react";
import { useToast } from "@/hooks/use-toast";

import {
  resetEditorialSettings,
  saveEditorialSettings,
} from "./actions";
import type {
  StudioCadence,
  StudioEditorialSettingsDTO,
  StudioPillarSetting,
  StudioTheme,
} from "@/lib/studio/types";

const TONE_OPTIONS = [
  "premium",
  "investidor",
  "educativo",
  "institucional",
];

const PILLAR_LABELS: Record<StudioTheme, string> = {
  tokenizacao: "tokenizacao",
  resultados_trimestrais: "resultados_trimestrais",
  lancamentos: "lancamentos",
  hub_weekly: "hub_weekly",
  educativo: "educativo",
};

type PillarForm = {
  key: StudioTheme;
  enabled: boolean;
  weight: number | "";
};

type EditorialClientProps = {
  initialSettings: StudioEditorialSettingsDTO;
};

function toPillarForm(pillars: StudioPillarSetting[]): PillarForm[] {
  return pillars.map((pillar) => ({
    key: pillar.key,
    enabled: pillar.enabled,
    weight: typeof pillar.weight === "number" ? pillar.weight : "",
  }));
}

function toGuardrailsText(guardrails: string[]): string {
  return guardrails.join("\n");
}

export default function EditorialClient({ initialSettings }: EditorialClientProps) {
  const [pillars, setPillars] = useState<PillarForm[]>(
    toPillarForm(initialSettings.pillars)
  );
  const [cadence, setCadence] = useState<StudioCadence>(
    initialSettings.cadence
  );
  const [tone, setTone] = useState(initialSettings.tone);
  const [guardrailsText, setGuardrailsText] = useState(
    toGuardrailsText(initialSettings.guardrails)
  );
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    setPillars(toPillarForm(initialSettings.pillars));
    setCadence(initialSettings.cadence);
    setTone(initialSettings.tone);
    setGuardrailsText(toGuardrailsText(initialSettings.guardrails));
  }, [initialSettings]);

  const handleTogglePillar = (key: StudioTheme) => {
    setPillars((prev) =>
      prev.map((pillar) =>
        pillar.key === key
          ? { ...pillar, enabled: !pillar.enabled }
          : pillar
      )
    );
  };

  const handleWeightChange = (key: StudioTheme, value: string) => {
    const nextValue = value === "" ? "" : Number(value);
    setPillars((prev) =>
      prev.map((pillar) =>
        pillar.key === key ? { ...pillar, weight: nextValue } : pillar
      )
    );
  };

  const handleCadenceChange = (channel: keyof StudioCadence, value: string) => {
    const parsed = Number(value);
    setCadence((prev) => ({
      ...prev,
      [channel]: Number.isNaN(parsed) ? 0 : Math.max(0, parsed),
    }));
  };

  const buildPayload = () => {
    const guardrails = guardrailsText
      .split("\n")
      .map((rule) => rule.trim())
      .filter((rule) => rule.length > 0);

    return {
      pillars: pillars.map((pillar) => ({
        key: pillar.key,
        enabled: pillar.enabled,
        weight:
          pillar.weight === ""
            ? null
            : Math.max(0, Math.min(100, Number(pillar.weight))),
      })),
      cadence,
      tone,
      guardrails,
    };
  };

  const handleSave = () => {
    startTransition(() => {
      void saveEditorialSettings(buildPayload()).then((result) => {
        if (!result?.settings) {
          toast({
            title: "Erro",
            description: result?.error || "Falha ao salvar configuracoes.",
            variant: "destructive",
          });
          return;
        }

        setPillars(toPillarForm(result.settings.pillars));
        setCadence(result.settings.cadence);
        setTone(result.settings.tone);
        setGuardrailsText(toGuardrailsText(result.settings.guardrails));

        toast({
          title: "Sucesso",
          description: "Configuracoes salvas.",
          variant: "success",
        });
      });
    });
  };

  const handleReset = () => {
    startTransition(() => {
      void resetEditorialSettings().then((result) => {
        if (!result?.settings) {
          toast({
            title: "Erro",
            description:
              result?.error || "Falha ao restaurar configuracoes.",
            variant: "destructive",
          });
          return;
        }

        setPillars(toPillarForm(result.settings.pillars));
        setCadence(result.settings.cadence);
        setTone(result.settings.tone);
        setGuardrailsText(toGuardrailsText(result.settings.guardrails));

        toast({
          title: "Padrao restaurado",
          description: "Configuracoes voltaram ao padrao.",
          variant: "success",
        });
      });
    });
  };

  return (
    <div className="space-y-6">
      <section className="rounded border border-secondary-dark/30 dark:border-secondary-light/30 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-highlight-light dark:text-highlight-dark">
              Pilares
            </h2>
            <p className="text-xs text-secondary-dark/70 dark:text-secondary-light/70">
              Ative pilares e ajuste pesos opcionais (0-100).
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {pillars.map((pillar) => (
            <div
              key={pillar.key}
              className="flex flex-wrap items-center gap-3 text-sm"
            >
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={pillar.enabled}
                  onChange={() => handleTogglePillar(pillar.key)}
                  className="h-4 w-4"
                />
                <span className="text-secondary-dark dark:text-secondary-light">
                  {PILLAR_LABELS[pillar.key]}
                </span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-secondary-dark/70 dark:text-secondary-light/70">
                  Peso
                </span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={pillar.weight}
                  onChange={(event) =>
                    handleWeightChange(pillar.key, event.target.value)
                  }
                  className="w-20 rounded border border-secondary-dark/30 dark:border-secondary-light/30 bg-transparent px-2 py-1 text-xs"
                  placeholder="0-100"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded border border-secondary-dark/30 dark:border-secondary-light/30 p-4">
        <h2 className="text-sm font-semibold text-highlight-light dark:text-highlight-dark">
          Cadencia por canal (por semana)
        </h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {(Object.keys(cadence) as Array<keyof StudioCadence>).map((channel) => (
            <label key={channel} className="flex items-center justify-between">
              <span className="text-xs text-secondary-dark dark:text-secondary-light">
                {channel}
              </span>
              <input
                type="number"
                min={0}
                value={cadence[channel]}
                onChange={(event) =>
                  handleCadenceChange(channel, event.target.value)
                }
                className="w-20 rounded border border-secondary-dark/30 dark:border-secondary-light/30 bg-transparent px-2 py-1 text-xs"
              />
            </label>
          ))}
        </div>
      </section>

      <section className="rounded border border-secondary-dark/30 dark:border-secondary-light/30 p-4">
        <h2 className="text-sm font-semibold text-highlight-light dark:text-highlight-dark">
          Tom de voz
        </h2>
        <div className="mt-3">
          <input
            list="tone-options"
            value={tone}
            onChange={(event) => setTone(event.target.value)}
            className="w-full rounded border border-secondary-dark/30 dark:border-secondary-light/30 bg-transparent px-3 py-2 text-sm"
            placeholder="Ex.: premium"
          />
          <datalist id="tone-options">
            {TONE_OPTIONS.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
        </div>
      </section>

      <section className="rounded border border-secondary-dark/30 dark:border-secondary-light/30 p-4">
        <h2 className="text-sm font-semibold text-highlight-light dark:text-highlight-dark">
          Guardrails
        </h2>
        <p className="text-xs text-secondary-dark/70 dark:text-secondary-light/70">
          Uma regra por linha.
        </p>
        <textarea
          value={guardrailsText}
          onChange={(event) => setGuardrailsText(event.target.value)}
          rows={4}
          className="mt-3 w-full rounded border border-secondary-dark/30 dark:border-secondary-light/30 bg-transparent px-3 py-2 text-sm"
          placeholder="Nao prometer rentabilidade."
        />
      </section>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="text-xs px-3 py-2 border rounded border-highlight-light text-highlight-light dark:border-highlight-dark dark:text-highlight-dark hover:bg-secondary-light/30 dark:hover:bg-secondary-dark/30 transition"
        >
          Salvar
        </button>
        <button
          type="button"
          onClick={handleReset}
          disabled={isPending}
          className="text-xs px-3 py-2 border rounded border-secondary-dark/40 dark:border-secondary-light/40 hover:bg-secondary-light/30 dark:hover:bg-secondary-dark/30 transition"
        >
          Restaurar padrao
        </button>
      </div>
    </div>
  );
}
