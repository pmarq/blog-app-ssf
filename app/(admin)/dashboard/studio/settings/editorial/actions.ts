"use server";

import { revalidatePath } from "next/cache";

import {
  getEditorialSettings,
  resetEditorialSettings as resetEditorialSettingsLib,
  saveEditorialSettings as saveEditorialSettingsLib,
  serializeEditorialSettings,
} from "@/lib/studio/settings";
import type {
  StudioChannel,
  StudioEditorialSettingsDTO,
  StudioPillarSetting,
} from "@/lib/studio/types";

export type EditorialSettingsPayload = {
  pillars: StudioPillarSetting[];
  cadence: Record<StudioChannel, number>;
  tone: string;
  guardrails: string[];
};

export async function loadEditorialSettings(): Promise<{
  settings?: StudioEditorialSettingsDTO;
  error?: string;
}> {
  try {
    const settings = await getEditorialSettings();
    return { settings: serializeEditorialSettings(settings) };
  } catch (error) {
    console.error("Erro ao carregar editorial settings:", error);
    return { error: "Falha ao carregar configuracoes." };
  }
}

export async function saveEditorialSettings(
  payload: EditorialSettingsPayload
): Promise<{ settings?: StudioEditorialSettingsDTO; error?: string }> {
  try {
    const settings = await saveEditorialSettingsLib({
      pillars: payload.pillars,
      cadence: payload.cadence,
      tone: payload.tone,
      guardrails: payload.guardrails,
    });

    revalidatePath("/dashboard/studio/settings/editorial");

    return { settings: serializeEditorialSettings(settings) };
  } catch (error) {
    console.error("Erro ao salvar editorial settings:", error);
    return { error: "Falha ao salvar configuracoes." };
  }
}

export async function resetEditorialSettings(): Promise<{
  settings?: StudioEditorialSettingsDTO;
  error?: string;
}> {
  try {
    const settings = await resetEditorialSettingsLib();

    revalidatePath("/dashboard/studio/settings/editorial");

    return { settings: serializeEditorialSettings(settings) };
  } catch (error) {
    console.error("Erro ao restaurar editorial settings:", error);
    return { error: "Falha ao restaurar configuracoes." };
  }
}
