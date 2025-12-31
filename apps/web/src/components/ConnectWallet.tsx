"use client";

import type { Address } from "viem";
import { useI18n } from "@/lib/i18n";
import type { UserRole } from "@/lib/types";

interface ConnectWalletProps {
  address: Address | null;
  isConnecting: boolean;
  error: string | null;
  userRole: UserRole;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function ConnectWallet({
  address,
  isConnecting,
  error,
  userRole,
  onConnect,
  onDisconnect,
}: ConnectWalletProps) {
  const { t } = useI18n();

  const shortenAddress = (addr: Address) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const roleConfig: Record<UserRole, { label: string; badgeClass: string }> = {
    buyer: {
      label: t("buyer"),
      badgeClass: "badge-buyer",
    },
    producer: {
      label: t("producer"),
      badgeClass: "badge-producer",
    },
    admin: {
      label: t("admin"),
      badgeClass: "badge-admin",
    },
    none: {
      label: t("observer"),
      badgeClass: "badge-pending",
    },
  };

  const { label: roleLabel, badgeClass } = roleConfig[userRole];

  return (
    <div className="card p-5 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg surface flex items-center justify-center">
          <svg
            className="w-4 h-4 text-[var(--color-text-secondary)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
        </div>
        <div>
          <h2 className="section-title">{t("wallet")}</h2>
          <p className="section-subtitle">{t("connectRoleWallet")}</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-[#FFEBEE]">
          <p className="text-sm text-[var(--color-error)]">{error}</p>
        </div>
      )}

      {address ? (
        <div className="space-y-4">
          {/* Connected Status */}
          <div className="flex items-center gap-3 p-3 surface rounded-lg">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-semibold text-sm">
                {address.slice(2, 4).toUpperCase()}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[var(--color-success)] rounded-full border-2 border-[var(--color-surface)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-sm font-medium truncate text-[var(--color-text)]">
                {shortenAddress(address)}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`badge ${badgeClass}`}>
                  {roleLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Disconnect Button */}
          <button
            onClick={onDisconnect}
            className="btn btn-ghost w-full text-sm"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            {t("disconnect")}
          </button>
        </div>
      ) : (
        <button
          onClick={onConnect}
          disabled={isConnecting}
          className="btn btn-primary w-full"
        >
          {isConnecting ? (
            <>
              <svg
                className="w-4 h-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {t("connecting")}
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                viewBox="0 0 40 40"
                fill="none"
              >
                <path
                  d="M37.5 20c0 9.665-7.835 17.5-17.5 17.5S2.5 29.665 2.5 20 10.335 2.5 20 2.5 37.5 10.335 37.5 20z"
                  fill="#F6851B"
                />
                <path
                  d="M32.5 15l-10 5-2.5-7.5L32.5 15zM7.5 15l10 5 2.5-7.5L7.5 15zM27.5 27.5L20 30l-7.5-2.5 2.5-5 5 2.5 5-2.5 2.5 5z"
                  fill="white"
                />
              </svg>
              {t("connectWallet")}
            </>
          )}
        </button>
      )}
    </div>
  );
}
