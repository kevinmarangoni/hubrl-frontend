import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { backend } from "@/lib/http";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const session = await getServerSession(authOptions);

  if (!session?.backendAccessToken) {
    return NextResponse.json({ message: "Nao autenticado" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id || id !== session.user.id) {
    return NextResponse.json({ message: "Acesso negado para este usuario" }, { status: 403 });
  }

  const inputFormData = await request.formData();
  const outputFormData = new FormData();
  const name = inputFormData.get("name");
  const avatar = inputFormData.get("avatar");

  if (typeof name === "string") {
    outputFormData.append("name", name);
  }

  if (avatar instanceof File) {
    outputFormData.append("avatar", avatar);
  }

  const response = await backend.patch("users/me", session.backendAccessToken, {
    body: outputFormData,
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
