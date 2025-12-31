"use client";

import { useState, useEffect, useCallback } from "react";
import { type Address, type Hash } from "viem";
import { createClient, createWallet, config, getChain } from "./config";
import { ESCROW_ABI, ERC20_ABI } from "./abi";
import type { ContractSummary, Milestone, MilestoneState, TimelineEvent, UserRole } from "./types";

// Wallet connection hook
export function useWallet() {
  const [address, setAddress] = useState<Address | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      setError("MetaMaskがインストールされていません");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      }) as Address[];

      if (accounts.length > 0) {
        setAddress(accounts[0]);
      }

      // Check chain
      const chainIdHex = await window.ethereum.request({
        method: "eth_chainId",
      }) as string;
      const currentChainId = parseInt(chainIdHex, 16);

      if (currentChainId !== config.chainId) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: `0x${config.chainId.toString(16)}` }],
          });
        } catch (switchError: unknown) {
          const err = switchError as { code?: number };
          if (err.code === 4902) {
            const chain = getChain();
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: `0x${config.chainId.toString(16)}`,
                  chainName: chain.name,
                  nativeCurrency: chain.nativeCurrency,
                  rpcUrls: [config.rpcUrl || chain.rpcUrls.default.http[0]],
                  blockExplorerUrls: chain.blockExplorers
                    ? [chain.blockExplorers.default.url]
                    : undefined,
                },
              ],
            });
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "接続エラー");
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (...args: unknown[]) => {
        const accounts = args[0] as Address[];
        if (accounts.length === 0) {
          setAddress(null);
        } else {
          setAddress(accounts[0]);
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum?.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, []);

  return { address, isConnecting, error, connect, disconnect };
}

// Contract data hook
export function useContractData() {
  const [summary, setSummary] = useState<ContractSummary | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [tokenSymbol, setTokenSymbol] = useState<string>("");
  const [tokenDecimals, setTokenDecimals] = useState<number>(18);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!config.contractAddress) {
      setError("コントラクトアドレスが設定されていません");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const client = createClient();

      // Get summary
      const summaryResult = await client.readContract({
        address: config.contractAddress,
        abi: ESCROW_ABI,
        functionName: "getSummary",
      });

      const [
        token,
        buyer,
        producer,
        admin,
        totalAmount,
        lockedAmount,
        releasedAmount,
        refundedAmount,
        cancelled,
        milestonesCount,
      ] = summaryResult;

      setSummary({
        token,
        buyer,
        producer,
        admin,
        totalAmount,
        lockedAmount,
        releasedAmount,
        refundedAmount,
        cancelled,
        milestonesCount,
      });

      // Get token info
      const [symbol, decimals] = await Promise.all([
        client.readContract({
          address: token,
          abi: ERC20_ABI,
          functionName: "symbol",
        }),
        client.readContract({
          address: token,
          abi: ERC20_ABI,
          functionName: "decimals",
        }),
      ]);

      setTokenSymbol(symbol);
      setTokenDecimals(decimals);

      // Get milestones
      const milestonesData: Milestone[] = [];
      for (let i = 0; i < Number(milestonesCount); i++) {
        const m = await client.readContract({
          address: config.contractAddress,
          abi: ESCROW_ABI,
          functionName: "milestone",
          args: [BigInt(i)],
        });

        milestonesData.push({
          code: m[0],
          bps: m[1],
          state: m[2] as MilestoneState,
          evidenceHash: m[3],
          evidenceText: m[4],
          submittedAt: m[5],
          approvedAt: m[6],
        });
      }

      setMilestones(milestonesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "データ取得エラー");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getUserRole = useCallback(
    (userAddress: Address | null): UserRole => {
      if (!userAddress || !summary) return "none";
      const lower = userAddress.toLowerCase();
      if (lower === summary.buyer.toLowerCase()) return "buyer";
      if (lower === summary.producer.toLowerCase()) return "producer";
      if (lower === summary.admin.toLowerCase()) return "admin";
      return "none";
    },
    [summary]
  );

  return {
    summary,
    milestones,
    tokenSymbol,
    tokenDecimals,
    isLoading,
    error,
    refetch: fetchData,
    getUserRole,
  };
}

