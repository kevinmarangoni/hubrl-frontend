import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { backend } from "@/lib/http";

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
  const response = await backend.patch(`hubrls/${encodeURIComponent(hubrlId)}`, session.backendAccessToken, {
    json: body,
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
