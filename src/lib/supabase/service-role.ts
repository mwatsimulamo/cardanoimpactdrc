import "server-only";

import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

const SERVICE_ROLE_KEY = "SUPABASE_SERVICE_ROLE_KEY";

export function getServiceRoleAuth() {
  const { url, publishableKey } = getSupabasePublicEnv();
  const serviceRoleKey = process.env[SERVICE_ROLE_KEY]?.trim() ?? "";

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not configured. Set it only in .env.local. Never prefix it with NEXT_PUBLIC_.",
    );
  }

  if (serviceRoleKey === publishableKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY must not reuse the publishable or anon key.");
  }

  return { url, serviceRoleKey };
}

export function createServiceRoleSupabaseClient() {
  const { url, serviceRoleKey } = getServiceRoleAuth();

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
