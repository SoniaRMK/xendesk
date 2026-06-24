import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/permission";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  redirect(user.role === "AGENT" ? "/dashboard" : "/tickets");
}
