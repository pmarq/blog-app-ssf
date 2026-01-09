import type { Timestamp } from "firebase-admin/firestore";

export type StudioTheme =
  | "tokenizacao"
  | "resultados_trimestrais"
  | "lancamentos"
  | "hub_weekly"
  | "educativo";

export type StudioChannel =
  | "blog"
  | "instagram"
  | "stories"
  | "reels"
  | "newsletter";

export type StudioStatus =
  | "idea"
  | "draft"
  | "review"
  | "approved"
  | "scheduled"
  | "published";

export type StudioScheduleItem = {
  id: string;
  orgId: string;
  title: string;
  theme: StudioTheme;
  channel: StudioChannel;
  status: StudioStatus;
  scheduledAt?: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  guardrailScore?: number | null;
};

export type StudioScheduleItemDTO = Omit<
  StudioScheduleItem,
  "scheduledAt" | "createdAt" | "updatedAt"
> & {
  scheduledAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StudioScheduleItemInput = {
  title: string;
  theme: StudioTheme;
  channel: StudioChannel;
  status: StudioStatus;
  scheduledAt?: Timestamp | null;
  guardrailScore?: number | null;
};

export type StudioScheduleItemUpdate = Partial<
  Pick<
    StudioScheduleItemInput,
    "title" | "theme" | "channel" | "status" | "scheduledAt" | "guardrailScore"
  >
>;

export type StudioJobType = "generate_draft";
export type StudioJobStatus = "queued";

export type StudioJob = {
  id: string;
  orgId: string;
  scheduleItemId: string;
  type: StudioJobType;
  status: StudioJobStatus;
  createdAt: Timestamp;
};
