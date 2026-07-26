import { NextResponse } from "next/server";
import { backendFetch, writeBackendJar } from "@/lib/backend-session";

export async function GET() {
  const { res, jar } = await backendFetch("/api/v1/auth/user");
  await writeBackendJar(jar);
  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("Content-Type") || "application/json" },
  });
}
