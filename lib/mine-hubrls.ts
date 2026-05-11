import { redirect } from "next/navigation";
import { backend } from "@/lib/http";

export type MineHubrlListItem = {
  id: string;
  hubrlId?: string;
  title: string;
  handle: string | null;
  viewCount?: number;
  viewsByCountry?: Record<string, number>;
  links: Array<{
    text: string;
    url: string;
    isAdultOnly: boolean;
    linkId?: string;
    clickCount?: number;
  }>;
};

export async function fetchMineHubrls(accessToken: string): Promise<MineHubrlListItem[]> {
  const response = await backend.get("hubrls/mine", accessToken, { cache: "no-store" });

  if (response.status === 401) {
    redirect("/login");
  }

  if (!response.ok) {
    return [];
  }

  return (await response.json()) as MineHubrlListItem[];
}
