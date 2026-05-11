"use client";

import { http } from "@/lib/http";
import type { HubrlTrackedLinkProps } from "./types";

export function HubrlTrackedLink({ hubrlId, linkId, onClick, ...rest }: HubrlTrackedLinkProps) {
  return (
    <a
      {...rest}
      onClick={(e) => {
        void http
          .post(`/api/public/hubrls/${encodeURIComponent(hubrlId)}/click`, {
            json: { linkId },
            keepalive: true,
          })
          .catch(() => undefined);
        onClick?.(e);
      }}
    />
  );
}
