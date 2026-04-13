import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardRoleProvider } from "@/components/dashboard/DashboardRoleContext";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardRoleProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </DashboardRoleProvider>
  );
}
