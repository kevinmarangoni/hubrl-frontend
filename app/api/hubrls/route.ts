import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { backend } from "@/lib/http";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.backendAccessToken) {
    return NextResponse.json({ message: "Nao autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const response = await backend.post("hubrls", session.backendAccessToken, { json: body });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
