"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Header,
  ConnectWallet,
  ContractSummary,
  Actions,
  MilestonesList,
  Timeline,
} from "@/components";
import {
  useWallet,
  useContractData,
  useTimeline,
  useContractActions,
} from "@/lib/hooks";
import { I18nContext, translations, type Locale, type TranslationKey } from "@/lib/i18n";

export default function Home() {
  const [locale, setLocale] = useState<Locale>("ja");

  const i18nValue = useMemo(() => ({
    locale,
    setLocale,
    t: (key: TranslationKey) => translations[locale][key] as string,
    tArray: (key: "disclaimerItems") => [...translations[locale][key]] as string[],
  }), [locale]);

  const wallet = useWallet();
  const contractData = useContractData(wallet.address);
  const timeline = useTimeline();

  const handleSuccess = useCallback(() => {
    contractData.refetch();
    timeline.refetch();
  }, [contractData, timeline]);

  const actions = useContractActions(handleSuccess);
  const userRole = contractData.getUserRole(wallet.address);

  return (
    <I18nContext.Provider value={i18nValue}>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <Header onLocaleChange={setLocale} />

        {/* Main Content */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
          <div className="space-y-6">
            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Sidebar */}
              <div className="lg:col-span-4 space-y-6">
                <ConnectWallet
                  address={wallet.address}
                  isConnecting={wallet.isConnecting}
                  error={wallet.error}
                  userRole={userRole}
                  onConnect={wallet.connect}
                  onDisconnect={wallet.disconnect}
                />

                <ContractSummary
                  summary={contractData.summary}
                  tokenSymbol={contractData.tokenSymbol}
                  tokenDecimals={contractData.tokenDecimals}
                  isLoading={contractData.isLoading}
                  error={contractData.error}
                />

                <Actions
                  summary={contractData.summary}
                  milestones={contractData.milestones}
                  userRole={userRole}
                  onLock={actions.lock}
                  onSubmit={actions.submit}
                  onApprove={actions.approve}
                  onCancel={actions.cancel}
                  isLoading={actions.isLoading}
                  error={actions.error}
                  txHash={actions.txHash}
                />
              </div>

              {/* Right Content */}
              <div className="lg:col-span-8 space-y-6">
                <MilestonesList milestones={contractData.milestones} />

                <Timeline
                  events={timeline.events}
                  tokenSymbol={contractData.tokenSymbol}
                  tokenDecimals={contractData.tokenDecimals}
                  isLoading={timeline.isLoading}
                  error={timeline.error}
                />
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-[var(--color-border)] py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[var(--color-text-muted)]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-gradient-to-br from-[var(--color-accent-gold)] to-[var(--color-accent)] flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span className="font-medium">Wagyu Milestone Escrow</span>
              </div>
              <div className="text-center sm:text-right">
                <p>{locale === "ja" ? "B2B決済インフラ" : "B2B Payment Infrastructure"}</p>
                <p className="text-xs mt-1">
                  © {new Date().getFullYear()} Wagyu Milestone Escrow
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </I18nContext.Provider>
  );
}
