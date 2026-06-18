import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );
}

let _serviceClient: ReturnType<typeof import("@supabase/supabase-js").createClient> | null = null;

export function createServiceSupabase() {
  if (_serviceClient) return _serviceClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    // Return a dummy client during build or when env vars not set
    const { createClient } = require("@supabase/supabase-js");
    return createClient(url ?? "https://placeholder.supabase.co", key ?? "placeholder");
  }
  const { createClient } = require("@supabase/supabase-js");
  _serviceClient = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return _serviceClient;
}
