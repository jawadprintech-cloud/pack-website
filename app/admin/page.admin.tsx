import type { Metadata } from "next";
import Dashboard from "@/components/admin/Dashboard";
import "@/styles/admin.css";

export const metadata: Metadata = { title: "Dashboard | Pack Legacy", robots: { index: false, follow: false } };

export default function AdminPage() {
  return <Dashboard />;
}
