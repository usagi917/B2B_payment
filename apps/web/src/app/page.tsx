"use client";

import { useCallback } from "react";
import {
  ConnectWallet,
  ContractSummary,
  Actions,
  MilestonesList,
  Timeline,
  Disclaimer,
} from "@/components";
import {
  useWallet,
  useContractData,
  useTimeline,
  useContractActions,
} from "@/lib/hooks";

export default function Home() {
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
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Wagyu Milestone Escrow
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            B2B Cattle Fattening Payment Infrastructure
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Disclaimer */}
        <Disclaimer />

        {/* Top Row: Wallet + Summary + Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ConnectWallet
            address={wallet.address}
            isConnecting={wallet.isConnecting}
            error={wallet.error}
            onConnect={wallet.connect}
            onDisconnect={wallet.disconnect}
          />

          <ContractSummary
            summary={contractData.summary}
            tokenSymbol={contractData.tokenSymbol}
            tokenDecimals={contractData.tokenDecimals}
            userRole={userRole}
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

        {/* Milestones List */}
        <MilestonesList milestones={contractData.milestones} />

        {/* Timeline */}
        <Timeline
          events={timeline.events}
          tokenSymbol={contractData.tokenSymbol}
          tokenDecimals={contractData.tokenDecimals}
          isLoading={timeline.isLoading}
          error={timeline.error}
        />

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
          <p>Wagyu Milestone Escrow MVP - Demo/Testnet Only</p>
          <p className="mt-1">
            This contract is <strong>not audited</strong>. Do not use with real funds.
          </p>
        </footer>
      </div>
    </main>
  );
}
