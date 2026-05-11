import type { ComponentProps } from "react";

export type HubrlTrackedLinkProps = Omit<ComponentProps<"a">, "onClick"> & {
  hubrlId: string;
  linkId: string;
  onClick?: ComponentProps<"a">["onClick"];
};
