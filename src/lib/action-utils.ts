import "server-only";
import { headers } from "next/headers";
import { createHash } from "node:crypto";
import type { ZodError } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { isServiceRoleConfigured } from "@/lib/env";
import type { ActionState } from "@/lib/types";

export function formToObject(fd: FormData): Record<string, string> {
  const o: Record<string, string> = {};
  fd.forEach((v, k) => {
    if (typeof v === "string") o[k] = v;
  });
  return o;
}

export function zodState(error: ZodError): ActionState {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    fieldErrors[key] ??= issue.message;
  }
  return { ok: false, message: "Please correct the highlighted fields.", fieldErrors };
}

export const NOT_CONFIGURED_STATE: ActionState = {
  ok: false,
  message: "This feature needs the database to be configured (Supabase URL, anon key and service-role key). Nothing was submitted.",
};

export function serviceReady(): boolean {
  return isServiceRoleConfigured();
}

/** Hashed client identifier for rate limiting (raw IPs are never stored). */
export async function clientKey(scope: string): Promise<string> {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "unknown";
  return `${scope}:${createHash("sha256").update(ip).digest("hex").slice(0, 24)}`;
}

/** Returns true when the caller is within the limit. Fails closed if the limiter errors. */
export async function withinRateLimit(scope: string, max: number, windowSeconds: number): Promise<boolean> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.rpc("rate_limit_hit", {
      p_key: await clientKey(scope), p_max: max, p_window_seconds: windowSeconds,
    });
    if (error) return false;
    return data === true;
  } catch {
    return false;
  }
}

export const RATE_LIMITED_STATE: ActionState = {
  ok: false,
  message: "Too many requests. Please wait a few minutes and try again.",
};
