import type { PropsWithChildren } from "react";

import { DashboardShell } from "../../components/dashboard-shell";

export const dynamic = "force-dynamic";

export default function MerchantLayout({ children }: PropsWithChildren) {
  return <DashboardShell>{children}</DashboardShell>;
}
