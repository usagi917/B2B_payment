"use client";

import type { Address } from "viem";
import type { ContractSummary as ContractSummaryType, UserRole } from "@/lib/types";
import { formatAmount } from "@/lib/hooks";

interface ContractSummaryProps {
  summary: ContractSummaryType | null;
  tokenSymbol: string;
  tokenDecimals: number;
  userRole: UserRole;
  isLoading: boolean;
  error: string | null;
}

export function ContractSummary({
  summary,
  tokenSymbol,
  tokenDecimals,
  userRole,
  isLoading,
  error,
}: ContractSummaryProps) {
  const shortenAddress = (addr: Address) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const roleLabels: Record<UserRole, { label: string; color: string }> = {
    buyer: { label: "Buyer", color: "bg-blue-500" },
    producer: { label: "Producer", color: "bg-green-500" },
    admin: { label: "Admin", color: "bg-purple-500" },
    none: { label: "Observer", color: "bg-gray-500" },
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
        <h2 className="text-lg font-semibold mb-3">Contract Summary</h2>
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
        <h2 className="text-lg font-semibold mb-3">Contract Summary</h2>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
        <h2 className="text-lg font-semibold mb-3">Contract Summary</h2>
        <div className="text-gray-500">No data</div>
      </div>
    );
  }

  const { label: roleLabel, color: roleColor } = roleLabels[userRole];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Contract Summary</h2>
        <span className={`px-2 py-1 text-xs text-white rounded ${roleColor}`}>
          {roleLabel}
        </span>
      </div>

      {summary.cancelled && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-3 py-2 rounded mb-3">
          CANCELLED
        </div>
      )}

      <div className="space-y-2 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="text-gray-500">Token:</div>
          <div className="font-mono">{shortenAddress(summary.token)}</div>

          <div className="text-gray-500">Buyer:</div>
          <div className="font-mono">{shortenAddress(summary.buyer)}</div>

          <div className="text-gray-500">Producer:</div>
          <div className="font-mono">{shortenAddress(summary.producer)}</div>

          <div className="text-gray-500">Admin:</div>
          <div className="font-mono">{shortenAddress(summary.admin)}</div>
        </div>

        <hr className="border-gray-200 dark:border-gray-700 my-2" />

        <div className="grid grid-cols-2 gap-2">
          <div className="text-gray-500">Total:</div>
          <div className="font-semibold">
            {formatAmount(summary.totalAmount, tokenDecimals, tokenSymbol)}
          </div>

          <div className="text-gray-500">Locked:</div>
          <div className={summary.lockedAmount > 0n ? "text-green-600" : ""}>
            {formatAmount(summary.lockedAmount, tokenDecimals, tokenSymbol)}
          </div>

          <div className="text-gray-500">Released:</div>
          <div className="text-blue-600">
            {formatAmount(summary.releasedAmount, tokenDecimals, tokenSymbol)}
          </div>

          <div className="text-gray-500">Refunded:</div>
          <div className={summary.refundedAmount > 0n ? "text-orange-600" : ""}>
            {formatAmount(summary.refundedAmount, tokenDecimals, tokenSymbol)}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>
              {summary.totalAmount > 0n
                ? `${((Number(summary.releasedAmount) / Number(summary.totalAmount)) * 100).toFixed(1)}%`
                : "0%"}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{
                width:
                  summary.totalAmount > 0n
                    ? `${(Number(summary.releasedAmount) / Number(summary.totalAmount)) * 100}%`
                    : "0%",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
