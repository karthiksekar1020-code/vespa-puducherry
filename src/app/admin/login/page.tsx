import Link from "next/link";
import { redirect } from "next/navigation";
import { ActionForm, Field, PasswordField } from "@/components/forms/action-form";
import { Notice } from "@/components/ui/page-header";
import { adminLoginAction } from "@/actions/auth";
import { getProfile } from "@/lib/auth";
import { isServiceRoleConfigured, isSupabaseConfigured } from "@/lib/env";

export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams;
  const profile = await getProfile();
  if (profile?.role === "owner") redirect("/admin");
  return (
    <div className="flex min-h-screen items-center justify-center bg-emerald-950 px-5">
      <div className="w-full max-w-md bg-ivory p-10">
        <p className="eyebrow">Owner access</p>
        <h1 className="mt-2 text-4xl">Administration</h1>
        <div className="mt-6 space-y-4">
          {!isSupabaseConfigured() && (
            <Notice tone="warn">
              The database is not configured. Add the Supabase variables to <code>.env.local</code>, run the migration, then provision the owner with <code>npm run create-owner</code>. See docs/SETUP.md.
            </Notice>
          )}
          {isSupabaseConfigured() && !isServiceRoleConfigured() && <Notice tone="warn">SUPABASE_SERVICE_ROLE_KEY is missing; public forms and orders will not work.</Notice>}
          {sp.error === "forbidden" && <Notice tone="error">That account is signed in but is not an owner.</Notice>}
        </div>
        <ActionForm action={adminLoginAction} submitLabel="Sign in" submitClassName="btn btn-emerald w-full">
          <Field name="email" label="Email" type="email" autoComplete="username" required />
          <PasswordField name="password" label="Password" autoComplete="current-password" />
        </ActionForm>
        <p className="mt-6 text-xs text-grey">Owner accounts are created only by the server-side setup script. <Link href="/" className="underline">Back to website</Link></p>
      </div>
    </div>
  );
}
