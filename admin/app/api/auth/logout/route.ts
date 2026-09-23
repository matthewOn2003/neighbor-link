import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const backendUrl = process.env.BACKEND_API_URL;
  if (!backendUrl) {
    return NextResponse.json({ error: "BACKEND_API_URL is not configured" }, { status: 500 });
  }
  const backendResponse = await fetch(`${backendUrl}/api/v1/auth/logout`, {
    method: "POST",
    headers: { cookie: request.headers.get("cookie") ?? "" },
    cache: "no-store",
  });

  const response = new NextResponse(null, { status: backendResponse.status });
  const setCookie = backendResponse.headers.get("set-cookie");
  if (setCookie) response.headers.set("set-cookie", setCookie);
  return response;
}
