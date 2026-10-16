/**
 * Trusted, server-side owner provisioning. Run locally or in CI with the service-role key:
 *   OWNER_EMAIL=... OWNER_PASSWORD=... OWNER_NAME=... npm run create-owner
 * There is deliberately no web endpoint that can create or promote an owner.
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });
config();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.OWNER_EMAIL?.trim().toLowerCase();
const password = process.env.OWNER_PASSWORD;
const name = process.env.OWNER_NAME?.trim() || "Owner";

function fail(msg: string): never {
  console.error(`✖ ${msg}`);
  process.exit(1);
}

if (!url || !serviceKey) fail("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local first.");
if (!email || !/^\S+@\S+\.\S+$/.test(email)) fail("Set OWNER_EMAIL to a valid email address.");
if (!password || password.length < 12 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
  fail("OWNER_PASSWORD must be at least 12 characters with upper-case, lower-case and a digit. Choose your own; none is provided by default.");
}

const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

async function main() {
  let userId: string | undefined;
  const created = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: name } });
  if (created.error) {
    if (!/already|registered|exists/i.test(created.error.message)) fail(`Could not create user: ${created.error.message}`);
    const list = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    userId = list.data.users.find((u) => u.email?.toLowerCase() === email)?.id;
    if (!userId) fail("User exists but could not be found.");
    const upd = await admin.auth.admin.updateUserById(userId, { password });
    if (upd.error) fail(`Could not update password: ${upd.error.message}`);
    console.log("• Existing account found; password reset to the value you supplied.");
  } else {
    userId = created.data.user.id;
  }

  const { error } = await admin.from("profiles").upsert({ id: userId, full_name: name, role: "owner" });
  if (error) fail(`Could not set owner role: ${error.message}`);
  const { data: check } = await admin.from("profiles").select("role").eq("id", userId).single();
  if (check?.role !== "owner") fail("Role verification failed.");
  console.log(`✔ Owner ready: ${email}. Sign in at /admin/login`);
}

main().catch((e) => fail(e instanceof Error ? e.message : String(e)));
