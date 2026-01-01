import { http, createPublicClient, createWalletClient, custom, type Address, type Chain } from "viem";
import { sepolia, baseSepolia, polygonAmoy, base } from "viem/chains";

// Supported chains
export const SUPPORTED_CHAINS: Record<number, Chain> = {
  [sepolia.id]: sepolia,
  [baseSepolia.id]: baseSepolia,
  [base.id]: base,
  [polygonAmoy.id]: polygonAmoy,
};

// Environment variables
export const config = {
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || "",
  chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "80002"),
  // v2: Factory address (replaces single contract address)
  factoryAddress: (process.env.NEXT_PUBLIC_FACTORY_ADDRESS || "") as Address,
  tokenAddress: (process.env.NEXT_PUBLIC_TOKEN_ADDRESS || "") as Address,
  blockExplorerTxBase: process.env.NEXT_PUBLIC_BLOCK_EXPLORER_TX_BASE || "",
  // Legacy: for backward compatibility
  contractAddress: (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "") as Address,
};

export const getChain = (): Chain => {
  return SUPPORTED_CHAINS[config.chainId] || polygonAmoy;
};

export const createClient = () => {
  const chain = getChain();
  return createPublicClient({
    chain,
    transport: http(config.rpcUrl || undefined),
  });
};

export const createWallet = () => {
  if (typeof window === "undefined" || !window.ethereum) {
    return null;
  }
  const chain = getChain();
  return createWalletClient({
    chain,
    transport: custom(window.ethereum),
  });
};

export const getTxUrl = (txHash: string): string => {
  if (config.blockExplorerTxBase) {
    return `${config.blockExplorerTxBase}${txHash}`;
  }
  const chain = getChain();
  if (chain.blockExplorers?.default) {
    return `${chain.blockExplorers.default.url}/tx/${txHash}`;
  }
  return "";
};

export const getAddressUrl = (address: string): string => {
  const chain = getChain();
  if (chain.blockExplorers?.default) {
    return `${chain.blockExplorers.default.url}/address/${address}`;
  }
  return "";
};

// Category labels
export const CATEGORY_LABELS: Record<string, { ja: string; en: string }> = {
  wagyu: { ja: "和牛", en: "Wagyu" },
  sake: { ja: "日本酒", en: "Sake" },
  craft: { ja: "工芸品", en: "Craft" },
};

// Status labels
export const STATUS_LABELS: Record<string, { ja: string; en: string; color: string }> = {
  open: { ja: "出品中", en: "Open", color: "success" },
  active: { ja: "進行中", en: "Active", color: "info" },
  completed: { ja: "完了", en: "Completed", color: "default" },
};
