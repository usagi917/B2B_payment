"use client";

import { createContext, useContext } from "react";

export type Locale = "ja" | "en";

export const translations = {
  ja: {
    // Header
    appTitle: "Milestone Escrow",
    appSubtitle: "B2B Payment Infrastructure",

    // Hero
    heroEyebrow: "RITUAL OF TRUST",
    heroTitle: "刻む。証す。解放する。",


    // Wallet
    wallet: "ウォレット",
    connectWallet: "ウォレット接続",
    connecting: "接続中...",
    disconnect: "切断",
    noMetaMask: "MetaMaskをインストールしてください",

    // Roles
    buyer: "バイヤー",
    producer: "生産者",
    admin: "管理者",
    observer: "オブザーバー",

    // Contract Summary
    contractSummary: "コントラクト概要",
    tokenAddress: "トークン",
    buyerAddress: "バイヤー",
    producerAddress: "生産者",
    adminAddress: "管理者",
    totalAmount: "総額",
    lockedAmount: "ロック済",
    releasedAmount: "解放済",
    paidAmount: "支払い済み金額",
    refundedAmount: "返金済",
    progress: "進捗",
    cancelled: "キャンセル済",
    loading: "読み込み中...",
    noData: "データなし",

    // Actions
    actions: "アクション",
    lockFunds: "資金をロック",
    lockDescription: "総額をエスクローにロックします",
    submitMilestone: "工程を申請",
    evidencePlaceholder: "証跡（URLまたは説明）",
    submit: "申請",
    approveMilestone: "工程を承認",
    approveRelease: "承認して解放",
    cancelContract: "契約をキャンセル",
    cancelReasonPlaceholder: "キャンセル理由",
    cancelRefund: "キャンセル＆返金",
    processing: "処理中...",
    success: "成功！",
    viewTx: "TXを確認",
    contractCancelled: "契約はキャンセルされました。操作はできません。",
    noActionsAvailable: "現在利用できるアクションはありません",
    noActionsObserver: "このウォレットは契約参加者ではありません",
    connectWalletHint: "ウォレットを接続するとアクションが表示されます",

    // Milestones
    milestones: "マイルストーン",
    code: "コード",
    description: "説明",
    rate: "解放率",
    status: "状態",
    evidence: "証跡",
    evidenceHash: "証跡ハッシュ",
    submittedAt: "申請日時",
    approvedAt: "承認日時",
    pending: "未申請",
    submitted: "申請済",
    approved: "承認済",

    // Milestone Descriptions
    E1: "契約・個体登録",
    E2: "初期検疫・導入",
    E3_01: "月次肥育記録 1",
    E3_02: "月次肥育記録 2",
    E3_03: "月次肥育記録 3",
    E3_04: "月次肥育記録 4",
    E3_05: "月次肥育記録 5",
    E3_06: "月次肥育記録 6",
    E4: "出荷準備",
    E5: "出荷",
    E6: "受領・検収",

    // Timeline
    timeline: "タイムライン",
    noEvents: "イベントはまだありません",
    eventLocked: "ロック",
    eventSubmitted: "申請",
    eventReleased: "解放",
    eventCancelled: "キャンセル",
    actor: "実行者",
    amount: "金額",
    milestone: "マイルストーン",
    reason: "理由",
    refunded: "返金額",
    tx: "TX",
    block: "ブロック",

    // NFT
    refresh: "更新",
    attributes: "属性",

    // Footer
  },
  en: {
    // Header
    appTitle: "Milestone Escrow",
    appSubtitle: "B2B Payment Infrastructure",

    // Hero
    heroEyebrow: "RITUAL OF TRUST",
    heroTitle: "Record. Prove. Release.",
    heroSubtitle: "Bind time and agreement into a single ledger. Transparent evidence guides the release of value, quietly and precisely.",
    heroPillTrust: "Trust",
    heroPillEvidence: "Evidence",

    // Wallet
    wallet: "Wallet",
    connectWallet: "Connect Wallet",
    connecting: "Connecting...",
    disconnect: "Disconnect",
    noMetaMask: "Please install MetaMask",

    // Roles
    buyer: "Buyer",
    producer: "Producer",
    admin: "Admin",
    observer: "Observer",

    // Contract Summary
    contractSummary: "Contract Summary",
    tokenAddress: "Token",
    buyerAddress: "Buyer",
    producerAddress: "Producer",
    adminAddress: "Admin",
    totalAmount: "Total",
    lockedAmount: "Locked",
    releasedAmount: "Released",
    paidAmount: "Paid Amount",
    refundedAmount: "Refunded",
    progress: "Progress",
    cancelled: "Cancelled",
    loading: "Loading...",
    noData: "No data",

    // Actions
    actions: "Actions",
    lockFunds: "Lock Funds",
    lockDescription: "Lock total amount into escrow",
    submitMilestone: "Submit Milestone",
    evidencePlaceholder: "Evidence (URL or description)",
    submit: "Submit",
    approveMilestone: "Approve Milestone",
    approveRelease: "Approve & Release",
    cancelContract: "Cancel Contract",
    cancelReasonPlaceholder: "Reason for cancellation",
    cancelRefund: "Cancel & Refund",
    processing: "Processing...",
    success: "Success!",
    viewTx: "View TX",
    contractCancelled: "Contract cancelled. No actions available.",
    noActionsAvailable: "No actions available right now.",
    noActionsObserver: "This wallet is not a contract participant.",
    connectWalletHint: "Connect your wallet to see available actions.",

    // Milestones
    milestones: "Milestones",
    code: "Code",
    description: "Description",
    rate: "Release Rate",
    status: "Status",
    evidence: "Evidence",
    evidenceHash: "Evidence Hash",
    submittedAt: "Submitted At",
    approvedAt: "Approved At",
    pending: "Pending",
    submitted: "Submitted",
    approved: "Approved",

    // Milestone Descriptions
    E1: "Contract & Cattle Registration",
    E2: "Initial Quarantine & Onboarding",
    E3_01: "Monthly Fattening Log 1",
    E3_02: "Monthly Fattening Log 2",
    E3_03: "Monthly Fattening Log 3",
    E3_04: "Monthly Fattening Log 4",
    E3_05: "Monthly Fattening Log 5",
    E3_06: "Monthly Fattening Log 6",
    E4: "Pre-shipment Preparation",
    E5: "Shipment",
    E6: "Receipt & Inspection",

    // Timeline
    timeline: "Timeline",
    noEvents: "No events yet",
    eventLocked: "Locked",
    eventSubmitted: "Submitted",
    eventReleased: "Released",
    eventCancelled: "Cancelled",
    actor: "Actor",
    amount: "Amount",
    milestone: "Milestone",
    reason: "Reason",
    refunded: "Refunded",
    tx: "TX",
    block: "Block",

    // NFT
    refresh: "Refresh",
    attributes: "Attributes",

    // Footer
  },
} as const;

export type TranslationKey = keyof typeof translations.ja;

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

export const I18nContext = createContext<I18nContextType | null>(null);

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}
