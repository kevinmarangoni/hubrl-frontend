import { redirect } from "next/navigation";

/** Lista de hubrls integrada no painel em `/user`; mantém URL legada. */
export default function HubrlsLegacyRedirectPage() {
  redirect("/user");
}