// Timeline events hook
export function useTimeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!config.contractAddress) return;

    setIsLoading(true);
    setError(null);

    try {
      const client = createClient();

      const [lockedLogs, submittedLogs, releasedLogs, cancelledLogs] = await Promise.all([
        client.getLogs({
          address: config.contractAddress,
          event: {
            type: "event",
            name: "Locked",
            inputs: [
              { name: "amount", type: "uint256", indexed: false },
              { name: "actor", type: "address", indexed: true },
            ],
          },
          fromBlock: 0n,
          toBlock: "latest",
        }),
        client.getLogs({
          address: config.contractAddress,
          event: {
            type: "event",
            name: "Submitted",
            inputs: [
              { name: "index", type: "uint256", indexed: true },
              { name: "code", type: "string", indexed: false },
              { name: "evidenceHash", type: "bytes32", indexed: false },
              { name: "actor", type: "address", indexed: true },
            ],
          },
          fromBlock: 0n,
          toBlock: "latest",
        }),
        client.getLogs({
          address: config.contractAddress,
          event: {
            type: "event",
            name: "Released",
            inputs: [
              { name: "index", type: "uint256", indexed: true },
              { name: "code", type: "string", indexed: false },
              { name: "amount", type: "uint256", indexed: false },
              { name: "actor", type: "address", indexed: true },
            ],
          },
          fromBlock: 0n,
          toBlock: "latest",
        }),
        client.getLogs({
          address: config.contractAddress,
          event: {
            type: "event",
            name: "Cancelled",
            inputs: [
              { name: "reason", type: "string", indexed: false },
              { name: "refundAmount", type: "uint256", indexed: false },
              { name: "actor", type: "address", indexed: true },
            ],
          },
          fromBlock: 0n,
          toBlock: "latest",
        }),
      ]);

      const allEvents: TimelineEvent[] = [];

      for (const log of lockedLogs) {
        allEvents.push({
          type: "Locked",
          actor: log.args.actor!,
          txHash: log.transactionHash!,
          blockNumber: log.blockNumber!,
          amount: log.args.amount,
        });
      }

      for (const log of submittedLogs) {
        allEvents.push({
          type: "Submitted",
          actor: log.args.actor!,
          txHash: log.transactionHash!,
          blockNumber: log.blockNumber!,
          index: log.args.index,
          code: log.args.code,
          evidenceHash: log.args.evidenceHash,
        });
      }

      for (const log of releasedLogs) {
        allEvents.push({
          type: "Released",
          actor: log.args.actor!,
          txHash: log.transactionHash!,
          blockNumber: log.blockNumber!,
          index: log.args.index,
          code: log.args.code,
          amount: log.args.amount,
        });
      }

      for (const log of cancelledLogs) {
        allEvents.push({
          type: "Cancelled",
          actor: log.args.actor!,
          txHash: log.transactionHash!,
          blockNumber: log.blockNumber!,
          reason: log.args.reason,
          refundAmount: log.args.refundAmount,
        });
      }

      // Sort by block number
      allEvents.sort((a, b) => Number(a.blockNumber - b.blockNumber));

      setEvents(allEvents);
    } catch (err) {
      setError(err instanceof Error ? err.message : "イベント取得エラー");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, isLoading, error, refetch: fetchEvents };
}

// Contract actions hook
export function useContractActions(onSuccess?: () => void) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<Hash | null>(null);

  const lock = useCallback(async (totalAmount: bigint) => {
    setIsLoading(true);
    setError(null);
    setTxHash(null);

    try {
      const wallet = createWallet();
      const client = createClient();
      if (!wallet) throw new Error("Walletが接続されていません");

      const [account] = await wallet.getAddresses();

      // First approve token
      const tokenAddress = config.tokenAddress;
      const hash1 = await wallet.writeContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [config.contractAddress, totalAmount],
        account,
      });

      await client.waitForTransactionReceipt({ hash: hash1 });

      // Then lock
      const hash2 = await wallet.writeContract({
        address: config.contractAddress,
        abi: ESCROW_ABI,
        functionName: "lock",
        args: [],
        account,
      });

      await client.waitForTransactionReceipt({ hash: hash2 });
      setTxHash(hash2);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lock失敗");
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess]);

  const submit = useCallback(async (index: number, evidence: string) => {
    setIsLoading(true);
    setError(null);
    setTxHash(null);

    try {
      const wallet = createWallet();
      const client = createClient();
      if (!wallet) throw new Error("Walletが接続されていません");

      const [account] = await wallet.getAddresses();
      const hash = await wallet.writeContract({
        address: config.contractAddress,
        abi: ESCROW_ABI,
        functionName: "submit",
        args: [BigInt(index), evidence],
        account,
      });

      await client.waitForTransactionReceipt({ hash });
      setTxHash(hash);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submit失敗");
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess]);

  const approve = useCallback(async (index: number) => {
    setIsLoading(true);
    setError(null);
    setTxHash(null);

    try {
      const wallet = createWallet();
      const client = createClient();
      if (!wallet) throw new Error("Walletが接続されていません");

      const [account] = await wallet.getAddresses();

      const hash = await wallet.writeContract({
        address: config.contractAddress,
        abi: ESCROW_ABI,
        functionName: "approve",
        args: [BigInt(index)],
        account,
      });

      await client.waitForTransactionReceipt({ hash });
      setTxHash(hash);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Approve失敗");
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess]);

  const cancel = useCallback(async (reason: string) => {
    setIsLoading(true);
    setError(null);
    setTxHash(null);

    try {
      const wallet = createWallet();
      const client = createClient();
      if (!wallet) throw new Error("Walletが接続されていません");

      const [account] = await wallet.getAddresses();

      const hash = await wallet.writeContract({
        address: config.contractAddress,
        abi: ESCROW_ABI,
        functionName: "cancel",
        args: [reason],
        account,
      });

      await client.waitForTransactionReceipt({ hash });
      setTxHash(hash);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cancel失敗");
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess]);

  return { lock, submit, approve, cancel, isLoading, error, txHash };
}

// Utility function
export function formatAmount(amount: bigint, decimals: number, symbol: string): string {
  if (decimals <= 0) {
    return `${amount.toString()} ${symbol}`;
  }
  const divisor = 10n ** BigInt(decimals);
  const whole = amount / divisor;
  return `${whole.toString()} ${symbol}`;
}
