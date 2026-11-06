const PUBLIC_URL = "NEXT_PUBLIC_SUPABASE_URL";
const PUBLIC_PUBLISHABLE_KEY = "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY";
const PUBLIC_ANON_KEY = "NEXT_PUBLIC_SUPABASE_ANON_KEY";

export type SupabasePublicEnv = {
  url: string;
  publishableKey: string;
};

function readEnv(name: string): string {
  return process.env[name]?.trim() ?? "";
}

export function readSupabasePublicEnv(): SupabasePublicEnv | null {
  const url = readEnv(PUBLIC_URL);
  const publishableKey = readEnv(PUBLIC_PUBLISHABLE_KEY) || readEnv(PUBLIC_ANON_KEY);

  if (!url || !publishableKey) {
    return null;
  }

  return { url, publishableKey };
}

export function getSupabasePublicEnv(): SupabasePublicEnv {
  const env = readSupabasePublicEnv();

  if (!env) {
    throw new Error(
      "Supabase public environment is not configured. Copy .env.example to .env.local and set NEXT_PUBLIC_SUPABASE_URL plus NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY from the project Connect panel.",
    );
  }

  return env;
}
