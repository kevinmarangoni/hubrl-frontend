import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

const backendBaseUrl = process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "http://localhost:3000/v1";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ hubrlId: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.backendAccessToken) {
    return NextResponse.json({ message: "Nao autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const { hubrlId } = await params;
  const response = await fetch(`${backendBaseUrl}/hubrls/${encodeURIComponent(hubrlId)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.backendAccessToken}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
