"use client";

import { formatCurrency } from "@shared/lib/format";
import { useIsAdmin } from "./RoleContext";

/**
 * Money value that is masked for the admin role.
 * Owner sees the real number; admin sees a blurred placeholder so they can
 * operate the dashboard without reading studio financials.
 */
export function Money({
  amount,
  currency = "USD",
  className,
}: {
  amount: number;
  currency?: string;
  className?: string;
}) {
  const masked = useIsAdmin();
  if (masked) {
    return (
      <span
        className={className}
        title="Hidden for admin role"
        aria-label="Hidden"
      >
        ••••
      </span>
    );
  }
  return <span className={className}>{formatCurrency(amount, currency)}</span>;
}
