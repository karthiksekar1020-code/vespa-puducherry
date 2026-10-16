import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/forms/auth-shell";
import { ActionForm, Field, PasswordField } from "@/components/forms/action-form";
import { Notice } from "@/components/ui/page-header";
import { registerAction } from "@/actions/auth";
import { getUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = { title: "Create account" };

export default async function RegisterPage() {
  if (await getUser()) redirect("/account");
  return (
    <AuthShell title="Create your account" subtitle="We only ask for what we need. You will receive an email to verify your address.">
      {!isSupabaseConfigured() && <div className="mb-4"><Notice tone="warn">Accounts are unavailable until the database is configured.</Notice></div>}
      <ActionForm action={registerAction} submitLabel="Create account" submitClassName="btn btn-emerald w-full">
        <Field name="full_name" label="Full name" autoComplete="name" required />
        <Field name="email" label="Email" type="email" autoComplete="email" required />
        <Field name="phone" label="Phone (optional)" type="tel" autoComplete="tel" />
        <PasswordField name="password" label="Password" autoComplete="new-password" hint="8+ characters with upper-case, lower-case and a number." />
        <PasswordField name="confirm" label="Confirm password" autoComplete="new-password" />
      </ActionForm>
      <p className="mt-8 text-sm text-grey">Already registered? <Link href="/login" className="font-semibold text-emerald-800 underline">Sign in</Link></p>
    </AuthShell>
  );
}
