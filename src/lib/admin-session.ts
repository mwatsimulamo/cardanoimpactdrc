import "server-only";

import { cookies } from "next/headers";
import { connection } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_HOURS,
  parseAdminSession,
  signAdminSession,
} from "@/lib/admin-auth";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export async function readAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value ?? "";
  if (token.length === 0) {
    return false;
  }

  await connection();
  return parseAdminSession(token);
}

export async function writeAdminSession(): Promise<boolean> {
  const token = signAdminSession();
  if (token === null) {
    return false;
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    ...cookieOptions,
    maxAge: ADMIN_SESSION_HOURS * 60 * 60,
  });
  return true;
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, "", {
    ...cookieOptions,
    maxAge: 0,
  });
}
