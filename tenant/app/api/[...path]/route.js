import { NextResponse } from "next/server";

/**
 * Success response contract:
 * { "status": "success", "data": <any>, "error": null }
 * Error response contract:
 * { "status": "error", "data": null, "error": { "code": string, "message": string } }
 */

const BODY_METHODS = new Set(["POST", "PUT", "PATCH"]);

async function proxyRequest(request, method, path) {
  const backendUrl = process.env.BACKEND_API_URL;
  if (!backendUrl) {
    return NextResponse.json(
      { status: "error", data: null, error: { code: "BACKEND_API_URL_NOT_CONFIGURED", message: "BACKEND_API_URL is not configured" } },
      { status: 500 },
    );
  }

  const headers = { cookie: request.headers.get("cookie") ?? "" };
  const init = { method, headers, cache: "no-store" };

  if (BODY_METHODS.has(method)) {
    // Read raw bytes so binary uploads (multipart) are forwarded unchanged.
    init.body = await request.arrayBuffer();
    headers["Content-Type"] = request.headers.get("Content-Type") ?? "application/json";
  }

  const search = new URL(request.url).search;
  const backendResponse = await fetch(`${backendUrl}/${path.join("/")}${search}`, init);

  const response = new NextResponse(await backendResponse.text(), {
    status: backendResponse.status,
    headers: { "Content-Type": backendResponse.headers.get("Content-Type") ?? "application/json" },
  });
  const setCookie = backendResponse.headers.get("set-cookie");
  if (setCookie) response.headers.set("set-cookie", setCookie);
  return response;
}

export async function GET(request, { params }) {
  return proxyRequest(request, "GET", (await params).path);
}

export async function POST(request, { params }) {
  return proxyRequest(request, "POST", (await params).path);
}

export async function PUT(request, { params }) {
  return proxyRequest(request, "PUT", (await params).path);
}

export async function PATCH(request, { params }) {
  return proxyRequest(request, "PATCH", (await params).path);
}

export async function DELETE(request, { params }) {
  return proxyRequest(request, "DELETE", (await params).path);
}
