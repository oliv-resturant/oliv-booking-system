import { redirect } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The actual auth check will be done in individual admin pages
  // This layout just provides the admin structure
  return <>{children}</>;
}
