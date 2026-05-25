import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const resolvedParams = await params;
  return handleProxy(req, resolvedParams.path);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const resolvedParams = await params;
  return handleProxy(req, resolvedParams.path);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, x-user-agent, kitkey",
    },
  });
}

async function handleProxy(req: NextRequest, pathArray?: string[]) {
  const path = pathArray ? pathArray.join("/") : "";
  const searchParams = req.nextUrl.searchParams.toString();
  const url = `https://api.circle.com/${path}${searchParams ? `?${searchParams}` : ""}`;

  const headers = new Headers();
  const excludeHeaders = [
    "host",
    "connection",
    "origin",
    "referer",
    "content-length",
    "accept-encoding",
    "content-encoding",
    "transfer-encoding"
  ];
  req.headers.forEach((value, key) => {
    // Forward headers except node/client specific headers to prevent proxy mismatches
    if (!excludeHeaders.includes(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  const body = req.method === "POST" ? await req.text() : undefined;

  try {
    const res = await fetch(url, {
      method: req.method,
      headers,
      body,
    });

    const responseData = await res.text();

    const responseHeaders = new Headers();
    responseHeaders.set("Content-Type", res.headers.get("content-type") || "application/json");
    responseHeaders.set("Access-Control-Allow-Origin", "*");

    return new NextResponse(responseData, {
      status: res.status,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error("Circle API Proxy Error:", error);
    return NextResponse.json({ error: error.message || "Proxy error" }, { status: 500 });
  }
}
