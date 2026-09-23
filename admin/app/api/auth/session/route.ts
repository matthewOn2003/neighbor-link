import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const backendUrl = process.env.BACKEND_API_URL;
  if (!backendUrl) {
    return NextResponse.json({ error: "BACKEND_API_URL is not configured" }, { status: 500 });
  }
  const backendResponse = await fetch(`${backendUrl}/api/v1/auth/session`, {
    headers: { cookie: request.headers.get("cookie") ?? "" },
    cache: "no-store",
  });

  return new NextResponse(await backendResponse.text(), {
    status: backendResponse.status,
    headers: { "Content-Type": backendResponse.headers.get("Content-Type") ?? "application/json" },
  });
}
