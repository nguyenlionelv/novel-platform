import type { Metadata } from "next";
import { isAdmin } from "@/lib/auth/session";
import { getAdminOverview } from "@/lib/db/admin";
import { AdminApp } from "@/components/admin/admin-app";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Quản trị truyện", robots: { index: false, follow: false } };

export default async function AdminPage() {
  const data = await isAdmin() ? await getAdminOverview() : null;
  return <AdminApp initialData={data} />;
}
