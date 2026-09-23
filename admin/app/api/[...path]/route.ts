import { NextRequest, NextResponse } from "next/server";

/**
 * Success response contract:
 * { "status": "success", "data": <any>, "error": null }
 * Error response contract:
 * { "status": "error", "data": null, "error": { "code": string, "message": string } }
 */

const BODY_METHODS = new Set(["POST", "PUT", "PATCH"]);

async function proxyRequest(request: NextRequest, method: string, path: string[]) {
  const backendUrl = process.env.BACKEND_API_URL;
  if (!backendUrl) {
    return NextResponse.json(
      { status: "error", data: null, error: { code: "BACKEND_API_URL_NOT_CONFIGURED", message: "BACKEND_API_URL is not configured" } },
      { status: 500 },
    );
  }

  const headers: Record<string, string> = { cookie: request.headers.get("cookie") ?? "" };
  const init: RequestInit = { method, headers, cache: "no-store" };

  if (BODY_METHODS.has(method)) {
    init.body = await request.text();
    headers["Content-Type"] = request.headers.get("Content-Type") ?? "application/json";
  }

  const backendResponse = await fetch(`${backendUrl}/api/v1/${path.join("/")}`, init);

  const response = new NextResponse(await backendResponse.text(), {
    status: backendResponse.status,
    headers: { "Content-Type": backendResponse.headers.get("Content-Type") ?? "application/json" },
  });
  const setCookie = backendResponse.headers.get("set-cookie");
  if (setCookie) response.headers.set("set-cookie", setCookie);
  return response;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, "GET", (await params).path);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, "POST", (await params).path);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, "PUT", (await params).path);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, "PATCH", (await params).path);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, "DELETE", (await params).path);
}
