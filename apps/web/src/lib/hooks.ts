"use client";

import { useState, useEffect, useCallback } from "react";
import { type Address, type Hash } from "viem";
import { createClient, createWallet, config, getChain } from "./config";
import { FACTORY_ABI, ESCROW_ABI, ERC20_ABI } from "./abi";
import type { EscrowInfo, Milestone, ListingSummary, TimelineEvent, UserRole } from "./types";

// ============ Wallet Connection ============

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

// ============ Factory Hooks ============

export function useListings() {
  const [listings, setListings] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = useCallback(async () => {
    if (!config.factoryAddress) {
      setError("Factory address not configured");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const client = createClient();
      const result = await client.readContract({
        address: config.factoryAddress,
        abi: FACTORY_ABI,
        functionName: "getListings",
      });
      setListings(result as Address[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch listings");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return { listings, isLoading, error, refetch: fetchListings };
}

export function useListingSummaries() {
  const { listings, isLoading: listingsLoading, error: listingsError, refetch } = useListings();
  const [summaries, setSummaries] = useState<ListingSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummaries = async () => {
      if (listings.length === 0) {
        setSummaries([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const client = createClient();
        const summaryPromises = listings.map(async (escrowAddress) => {
          try {
            const [core, meta, progress] = await Promise.all([
              client.readContract({
                address: escrowAddress,
                abi: ESCROW_ABI,
                functionName: "getCore",
              }),
              client.readContract({
                address: escrowAddress,
                abi: ESCROW_ABI,
                functionName: "getMeta",
              }),
              client.readContract({
                address: escrowAddress,
                abi: ESCROW_ABI,
                functionName: "getProgress",
              }),
            ]) as [
              [Address, Address, Address, Address, bigint, bigint, bigint, boolean],
              [string, string, string, string, string],
              [bigint, bigint]
            ];

            const [, , producer, buyer, tokenId, totalAmount, releasedAmount, locked] = core;
            const [category, title, description, imageURI, status] = meta;

            return {
              escrowAddress,
              tokenId,
              producer,
              buyer,
              totalAmount,
              releasedAmount,
              locked,
              category,
              title,
              description,
              imageURI,
              status: status as "open" | "active" | "completed",
              progress: {
                completed: Number(progress[0]),
                total: Number(progress[1]),
              },
            };
          } catch {
            return null;
          }
        });

        const results = await Promise.all(summaryPromises);
        setSummaries(results.filter((s): s is ListingSummary => s !== null));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch summaries");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummaries();
  }, [listings]);

  return {
    summaries,
    isLoading: listingsLoading || isLoading,
    error: listingsError || error,
    refetch,
  };
}

// カテゴリ名からcategoryType (uint8) への変換
export function categoryToType(category: string): number {
  switch (category.toLowerCase()) {
    case "wagyu": return 0;
    case "sake": return 1;
    case "craft": return 2;
    default: return 3;
  }
}

// categoryType (uint8) からカテゴリ名への変換
export function typeToCategory(categoryType: number): string {
  switch (categoryType) {
    case 0: return "wagyu";
    case 1: return "sake";
    case 2: return "craft";
    default: return "other";
  }
}

// マイルストーン名をcode + categoryTypeから生成
const MILESTONE_NAMES: Record<number, string[]> = {
  0: ["素牛導入", "肥育開始", "肥育中1", "肥育中2", "肥育中3", "肥育中4", "肥育中5", "肥育中6", "出荷準備", "出荷", "納品完了"],
  1: ["仕込み", "発酵", "熟成", "瓶詰め", "出荷"],
  2: ["制作開始", "窯焼き", "絵付け", "仕上げ"],
  3: ["完了"],
};

export function getMilestoneName(categoryType: number, code: number): string {
  const names = MILESTONE_NAMES[categoryType] || MILESTONE_NAMES[3];
  return names[code] || `Step ${code + 1}`;
}

export function useCreateListing(onSuccess?: () => void) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<Hash | null>(null);

  const createListing = useCallback(
    async (
      categoryType: number,
      title: string,
      description: string,
      totalAmount: bigint,
      imageURI: string
    ) => {
      setIsLoading(true);
      setError(null);
      setTxHash(null);

      try {
        const wallet = createWallet();
        const client = createClient();
        if (!wallet) throw new Error("Walletが接続されていません");

        const [account] = await wallet.getAddresses();

        const hash = await wallet.writeContract({
          address: config.factoryAddress,
          abi: FACTORY_ABI,
          functionName: "createListing",
          args: [categoryType, title, description, totalAmount, imageURI],
          account,
        });

        const receipt = await client.waitForTransactionReceipt({ hash });
        setTxHash(hash);

        if (receipt.status === "reverted") {
          throw new Error("出品トランザクションが失敗しました");
        }
        onSuccess?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : "出品に失敗しました");
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess]
  );

  return { createListing, isLoading, error, txHash };
}

// ============ Escrow Hooks (per listing) ============

export function useEscrowInfo(escrowAddress: Address | null) {
  const [info, setInfo] = useState<EscrowInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInfo = useCallback(async () => {
    if (!escrowAddress) {
      setInfo(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const client = createClient();
      const [core, meta] = await Promise.all([
        client.readContract({
          address: escrowAddress,
          abi: ESCROW_ABI,
          functionName: "getCore",
        }),
        client.readContract({
          address: escrowAddress,
          abi: ESCROW_ABI,
          functionName: "getMeta",
        }),
      ]) as [
        [Address, Address, Address, Address, bigint, bigint, bigint, boolean],
        [string, string, string, string, string]
      ];

      const [
        factory,
        tokenAddress,
        producer,
        buyer,
        tokenId,
        totalAmount,
        releasedAmount,
        locked,
      ] = core;
      const [category, title, description, imageURI, status] = meta;

      setInfo({
        factory,
        tokenAddress,
        producer,
        buyer,
        tokenId,
        totalAmount,
        releasedAmount,
        locked,
        category,
        title,
        description,
        imageURI,
        status: status as "open" | "active" | "completed",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch escrow info");
    } finally {
      setIsLoading(false);
    }
  }, [escrowAddress]);

  useEffect(() => {
    fetchInfo();
  }, [fetchInfo]);

  return { info, isLoading, error, refetch: fetchInfo };
}

export function useMilestones(escrowAddress: Address | null, categoryType?: number) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMilestones = useCallback(async () => {
    if (!escrowAddress) {
      setMilestones([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const client = createClient();

      // Get categoryType if not provided
      let catType = categoryType;
      if (catType === undefined) {
        catType = await client.readContract({
          address: escrowAddress,
          abi: ESCROW_ABI,
          functionName: "categoryType",
        }) as number;
      }

      const result = await client.readContract({
        address: escrowAddress,
        abi: ESCROW_ABI,
        functionName: "getMilestones",
      });

      const milestoneData = result as Array<{ bps: bigint | number; completed: boolean }>;
      setMilestones(
        milestoneData.map((m, index) => ({
          code: index,
          bps: typeof m.bps === "bigint" ? m.bps : BigInt(m.bps),
          completed: m.completed,
          name: getMilestoneName(catType!, index),
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch milestones");
    } finally {
      setIsLoading(false);
    }
  }, [escrowAddress, categoryType]);

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  return { milestones, isLoading, error, refetch: fetchMilestones };
}

export function useEscrowActions(escrowAddress: Address | null, onSuccess?: () => void) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<Hash | null>(null);

  const lock = useCallback(
    async (totalAmount: bigint) => {
      if (!escrowAddress) return;

      setIsLoading(true);
      setError(null);
      setTxHash(null);

      try {
        const wallet = createWallet();
        const client = createClient();
        if (!wallet) throw new Error("Walletが接続されていません");

        const [account] = await wallet.getAddresses();

        // First approve token
        const hash1 = await wallet.writeContract({
          address: config.tokenAddress,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [escrowAddress, totalAmount],
          account,
        });

        await client.waitForTransactionReceipt({ hash: hash1 });

        // Then lock
        const hash2 = await wallet.writeContract({
          address: escrowAddress,
          abi: ESCROW_ABI,
          functionName: "lock",
          args: [],
          account,
        });

        await client.waitForTransactionReceipt({ hash: hash2 });
        setTxHash(hash2);
        onSuccess?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : "購入に失敗しました");
      } finally {
        setIsLoading(false);
      }
    },
    [escrowAddress, onSuccess]
  );

  const submit = useCallback(
    async (index: number) => {
      if (!escrowAddress) return;

      setIsLoading(true);
      setError(null);
      setTxHash(null);

      try {
        const wallet = createWallet();
        const client = createClient();
        if (!wallet) throw new Error("Walletが接続されていません");

        const [account] = await wallet.getAddresses();
        const hash = await wallet.writeContract({
          address: escrowAddress,
          abi: ESCROW_ABI,
          functionName: "submit",
          args: [BigInt(index)],
          account,
        });

        await client.waitForTransactionReceipt({ hash });
        setTxHash(hash);
        onSuccess?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : "完了報告に失敗しました");
      } finally {
        setIsLoading(false);
      }
    },
    [escrowAddress, onSuccess]
  );

  return { lock, submit, isLoading, error, txHash };
}

export function useEscrowEvents(escrowAddress: Address | null) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!escrowAddress) {
      setEvents([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const client = createClient();

      const [lockedLogs, completedLogs] = await Promise.all([
        client.getLogs({
          address: escrowAddress,
          event: {
            type: "event",
            name: "Locked",
            inputs: [
              { name: "buyer", type: "address", indexed: true },
              { name: "amount", type: "uint256", indexed: false },
            ],
          },
          fromBlock: 0n,
          toBlock: "latest",
        }),
        client.getLogs({
          address: escrowAddress,
          event: {
            type: "event",
            name: "Completed",
            inputs: [
              { name: "index", type: "uint256", indexed: true },
              { name: "amount", type: "uint256", indexed: false },
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
          buyer: log.args.buyer!,
          txHash: log.transactionHash!,
          blockNumber: log.blockNumber!,
          amount: log.args.amount,
        });
      }

      for (const log of completedLogs) {
        allEvents.push({
          type: "Completed",
          txHash: log.transactionHash!,
          blockNumber: log.blockNumber!,
          index: log.args.index,
          amount: log.args.amount,
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
  }, [escrowAddress]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, isLoading, error, refetch: fetchEvents };
}

// ============ Token Hooks ============

export function useTokenInfo() {
  const [symbol, setSymbol] = useState<string>("");
  const [decimals, setDecimals] = useState<number>(18);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchTokenInfo = async () => {
      if (!config.tokenAddress) return;

      setIsLoading(true);
      try {
        const client = createClient();
        const [symbolResult, decimalsResult] = await Promise.all([
          client.readContract({
            address: config.tokenAddress,
            abi: ERC20_ABI,
            functionName: "symbol",
          }),
          client.readContract({
            address: config.tokenAddress,
            abi: ERC20_ABI,
            functionName: "decimals",
          }),
        ]);
        setSymbol(symbolResult as string);
        setDecimals(decimalsResult as number);
      } catch {
        // Use defaults
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokenInfo();
  }, []);

  return { symbol, decimals, isLoading };
}

export function useTokenBalance(address: Address | null) {
  const [balance, setBalance] = useState<bigint>(0n);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!address || !config.tokenAddress) {
      setBalance(0n);
      return;
    }

    setIsLoading(true);
    try {
      const client = createClient();
      const result = await client.readContract({
        address: config.tokenAddress,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: [address],
      });
      setBalance(result as bigint);
    } catch {
      setBalance(0n);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return { balance, isLoading, refetch: fetchBalance };
}

// ============ Utility Functions ============

export function formatAmount(amount: bigint, decimals: number, symbol: string): string {
  if (decimals <= 0) {
    return `${amount.toString()} ${symbol}`;
  }
  const divisor = 10n ** BigInt(decimals);
  const whole = amount / divisor;
  const fraction = amount % divisor;
  if (fraction === 0n) {
    return `${whole.toString()} ${symbol}`;
  }
  const fractionStr = fraction.toString().padStart(decimals, "0").slice(0, 2);
  return `${whole}.${fractionStr} ${symbol}`;
}

export function getUserRole(userAddress: Address | null, info: EscrowInfo | null): UserRole {
  if (!userAddress || !info) return "none";
  const lower = userAddress.toLowerCase();
  if (lower === info.buyer.toLowerCase()) return "buyer";
  if (lower === info.producer.toLowerCase()) return "producer";
  return "none";
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
