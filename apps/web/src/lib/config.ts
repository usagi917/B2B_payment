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
  chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "11155111"),
  contractAddress: (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "") as Address,
  tokenAddress: (process.env.NEXT_PUBLIC_TOKEN_ADDRESS || "") as Address,
  blockExplorerTxBase: process.env.NEXT_PUBLIC_BLOCK_EXPLORER_TX_BASE || "",
};

export const getChain = (): Chain => {
  return SUPPORTED_CHAINS[config.chainId] || sepolia;
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
