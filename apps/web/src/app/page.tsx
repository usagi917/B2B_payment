"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Header,
  ConnectWallet,
  ContractSummary,
  Actions,
  MilestonesList,
  HeroNFT,
} from "@/components";
import {
  useWallet,
  useContractData,
  useContractActions,
} from "@/lib/hooks";
import { I18nContext, translations, type Locale, type TranslationKey } from "@/lib/i18n";

export default function Home() {
  const [locale, setLocale] = useState<Locale>("ja");

  const i18nValue = useMemo(() => ({
    locale,
    setLocale,
    t: (key: TranslationKey) => translations[locale][key] as string,
  }), [locale]);

  const wallet = useWallet();
  const contractData = useContractData();

  const handleSuccess = useCallback(() => {
    contractData.refetch();
  }, [contractData]);

  const actions = useContractActions(handleSuccess);
  const userRole = contractData.getUserRole(wallet.address);

  const { t } = i18nValue;

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
            </div>
            <div className="hero-visual hero-visual-nft">
              <div className="hero-nft-shell">
                <HeroNFT tokenId={1} />
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
                address={wallet.address}
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
              <MilestonesList milestones={contractData.milestones} />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-[var(--color-divider)] py-6 mt-6">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-[var(--color-text-muted)]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
                  <img
                    src="/jpyc-logo.png"
                    alt="JPYC logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium text-[var(--color-text-secondary)]">{t("appTitle")}</p>
                  <p className="text-xs">{t("appSubtitle")}</p>
                </div>
              </div>
              <div className="text-left sm:text-right space-y-0.5">
                <p className="text-xs">© {new Date().getFullYear()} {t("appTitle")}</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </I18nContext.Provider>
  );
}
