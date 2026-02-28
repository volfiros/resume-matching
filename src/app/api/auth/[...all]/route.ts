import { NextRequest, NextResponse } from "next/server";

const CONVEX_SITE_URL = process.env.NEXT_PUBLIC_CONVEX_SITE_URL!;

async function proxyToConvex(req: NextRequest) {
  const url = new URL(req.url);
  const targetUrl = `${CONVEX_SITE_URL}${url.pathname}${url.search}`;

  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    if (key !== "host") headers[key] = value;
  });
  headers["accept-encoding"] = "identity";

  const body =
    req.method !== "GET" && req.method !== "HEAD"
      ? await req.text()
      : undefined;

  const upstream = await fetch(targetUrl, {
    method: req.method,
    headers,
    body,
    redirect: "manual",
  });

  const STRIP_HEADERS = new Set(["content-encoding", "content-length", "transfer-encoding"]);
  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (STRIP_HEADERS.has(key)) return;
    if (key === "set-cookie") {
      responseHeaders.append(key, value);
    } else {
      responseHeaders.set(key, value);
    }
  });

  const responseBody = await upstream.text();
  return new NextResponse(responseBody, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export {
  proxyToConvex as GET,
  proxyToConvex as POST,
  proxyToConvex as PUT,
  proxyToConvex as DELETE,
  proxyToConvex as PATCH,
};
