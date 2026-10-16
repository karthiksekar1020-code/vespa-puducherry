import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/forms/auth-shell";
import { ActionForm, PasswordField } from "@/components/forms/action-form";
import { Notice } from "@/components/ui/page-header";
import { resetPasswordAction } from "@/actions/auth";
import { getUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Choose a new password" };

export default async function ResetPage() {
  const user = await getUser();
  return (
    <AuthShell title="Choose a new password">
      {!user ? (
        <Notice tone="error">This reset link is missing or has expired. <Link href="/forgot-password" className="underline">Request a new one</Link>.</Notice>
      ) : (
        <ActionForm action={resetPasswordAction} submitLabel="Update password" submitClassName="btn btn-emerald w-full">
          <PasswordField name="password" label="New password" autoComplete="new-password" hint="8+ characters with upper-case, lower-case and a number." />
          <PasswordField name="confirm" label="Confirm new password" autoComplete="new-password" />
        </ActionForm>
      )}
    </AuthShell>
  );
}
