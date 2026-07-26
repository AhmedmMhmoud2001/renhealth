import { NextResponse } from "next/server";
import {
  BACKEND_ORIGIN,
  backendFetch,
  clearBackendJar,
  writeBackendJar,
} from "@/lib/backend-session";

export async function POST() {
  try {
    const { res, jar } = await backendFetch("/logout", {
      method: "POST",
      headers: { Accept: "text/html,application/json" },
    });
    await writeBackendJar(jar);
  } catch {
    /* ignore */
  }
  await clearBackendJar();
  // Also try API logout if a bearer was used historically
  try {
    await fetch(`${BACKEND_ORIGIN}/api/v1/auth/logout`, {
      method: "POST",
      headers: { Accept: "application/json" },
    });
  } catch {
    /* ignore */
  }
  return NextResponse.json({ success: true });
}
