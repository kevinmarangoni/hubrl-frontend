import { redirect } from "next/navigation";

export default async function EditProfilePage() {
  redirect("/user/update");
}
