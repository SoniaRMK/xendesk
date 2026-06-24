import { getCurrentUser } from "@/lib/permission";
import { LogoutButton } from "@/components/LogoutButton";
import Link from "next/link";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-black/10 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href={user?.role === "AGENT" ? "/dashboard" : "/tickets"} className="font-semibold">
          XenDesk
        </Link>

        {user && (
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-600">
              {user.name} <span className="text-gray-400">({user.role})</span>
            </span>
            <LogoutButton />
          </div>
        )}
      </div>
    </header>
  );
}
