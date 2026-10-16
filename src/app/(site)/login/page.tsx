import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/forms/auth-shell";
import { ActionForm, Field, PasswordField } from "@/components/forms/action-form";
import { Notice } from "@/components/ui/page-header";
import { loginAction } from "@/actions/auth";
import { getUser, safeNext } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const sp = await searchParams;
  if (await getUser()) redirect(safeNext(sp.next));
  const next = safeNext(sp.next);
  return (
    <AuthShell title="Welcome back" subtitle="Sign in to view orders, saved items and your requests.">
      {!isSupabaseConfigured() && <div className="mb-4"><Notice tone="warn">Accounts are unavailable until the database is configured.</Notice></div>}
      {sp.error === "link" && <div className="mb-4"><Notice tone="error">That link is invalid or has expired. Please try again.</Notice></div>}
      <ActionForm action={loginAction} submitLabel="Sign in" submitClassName="btn btn-emerald w-full">
        <input type="hidden" name="next" value={next} />
        <Field name="email" label="Email" type="email" autoComplete="email" required />
        <PasswordField name="password" label="Password" autoComplete="current-password" />
        <div className="mt-3 text-right"><Link href="/forgot-password" className="text-xs uppercase tracking-widest text-grey hover:text-emerald-800">Forgot password?</Link></div>
      </ActionForm>
      <p className="mt-8 text-sm text-grey">New here? <Link href="/register" className="font-semibold text-emerald-800 underline">Create an account</Link></p>
    </AuthShell>
  );
}
