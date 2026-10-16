import "server-only";
import { requireOwner } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/**
 * Next.js renders layouts and pages in parallel, so a layout guard alone does not stop page code
 * from running. Every admin page therefore obtains its database client through this function,
 * which verifies the owner role first (and the client is still subject to RLS).
 */
export async function getOwnerClient() {
  await requireOwner();
  return createClient();
}
