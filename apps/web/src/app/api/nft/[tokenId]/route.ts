import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, type Address } from "viem";
import { baseSepolia } from "viem/chains";
import { ESCROW_ABI, ERC20_ABI } from "@/lib/abi";
import { SUPPORTED_CHAINS } from "@/lib/config";

// NFT Contract ABI (minimal for escrowContracts lookup)
const NFT_ABI = [
  {
    type: "function",
    name: "escrowContracts",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
] as const;

type MilestoneState = 0 | 1; // PENDING, COMPLETED

interface Milestone {
  code: string;
  bps: bigint;
  state: MilestoneState;
}

const resolveChain = () => {
  const chainId = Number(
    process.env.NEXT_PUBLIC_CHAIN_ID || process.env.CHAIN_ID || baseSepolia.id
  );
  return SUPPORTED_CHAINS[chainId] ?? baseSepolia;
};

const formatTokenAmount = (amount: bigint, decimals: number) => {
  if (decimals <= 0) return amount.toString();
  const divisor = 10n ** BigInt(decimals);
  return (amount / divisor).toString();
};

const calcProgressPercent = (released: bigint, total: bigint) =>
  total > 0n ? Number((released * 100n) / total) : 0;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  try {
    const { tokenId } = await params;
    const tokenIdNum = parseInt(tokenId);

    if (isNaN(tokenIdNum) || tokenIdNum < 1) {
      return NextResponse.json({ error: "Invalid tokenId" }, { status: 400 });
    }

    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
    const nftContractAddress = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS as Address;
    const escrowAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Address;

    if (!rpcUrl || !escrowAddress) {
      return NextResponse.json({ error: "Missing configuration" }, { status: 500 });
    }

    const client = createPublicClient({
      chain: resolveChain(),
      transport: http(rpcUrl),
    });

    // For MVP: use the escrow address directly from env
    // In production: lookup from NFT contract using tokenId
    let targetEscrow = escrowAddress;

    if (nftContractAddress) {
      try {
        const escrowFromNft = await client.readContract({
          address: nftContractAddress,
          abi: NFT_ABI,
          functionName: "escrowContracts",
          args: [BigInt(tokenIdNum)],
        });
        if (escrowFromNft !== "0x0000000000000000000000000000000000000000") {
          targetEscrow = escrowFromNft;
        }
      } catch {
        // Fall back to env contract address
      }
    }

    // Get contract summary
    const summary = await client.readContract({
      address: targetEscrow,
      abi: ESCROW_ABI,
      functionName: "getSummary",
    });

    const [
      tokenAddress,
      ,
      ,
      ,
      totalAmount,
      lockedAmount,
      releasedAmount,
      ,
      cancelled,
      milestonesCount,
    ] = summary;

    // Get token info
    const [symbol, decimals] = await Promise.all([
      client.readContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: "symbol",
      }),
      client.readContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: "decimals",
      }),
    ]);

    // Get milestones
    const milestones: Milestone[] = [];
    for (let i = 0; i < Number(milestonesCount); i++) {
      const m = await client.readContract({
        address: targetEscrow,
        abi: ESCROW_ABI,
        functionName: "milestone",
        args: [BigInt(i)],
      });
      milestones.push({
        code: m[0],
        bps: m[1],
        state: m[2] as MilestoneState,
      });
    }

    // Calculate stats
    const completedCount = milestones.filter((m) => m.state === 1).length;
    const pendingCount = milestones.filter((m) => m.state === 0).length;
    const progressPercent = calcProgressPercent(releasedAmount, totalAmount);

    // Determine status
    let status = "Not Locked";
    if (cancelled) {
      status = "Cancelled";
    } else if (lockedAmount > 0n) {
      if (completedCount === milestones.length) {
        status = "Completed";
      } else if (completedCount > 0) {
        status = "In Progress";
      } else {
        status = "Locked";
      }
    }

    // Build attributes
    const attributes = [
      { trait_type: "Status", value: status },
      { trait_type: "Progress", value: `${progressPercent}%` },
      { trait_type: "Milestones Completed", value: completedCount },
      { trait_type: "Milestones Pending", value: pendingCount },
      { trait_type: "Total Amount", value: `${formatTokenAmount(totalAmount, decimals)} ${symbol}` },
      { trait_type: "Released Amount", value: `${formatTokenAmount(releasedAmount, decimals)} ${symbol}` },
      { trait_type: "Token", value: symbol },
    ];

    // Build metadata
    const baseUrl = request.nextUrl.origin;
    const metadata = {
      name: `Wagyu Lot #${tokenId.padStart(3, "0")}`,
      description: `Milestone-based escrow for Wagyu cattle fattening with auto-payment. This NFT dynamically reflects the current state of the escrow contract. Progress: ${progressPercent}% (${completedCount}/${milestones.length} milestones completed).`,
      image: `${baseUrl}/api/nft/${tokenId}/image`,
      external_url: baseUrl,
      attributes,
    };

    return NextResponse.json(metadata, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("NFT metadata error:", error);
    return NextResponse.json(
      { error: "Failed to fetch metadata" },
      { status: 500 }
    );
  }
}
