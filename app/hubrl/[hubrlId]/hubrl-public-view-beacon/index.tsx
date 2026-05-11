"use client";

import { useEffect, useRef } from "react";
import { http } from "@/lib/http";
import type { HubrlPublicViewBeaconProps } from "./types";

export function HubrlPublicViewBeacon({ hubrlId }: HubrlPublicViewBeaconProps) {
  const done = useRef(false);
  useEffect(() => {
    if (done.current) {
      return;
    }
    done.current = true;
    void http.post(`/api/public/hubrls/${encodeURIComponent(hubrlId)}/view`, {}).catch(() => undefined);
  }, [hubrlId]);
  return null;
}
