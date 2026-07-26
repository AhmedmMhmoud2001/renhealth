import { NextRequest, NextResponse } from "next/server";
import {
  BACKEND_ORIGIN,
  backendFetch,
  writeBackendJar,
} from "@/lib/backend-session";

async function proxy(req: NextRequest, pathParts: string[]) {
  const path = "/" + pathParts.join("/");
  const search = req.nextUrl.search || "";
  const targetPath = `${path}${search}`;

  const headers = new Headers();
  const accept = req.headers.get("accept");
  const contentType = req.headers.get("content-type");
  if (accept) headers.set("Accept", accept);
  else headers.set("Accept", "application/json");
  // Keep original Content-Type (incl. multipart boundary) — required for FormData checkout
  if (contentType) headers.set("Content-Type", contentType);

  const method = req.method;
  let body: ArrayBuffer | undefined;
  if (method !== "GET" && method !== "HEAD") {
    body = await req.arrayBuffer();
  }

  const { res, jar } = await backendFetch(targetPath, {
    method,
    headers,
    body: body && body.byteLength ? body : undefined,
  });
  await writeBackendJar(jar);

  const outHeaders = new Headers();
  const ct = res.headers.get("Content-Type");
  if (ct) outHeaders.set("Content-Type", ct);

  return new NextResponse(await res.arrayBuffer(), {
    status: res.status,
    headers: outHeaders,
  });
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

// silence unused in some builds
void BACKEND_ORIGIN;
