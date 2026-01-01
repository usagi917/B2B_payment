"use client";

import { Box, Card, CardContent, Typography, Chip, LinearProgress } from "@mui/material";
import { motion } from "framer-motion";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { formatAmount, shortenAddress } from "@/lib/hooks";
import { CATEGORY_LABELS, STATUS_LABELS } from "@/lib/config";
import type { ListingSummary } from "@/lib/types";

interface ListingCardProps {
  listing: ListingSummary;
  tokenSymbol: string;
  tokenDecimals: number;
}

export function ListingCard({ listing, tokenSymbol, tokenDecimals }: ListingCardProps) {
  const { locale } = useI18n();

  const categoryLabel = CATEGORY_LABELS[listing.category]?.[locale] || listing.category;
  const statusConfig = STATUS_LABELS[listing.status] || STATUS_LABELS.open;
  const statusLabel = statusConfig[locale];

  const progressPercent = listing.progress.total > 0
    ? (listing.progress.completed / listing.progress.total) * 100
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/listing/${listing.escrowAddress}`} style={{ textDecoration: "none" }}>
        <Card
          sx={{
            background: "var(--glass-bg)",
            backdropFilter: "blur(20px)",
            border: "1px solid var(--glass-border)",
            borderRadius: 3,
            cursor: "pointer",
            transition: "all 0.2s ease",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
              borderColor: "var(--wagyu-gold)",
            },
          }}
        >
          {/* Image */}
          {listing.imageURI && (
            <Box
              sx={{
                width: "100%",
                height: 180,
                overflow: "hidden",
                borderRadius: "12px 12px 0 0",
              }}
            >
              <Box
                component="img"
                src={listing.imageURI}
                alt={listing.title}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </Box>
          )}

          <CardContent sx={{ p: 2.5 }}>
            {/* Category & Status */}
            <Box sx={{ display: "flex", gap: 1, mb: 1.5 }}>
              <Chip
                label={categoryLabel}
                size="small"
                sx={{
                  background: "var(--wagyu-gold)",
                  color: "#000",
                  fontWeight: 600,
                  fontSize: "0.7rem",
                }}
              />
              <Chip
                label={statusLabel}
                size="small"
                color={statusConfig.color as "success" | "info" | "default"}
                sx={{ fontSize: "0.7rem" }}
              />
            </Box>

            {/* Title */}
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: "var(--color-text)",
                mb: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {listing.title}
            </Typography>

            {/* Description */}
            <Typography
              variant="body2"
              sx={{
                color: "var(--color-text-secondary)",
                mb: 2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                lineHeight: 1.4,
                minHeight: "2.8em",
              }}
            >
              {listing.description}
            </Typography>

            {/* Price */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="caption" sx={{ color: "var(--color-text-muted)" }}>
                {locale === "ja" ? "価格" : "Price"}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 700,
                  color: "var(--wagyu-gold)",
                }}
              >
                {formatAmount(listing.totalAmount, tokenDecimals, tokenSymbol)}
              </Typography>
            </Box>

            {/* Progress */}
            <Box sx={{ mb: 1 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography variant="caption" sx={{ color: "var(--color-text-muted)" }}>
                  {locale === "ja" ? "進捗" : "Progress"}
                </Typography>
                <Typography variant="caption" sx={{ color: "var(--color-text-secondary)" }}>
                  {listing.progress.completed}/{listing.progress.total}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progressPercent}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  "& .MuiLinearProgress-bar": {
                    background: "linear-gradient(90deg, var(--wagyu-gold), var(--wagyu-gold-light))",
                    borderRadius: 3,
                  },
                }}
              />
            </Box>

            {/* Producer */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="caption" sx={{ color: "var(--color-text-muted)" }}>
                {locale === "ja" ? "生産者" : "Producer"}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontFamily: "monospace",
                  color: "var(--color-text-secondary)",
                }}
              >
                {shortenAddress(listing.producer)}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
