import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, type Address } from "viem";
import { polygonAmoy } from "viem/chains";
import { FACTORY_ABI, ESCROW_ABI, ERC20_ABI } from "@/lib/abi";
import { SUPPORTED_CHAINS, CATEGORY_LABELS } from "@/lib/config";

interface Milestone {
  name: string;
  bps: bigint;
  completed: boolean;
}

const resolveChain = () => {
  const chainId = Number(
    process.env.NEXT_PUBLIC_CHAIN_ID || process.env.CHAIN_ID || polygonAmoy.id
  );
  return SUPPORTED_CHAINS[chainId] ?? polygonAmoy;
};

const HTTP_STATUS = {
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

const formatTokenAmount = (amount: bigint, decimals: number): string => {
  if (decimals <= 0) return amount.toString();
  const divisor = 10n ** BigInt(decimals);
  return (amount / divisor).toString();
};

function generateSVG(
  tokenId: string,
  title: string,
  category: string,
  milestones: Milestone[],
  progressPercent: number,
  releasedAmount: string,
  totalAmount: string,
  symbol: string,
  status: string
): string {
  const bgGradientStart = "#0f0f23";
  const bgGradientEnd = "#1a1a3e";
  const accentColor = "#f39c12";
  const successColor = "#27ae60";
  const pendingColor = "#3498db";
  const progressStart = "#d4af37";
  const progressEnd = "#f4d03f";
  const textColor = "#ecf0f1";
  const mutedColor = "#7f8c8d";

  const categoryLabel = CATEGORY_LABELS[category]?.en || category;
  const categoryEmoji = category === "wagyu" ? "🐂" : category === "sake" ? "🍶" : category === "craft" ? "🏺" : "📦";
  const completedEmoji = status === "completed" ? "✨" : "";

  // Generate milestone indicators
  const milestonesPerRow = 6;
  const milestoneIndicators = milestones
    .map((m, i) => {
      const x = 40 + (i % milestonesPerRow) * 55;
      const y = 320 + Math.floor(i / milestonesPerRow) * 60;

      const fillColor = m.completed ? successColor : pendingColor;
      const icon = m.completed ? "✓" : "○";

      // Truncate name if too long
      const displayName = m.name.length > 4 ? m.name.slice(0, 4) : m.name;

      return `
        <g transform="translate(${x}, ${y})">
          <rect x="0" y="0" width="50" height="45" rx="8" fill="${fillColor}20" stroke="${fillColor}" stroke-width="2"/>
          <text x="25" y="18" font-size="10" fill="${textColor}" text-anchor="middle">${displayName}</text>
          <text x="25" y="36" font-size="14" fill="${fillColor}" text-anchor="middle">${icon}</text>
        </g>
      `;
    })
    .join("");

  // Progress bar
  const progressBarWidth = 320;
  const progressFill = (progressPercent / 100) * progressBarWidth;

  // Milestone rows count
  const milestoneRows = Math.ceil(milestones.length / milestonesPerRow);
  const svgHeight = 380 + milestoneRows * 60;

  const svg = `
<svg width="400" height="${svgHeight}" viewBox="0 0 400 ${svgHeight}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${bgGradientStart}"/>
      <stop offset="100%" style="stop-color:${bgGradientEnd}"/>
    </linearGradient>
    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${progressStart}"/>
      <stop offset="100%" style="stop-color:${progressEnd}"/>
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
  <rect width="400" height="${svgHeight}" fill="url(#bgGradient)"/>

  <!-- Border -->
  <rect x="10" y="10" width="380" height="${svgHeight - 20}" rx="20" fill="none" stroke="${accentColor}40" stroke-width="2"/>

  <!-- Category Badge -->
  <rect x="140" y="25" width="120" height="24" rx="12" fill="${accentColor}30"/>
  <text x="200" y="42" font-family="Arial, sans-serif" font-size="11" fill="${accentColor}" text-anchor="middle" font-weight="bold">
    ${categoryLabel.toUpperCase()}
  </text>

  <!-- Title -->
  <text x="200" y="80" font-family="Arial, sans-serif" font-size="20" fill="${textColor}" text-anchor="middle" font-weight="bold" filter="url(#glow)">
    ${title.length > 25 ? title.slice(0, 25) + "..." : title}
  </text>

  <!-- Token ID -->
  <text x="200" y="105" font-family="Arial, sans-serif" font-size="12" fill="${mutedColor}" text-anchor="middle">
    Token #${tokenId.padStart(3, "0")}
  </text>

  <!-- Icon -->
  <text x="200" y="165" font-size="50" text-anchor="middle">${categoryEmoji}${completedEmoji}</text>

  <!-- Status Badge -->
  <rect x="120" y="185" width="160" height="28" rx="14" fill="${status === "completed" ? successColor : status === "active" ? accentColor : pendingColor}30"/>
  <text x="200" y="204" font-family="Arial, sans-serif" font-size="12" fill="${status === "completed" ? successColor : status === "active" ? accentColor : pendingColor}" text-anchor="middle" font-weight="bold">
    ${status.toUpperCase()}
  </text>

  <!-- Progress Section -->
  <text x="40" y="245" font-family="Arial, sans-serif" font-size="14" fill="${mutedColor}">Progress</text>
  <text x="360" y="245" font-family="Arial, sans-serif" font-size="14" fill="${textColor}" text-anchor="end" font-weight="bold">${progressPercent}%</text>

  <!-- Progress Bar Background -->
  <rect x="40" y="255" width="${progressBarWidth}" height="16" rx="8" fill="${mutedColor}30"/>

  <!-- Progress Bar Fill -->
  <rect x="40" y="255" width="${progressFill}" height="16" rx="8" fill="url(#progressGradient)">
    <animate attributeName="width" from="0" to="${progressFill}" dur="1s" fill="freeze"/>
  </rect>

  <!-- Amount Info -->
  <text x="40" y="295" font-family="Arial, sans-serif" font-size="12" fill="${mutedColor}">Released: ${releasedAmount} / ${totalAmount} ${symbol}</text>

  <!-- Milestones Grid -->
  ${milestoneIndicators}

  <!-- Footer -->
  <text x="200" y="${svgHeight - 15}" font-family="Arial, sans-serif" font-size="8" fill="${mutedColor}40" text-anchor="middle">
    Wagyu Milestone Escrow v2 - Dynamic NFT
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

    if (isNaN(tokenIdNum) || tokenIdNum < 0) {
      return new NextResponse("Invalid tokenId", { status: HTTP_STATUS.BAD_REQUEST });
    }

    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
    const factoryAddress = process.env.NEXT_PUBLIC_FACTORY_ADDRESS as Address;

    if (!rpcUrl || !factoryAddress) {
      return new NextResponse("Missing configuration", { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
    }

    const client = createPublicClient({
      chain: resolveChain(),
      transport: http(rpcUrl),
    });

    // Get escrow address from factory
    const escrowAddress = await client.readContract({
      address: factoryAddress,
      abi: FACTORY_ABI,
      functionName: "tokenIdToEscrow",
      args: [BigInt(tokenIdNum)],
    }) as Address;

    if (escrowAddress === "0x0000000000000000000000000000000000000000") {
      return new NextResponse("Token not found", { status: HTTP_STATUS.NOT_FOUND });
    }

    // Get escrow info (split into core and meta)
    const [core, meta, milestonesResult] = await Promise.all([
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
        functionName: "getMilestones",
      }),
    ]) as [
      [Address, Address, Address, Address, bigint, bigint, bigint, boolean],
      [string, string, string, string, string],
      Array<{ bps: bigint; completed: boolean }>
    ];

    const [, tokenAddress, , , , totalAmount, releasedAmount] = core;
    const [category, title, , , status] = meta;

    const milestones: Milestone[] = milestonesResult.map((m, index) => ({
      name: `Step ${index + 1}`,
      bps: m.bps,
      completed: m.completed,
    }));

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
    ]) as [string, number];

    // Calculate progress
    const completedCount = milestones.filter((m) => m.completed).length;
    const progressPercent = milestones.length > 0
      ? Math.round((completedCount / milestones.length) * 100)
      : 0;

    const svg = generateSVG(
      tokenId,
      title || `Listing #${tokenId}`,
      category,
      milestones,
      progressPercent,
      formatTokenAmount(releasedAmount, decimals),
      formatTokenAmount(totalAmount, decimals),
      symbol,
      status
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
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    });
  }
}
