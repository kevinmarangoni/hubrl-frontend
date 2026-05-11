import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { backend } from "@/lib/http";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.backendAccessToken) {
    return NextResponse.json({ message: "Nao autenticado" }, { status: 401 });
  }

  const incoming = await request.formData();
  const file = incoming.get("file");

  if (!(file instanceof Blob) || file.size === 0) {
    return NextResponse.json({ message: "Arquivo de imagem obrigatorio" }, { status: 400 });
  }

  const outgoing = new FormData();
  outgoing.append("file", file);

  const response = await backend.post("hubrls/upload-image", session.backendAccessToken, {
    body: outgoing,
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
