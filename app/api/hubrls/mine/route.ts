import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { backend } from "@/lib/http";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.backendAccessToken) {
    return NextResponse.json({ message: "Nao autenticado" }, { status: 401 });
  }

  const response = await backend.get("hubrls/mine", session.backendAccessToken, { cache: "no-store" });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
