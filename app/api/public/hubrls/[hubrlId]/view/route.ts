import { NextRequest, NextResponse } from "next/server";
import { backendUrl, http } from "@/lib/http";

function clientIpFromNext(request: NextRequest): string | undefined {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    return xff.split(",")[0]?.trim();
  }
  return request.headers.get("x-real-ip") ?? undefined;
}

function clientCountryFromNext(request: NextRequest): string | undefined {
  const raw =
    request.headers.get("x-vercel-ip-country") ?? request.headers.get("cf-ipcountry") ?? undefined;
  const c = raw?.trim().toUpperCase();
  if (c && /^[A-Z]{2}$/.test(c) && c !== "XX") {
    return c;
  }
  return undefined;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ hubrlId: string }> },
) {
  const { hubrlId } = await context.params;
  const ip = clientIpFromNext(request);
  const country = clientCountryFromNext(request);

  const response = await http.post(
    backendUrl(`hubrls/${encodeURIComponent(hubrlId)}/analytics/view`),
    {
      headers: {
        ...(ip ? { "x-hubrl-client-ip": ip } : {}),
        ...(country ? { "x-hubrl-client-country": country } : {}),
      },
    },
  );

  if (response.status === 204) {
    return new NextResponse(null, { status: 204 });
  }
  return new NextResponse(null, { status: response.status >= 400 ? response.status : 204 });
}
