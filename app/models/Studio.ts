// Shared types for the Content Ops Studio (contracts + logging)

export type StudioLocale = "pt-BR" | "en-US" | string;

export interface StudioContext {
  orgId: string;
  userId: string;
  postId?: string;
  briefId?: string;
  assetSetId?: string;
  locale?: StudioLocale;
  tone?: string;
}

export type ActionType =
  | "insert_title"
  | "insert_outline"
  | "insert_body"
  | "insert_seo"
  | "insert_ctas"
  | "visual_prompt"
  | "moodboard"
  | "curation"
  | "guardrail_fix"
  | "error";

export interface Action {
  type: ActionType;
  value?: string;
  meta?: string;
  tags?: string[] | string;
  items?: string[];
  prompt?: string;
  data?: unknown;
  message?: string;
}

export type GuardrailSeverity = "info" | "warn" | "block";

export interface GuardrailIssue {
  field: string;
  message: string;
  severity: GuardrailSeverity;
}

export interface Claim {
  value: string;
  year: number | string;
  source: string;
  context?: string;
}

export interface ActionResult {
  schemaVersion: "1.0";
  runId: string;
  context: StudioContext;
  actions: Action[];
  guardrailScore?: number;
  issues?: GuardrailIssue[];
  claims?: Claim[];
  notes?: string;
  applied?: boolean;
}

export type JobStatus =
  | "queued"
  | "running"
  | "succeeded"
  | "failed"
  | "canceled";

export type JobType = "instagram_publish" | "instagram_schedule" | "blog_publish";

export interface JobPayload {
  [key: string]: unknown;
}

export interface Job {
  id?: string;
  idempotencyKey: string;
  type: JobType;
  payload: JobPayload;
  status: JobStatus;
  runAt?: string;
  nextRunAt?: string;
  lockedBy?: string;
  leaseUntil?: string;
  attempts?: number;
  maxAttempts?: number;
  error?: string;
  result?: unknown;
  createdAt?: string;
  updatedAt?: string;
}
