import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/forms/auth-shell";
import { ActionForm, Field } from "@/components/forms/action-form";
import { forgotAction } from "@/actions/auth";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPage() {
  return (
    <AuthShell title="Reset your password" subtitle="Enter your email and we will send you a reset link.">
      <ActionForm action={forgotAction} submitLabel="Send reset link" submitClassName="btn btn-emerald w-full">
        <Field name="email" label="Email" type="email" autoComplete="email" required />
      </ActionForm>
      <p className="mt-8 text-sm"><Link href="/login" className="font-semibold text-emerald-800 underline">Back to sign in</Link></p>
    </AuthShell>
  );
}
