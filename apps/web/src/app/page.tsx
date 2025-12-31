"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Header,
  ConnectWallet,
  ContractSummary,
  Actions,
  MilestonesList,
  Timeline,
  NFTCard,
} from "@/components";
import {
  useWallet,
  useContractData,
  useContractActions,
  useTimeline,
  formatAmount,
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
  }, [contractData]);

  const actions = useContractActions(handleSuccess);
  const userRole = contractData.getUserRole(wallet.address);

  const { t, tArray } = i18nValue;
  const summary = contractData.summary;
  const heroProgress = summary && summary.totalAmount > 0n
    ? Number((summary.releasedAmount * 100n) / summary.totalAmount)
    : null;
  const heroProgressLabel = heroProgress === null ? "--" : `${heroProgress.toFixed(0)}%`;
  const milestoneCountLabel = contractData.isLoading ? "..." : `${contractData.milestones.length}`;
  const totalAmountLabel = summary && contractData.tokenSymbol
    ? formatAmount(summary.totalAmount, contractData.tokenDecimals, contractData.tokenSymbol)
    : "--";

  return (
    <I18nContext.Provider value={i18nValue}>
      <div className="app-shell">
        {/* Header */}
        <Header onLocaleChange={setLocale} />

        {/* Main Content */}
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6">
          {/* Hero */}
          <section className="hero">
            <div className="hero-copy">
              <p className="eyebrow">{t("heroEyebrow")}</p>
              <h2 className="hero-title">{t("heroTitle")}</h2>
              <p className="hero-subtitle">{t("heroSubtitle")}</p>
              <div className="flex flex-wrap gap-2">
                <span className="pill">{t("heroPillTrust")}</span>
                <span className="pill">{t("heroPillEvidence")}</span>
                <span className="pill">{t("heroPillRelease")}</span>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-orb-core">
                <span className="hero-orb-label">{t("progress")}</span>
                <span className="hero-orb-value">{heroProgressLabel}</span>
              </div>
              <div className="hero-stat hero-stat-top">
                <span className="hero-stat-label">{t("milestones")}</span>
                <span className="hero-stat-value">{milestoneCountLabel}</span>
              </div>
              <div className="hero-stat hero-stat-bottom">
                <span className="hero-stat-label">{t("totalAmount")}</span>
                <span className="hero-stat-value">{totalAmountLabel}</span>
              </div>
            </div>
          </section>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Sidebar */}
            <div className="lg:col-span-5 space-y-5">
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
            <div className="lg:col-span-7 space-y-5">
              <div className="grid gap-5 xl:grid-cols-2">
                <NFTCard tokenId={1} />
                <MilestonesList milestones={contractData.milestones} />
              </div>

              <Timeline
                events={timeline.events}
                tokenSymbol={contractData.tokenSymbol}
                tokenDecimals={contractData.tokenDecimals}
                isLoading={timeline.isLoading}
                error={timeline.error}
              />
            </div>
          </div>

          {/* Bottom Section */}
          <section className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7 card p-5">
              <p className="eyebrow mb-2">{t("philosophyTitle")}</p>
              <p className="text-lg font-semibold leading-snug mb-3 text-[var(--color-text)]">
                {t("philosophyQuote")}
              </p>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {t("philosophyBody")}
              </p>
            </div>
            <div className="lg:col-span-5 card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-[var(--color-warning)] flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h3 className="section-title">{t("disclaimer")}</h3>
              </div>
              <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
                {tArray("disclaimerItems").map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-[var(--color-warning)]">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-[var(--color-divider)] py-6 mt-6">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-[var(--color-text-muted)]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
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
                <div>
                  <p className="font-medium text-[var(--color-text-secondary)]">Wagyu Milestone Escrow</p>
                  <p className="text-xs">{locale === "ja" ? "B2B決済インフラ" : "B2B Payment Infrastructure"}</p>
                </div>
              </div>
              <div className="text-left sm:text-right space-y-0.5">
                <p className="font-medium text-[var(--color-text-secondary)]">{t("footerDemo")}</p>
                <p className="text-xs">{t("footerWarning")}</p>
                <p className="text-xs">© {new Date().getFullYear()} Wagyu Milestone Escrow</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </I18nContext.Provider>
  );
}
