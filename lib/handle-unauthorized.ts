"use client";

import { signOut } from "next-auth/react";

export async function handleUnauthorizedResponse(response: Response): Promise<boolean> {
  if (response.status !== 401) {
    return false;
  }

  await signOut({ callbackUrl: "/login" });
  return true;
}
