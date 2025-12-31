import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, type Address, formatUnits } from "viem";
import { baseSepolia } from "viem/chains";
import { ESCROW_ABI, ERC20_ABI } from "@/lib/abi";

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

type MilestoneState = 0 | 1 | 2; // PENDING, SUBMITTED, APPROVED

interface Milestone {
  code: string;
  bps: bigint;
  state: MilestoneState;
}

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
      chain: baseSepolia,
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
    const approvedCount = milestones.filter((m) => m.state === 2).length;
    const submittedCount = milestones.filter((m) => m.state === 1).length;
    const pendingCount = milestones.filter((m) => m.state === 0).length;
    const progressPercent = Math.round((Number(releasedAmount) / Number(totalAmount)) * 100) || 0;

    // Determine status
    let status = "Not Locked";
    if (cancelled) {
      status = "Cancelled";
    } else if (lockedAmount > 0n) {
      if (approvedCount === milestones.length) {
        status = "Completed";
      } else if (submittedCount > 0) {
        status = "In Progress (Pending Approval)";
      } else {
        status = "In Progress";
      }
    }

    // Build attributes
    const attributes = [
      { trait_type: "Status", value: status },
      { trait_type: "Progress", value: `${progressPercent}%` },
      { trait_type: "Milestones Approved", value: approvedCount },
      { trait_type: "Milestones Submitted", value: submittedCount },
      { trait_type: "Milestones Pending", value: pendingCount },
      { trait_type: "Total Amount", value: `${formatUnits(totalAmount, decimals)} ${symbol}` },
      { trait_type: "Released Amount", value: `${formatUnits(releasedAmount, decimals)} ${symbol}` },
      { trait_type: "Token", value: symbol },
    ];

    // Build metadata
    const baseUrl = request.nextUrl.origin;
    const metadata = {
      name: `Wagyu Lot #${tokenId.padStart(3, "0")}`,
      description: `Milestone-based escrow for Wagyu cattle fattening. This NFT dynamically reflects the current state of the escrow contract. Progress: ${progressPercent}% (${approvedCount}/${milestones.length} milestones approved).`,
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
