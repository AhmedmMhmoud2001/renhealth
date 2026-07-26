import { NextRequest, NextResponse } from "next/server";
import {
  clearBackendJar,
  webLogin,
  writeBackendJar,
} from "@/lib/backend-session";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { login?: string; password?: string };
    if (!body.login || !body.password) {
      return NextResponse.json(
        { message: "login and password are required" },
        { status: 422 },
      );
    }

    const result = await webLogin(body.login, body.password);
    if (!result.ok) {
      await clearBackendJar();
      return NextResponse.json({ message: result.error }, { status: 401 });
    }

    await writeBackendJar(result.jar);
    return NextResponse.json({
      success: true,
      data: {
        user: result.user,
        // Keep shape similar to API login for the frontend
        token: "session",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Login proxy failed",
      },
      { status: 500 },
    );
  }
}
