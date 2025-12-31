import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, type Address } from "viem";
import { baseSepolia } from "viem/chains";
import { ESCROW_ABI, ERC20_ABI } from "@/lib/abi";
import { SUPPORTED_CHAINS } from "@/lib/config";

type MilestoneState = 0 | 1 | 2; // PENDING, SUBMITTED, APPROVED

interface Milestone {
  code: string;
  bps: bigint;
  state: MilestoneState;
}

const NFT_ABI = [
  {
    type: "function",
    name: "escrowContracts",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
] as const;

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

function generateSVG(
  tokenId: string,
  milestones: Milestone[],
  progressPercent: number,
  releasedAmount: string,
  totalAmount: string,
  symbol: string,
  status: string,
  cancelled: boolean
): string {
  // Colors
  const bgGradientStart = cancelled ? "#1a1a2e" : "#0f0f23";
  const bgGradientEnd = cancelled ? "#16213e" : "#1a1a3e";
  const accentColor = cancelled ? "#e74c3c" : "#f39c12";
  const successColor = "#27ae60";
  const warningColor = "#f39c12";
  const pendingColor = "#3498db";
  const textColor = "#ecf0f1";
  const mutedColor = "#7f8c8d";

  // Generate milestone indicators
  const milestoneIndicators = milestones
    .map((m, i) => {
      const x = 40 + (i % 6) * 55;
      const y = 280 + Math.floor(i / 6) * 70;

      let fillColor = pendingColor;
      let icon = "○";
      if (m.state === 2) {
        fillColor = successColor;
        icon = "✓";
      } else if (m.state === 1) {
        fillColor = warningColor;
        icon = "◐";
      }

      return `
        <g transform="translate(${x}, ${y})">
          <rect x="0" y="0" width="50" height="50" rx="8" fill="${fillColor}20" stroke="${fillColor}" stroke-width="2"/>
          <text x="25" y="22" font-size="14" fill="${fillColor}" text-anchor="middle" font-weight="bold">${m.code}</text>
          <text x="25" y="40" font-size="12" fill="${textColor}" text-anchor="middle">${icon}</text>
        </g>
      `;
    })
    .join("");

  // Progress bar
  const progressBarWidth = 320;
  const progressFill = (progressPercent / 100) * progressBarWidth;

  const svg = `
<svg width="400" height="500" viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${bgGradientStart}"/>
      <stop offset="100%" style="stop-color:${bgGradientEnd}"/>
    </linearGradient>
    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${successColor}"/>
      <stop offset="100%" style="stop-color:${accentColor}"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="400" height="500" fill="url(#bgGradient)"/>

  <!-- Border -->
  <rect x="10" y="10" width="380" height="480" rx="20" fill="none" stroke="${accentColor}40" stroke-width="2"/>

  <!-- Header -->
  <text x="200" y="50" font-family="Arial, sans-serif" font-size="24" fill="${textColor}" text-anchor="middle" font-weight="bold" filter="url(#glow)">
    WAGYU LOT #${tokenId.padStart(3, "0")}
  </text>

  <!-- Status Badge -->
  <rect x="100" y="65" width="200" height="28" rx="14" fill="${cancelled ? "#e74c3c" : status === "Completed" ? successColor : accentColor}30"/>
  <text x="200" y="85" font-family="Arial, sans-serif" font-size="12" fill="${cancelled ? "#e74c3c" : status === "Completed" ? successColor : accentColor}" text-anchor="middle" font-weight="bold">
    ${status.toUpperCase()}
  </text>

  <!-- Cow Icon -->
  <text x="200" y="150" font-size="60" text-anchor="middle">${cancelled ? "💀" : progressPercent >= 100 ? "🥩" : "🐂"}</text>

  <!-- Progress Section -->
  <text x="40" y="200" font-family="Arial, sans-serif" font-size="14" fill="${mutedColor}">Progress</text>
  <text x="360" y="200" font-family="Arial, sans-serif" font-size="14" fill="${textColor}" text-anchor="end" font-weight="bold">${progressPercent}%</text>

  <!-- Progress Bar Background -->
  <rect x="40" y="210" width="${progressBarWidth}" height="16" rx="8" fill="${mutedColor}30"/>

  <!-- Progress Bar Fill -->
  <rect x="40" y="210" width="${progressFill}" height="16" rx="8" fill="url(#progressGradient)">
    <animate attributeName="width" from="0" to="${progressFill}" dur="1s" fill="freeze"/>
  </rect>

  <!-- Amount Info -->
  <text x="40" y="255" font-family="Arial, sans-serif" font-size="12" fill="${mutedColor}">Released: ${releasedAmount} / ${totalAmount} ${symbol}</text>

  <!-- Milestones Grid -->
  ${milestoneIndicators}

  <!-- Legend -->
  <g transform="translate(40, 450)">
    <rect width="12" height="12" rx="2" fill="${successColor}"/>
    <text x="18" y="10" font-family="Arial, sans-serif" font-size="10" fill="${mutedColor}">Approved</text>

    <rect x="90" width="12" height="12" rx="2" fill="${warningColor}"/>
    <text x="108" y="10" font-family="Arial, sans-serif" font-size="10" fill="${mutedColor}">Submitted</text>

    <rect x="190" width="12" height="12" rx="2" fill="${pendingColor}"/>
    <text x="208" y="10" font-family="Arial, sans-serif" font-size="10" fill="${mutedColor}">Pending</text>
  </g>

  <!-- Footer -->
  <text x="200" y="485" font-family="Arial, sans-serif" font-size="8" fill="${mutedColor}40" text-anchor="middle">
    Dynamic NFT - Updates with contract state
  </text>
</svg>
  `.trim();

  return svg;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  try {
    const { tokenId } = await params;
    const tokenIdNum = parseInt(tokenId);

    if (isNaN(tokenIdNum) || tokenIdNum < 1) {
      return new NextResponse("Invalid tokenId", { status: 400 });
    }

    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
    const escrowAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Address;
    const nftContractAddress = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS as Address;

    if (!rpcUrl || !escrowAddress) {
      return new NextResponse("Missing configuration", { status: 500 });
    }

    const client = createPublicClient({
      chain: resolveChain(),
      transport: http(rpcUrl),
    });

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
    const progressPercent = calcProgressPercent(releasedAmount, totalAmount);

    // Determine status
    let status = "Not Locked";
    if (cancelled) {
      status = "Cancelled";
    } else if (lockedAmount > 0n) {
      if (approvedCount === milestones.length) {
        status = "Completed";
      } else if (submittedCount > 0) {
        status = "Pending Approval";
      } else {
        status = "In Progress";
      }
    }

    const svg = generateSVG(
      tokenId,
      milestones,
      progressPercent,
      formatTokenAmount(releasedAmount, decimals),
      formatTokenAmount(totalAmount, decimals),
      symbol,
      status,
      cancelled
    );

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("NFT image error:", error);

    // Return fallback SVG on error
    const fallbackSvg = `
<svg width="400" height="500" viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="500" fill="#1a1a2e"/>
  <text x="200" y="250" font-family="Arial" font-size="16" fill="#e74c3c" text-anchor="middle">
    Failed to load NFT data
  </text>
</svg>
    `.trim();

    return new NextResponse(fallbackSvg, {
      headers: {
        "Content-Type": "image/svg+xml",
      },
      status: 500,
    });
  }
}
