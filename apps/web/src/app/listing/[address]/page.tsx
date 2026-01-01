"use client";

import { useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  LinearProgress,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import LockIcon from "@mui/icons-material/Lock";
import SendIcon from "@mui/icons-material/Send";
import { Header } from "@/components";
import {
  useWallet,
  useEscrowInfo,
  useMilestones,
  useEscrowActions,
  useEscrowEvents,
  useTokenInfo,
  formatAmount,
  getUserRole,
  shortenAddress,
} from "@/lib/hooks";
import { getTxUrl, getAddressUrl, CATEGORY_LABELS, STATUS_LABELS } from "@/lib/config";
import { I18nContext, translations, type Locale, type TranslationKey } from "@/lib/i18n";
import type { Address } from "viem";

export default function ListingDetailPage() {
  const params = useParams();
  const escrowAddress = params.address as Address;

  const [locale, setLocale] = useState<Locale>("ja");

  const i18nValue = useMemo(
    () => ({
      locale,
      setLocale,
      t: (key: TranslationKey) => translations[locale][key] as string,
    }),
    [locale]
  );

  const wallet = useWallet();
  const { info, isLoading: infoLoading, error: infoError, refetch: refetchInfo } = useEscrowInfo(escrowAddress);
  const { milestones, isLoading: milestonesLoading, refetch: refetchMilestones } = useMilestones(escrowAddress);
  const { events, refetch: refetchEvents } = useEscrowEvents(escrowAddress);
  const { symbol, decimals } = useTokenInfo();

  const handleSuccess = useCallback(() => {
    refetchInfo();
    refetchMilestones();
    refetchEvents();
  }, [refetchInfo, refetchMilestones, refetchEvents]);

  const { lock, submit, isLoading: actionLoading, error: actionError, txHash } = useEscrowActions(
    escrowAddress,
    handleSuccess
  );

  const userRole = getUserRole(wallet.address, info);

  // t is available via i18nValue for future use
  void i18nValue.t;

  const isLoading = infoLoading || milestonesLoading;

  // Progress calculation
  const completedCount = milestones.filter((m) => m.completed).length;
  const totalCount = milestones.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Get next incomplete milestone for producer
  const nextMilestoneIndex = milestones.findIndex((m) => !m.completed);

  const handleLock = async () => {
    if (info) {
      await lock(info.totalAmount);
    }
  };

  const handleSubmit = async (index: number) => {
    await submit(index);
  };

  if (!escrowAddress) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error">Invalid escrow address</Alert>
      </Container>
    );
  }

  return (
    <I18nContext.Provider value={i18nValue}>
      <div className="app-shell">
        {/* Header */}
        <Header onLocaleChange={setLocale} />

        {/* Main Content */}
        <Box
          component="main"
          className="content-layer"
          sx={{
            flex: 1,
            py: { xs: 3, sm: 4 },
          }}
        >
          <Container maxWidth="lg">
            {/* Back button */}
            <Box sx={{ mb: 3 }}>
              <Link href="/" style={{ textDecoration: "none" }}>
                <Button
                  startIcon={<ArrowBackIcon />}
                  sx={{
                    color: "var(--color-text-secondary)",
                    "&:hover": {
                      color: "var(--wagyu-gold)",
                    },
                  }}
                >
                  {locale === "ja" ? "一覧に戻る" : "Back to Listings"}
                </Button>
              </Link>
            </Box>

            {/* Loading */}
            {isLoading && (
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress sx={{ color: "var(--wagyu-gold)" }} />
              </Box>
            )}

            {/* Error */}
            {infoError && (
              <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
                {infoError}
              </Alert>
            )}

            {/* Content */}
            {info && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                    gap: 4,
                  }}
                >
                  {/* Left: Info */}
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    {/* Main Card */}
                    <Card
                      sx={{
                        background: "var(--glass-bg)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid var(--glass-border)",
                        borderRadius: 3,
                      }}
                    >
                      {/* Image */}
                      {info.imageURI && (
                        <Box
                          sx={{
                            width: "100%",
                            height: 250,
                            overflow: "hidden",
                            borderRadius: "12px 12px 0 0",
                          }}
                        >
                          <Box
                            component="img"
                            src={info.imageURI}
                            alt={info.title}
                            sx={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </Box>
                      )}

                      <CardContent sx={{ p: 3 }}>
                        {/* Category & Status */}
                        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                          <Chip
                            label={CATEGORY_LABELS[info.category]?.[locale] || info.category}
                            size="small"
                            sx={{
                              background: "var(--wagyu-gold)",
                              color: "#000",
                              fontWeight: 600,
                            }}
                          />
                          <Chip
                            label={STATUS_LABELS[info.status]?.[locale] || info.status}
                            size="small"
                            color={STATUS_LABELS[info.status]?.color as "success" | "info" | "default"}
                          />
                        </Box>

                        {/* Title */}
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 700,
                            color: "var(--color-text)",
                            mb: 2,
                          }}
                        >
                          {info.title}
                        </Typography>

                        {/* Description */}
                        <Typography
                          variant="body1"
                          sx={{
                            color: "var(--color-text-secondary)",
                            mb: 3,
                            lineHeight: 1.7,
                          }}
                        >
                          {info.description}
                        </Typography>

                        <Divider sx={{ borderColor: "var(--glass-border)", mb: 3 }} />

                        {/* Price */}
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                          <Typography sx={{ color: "var(--color-text-muted)" }}>
                            {locale === "ja" ? "価格" : "Price"}
                          </Typography>
                          <Typography
                            sx={{
                              fontWeight: 700,
                              fontSize: "1.25rem",
                              color: "var(--wagyu-gold)",
                            }}
                          >
                            {formatAmount(info.totalAmount, decimals, symbol)}
                          </Typography>
                        </Box>

                        {/* Released */}
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                          <Typography sx={{ color: "var(--color-text-muted)" }}>
                            {locale === "ja" ? "支払済み" : "Released"}
                          </Typography>
                          <Typography sx={{ color: "var(--color-text-secondary)" }}>
                            {formatAmount(info.releasedAmount, decimals, symbol)}
                          </Typography>
                        </Box>

                        {/* Progress */}
                        <Box sx={{ mb: 3 }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                            <Typography sx={{ color: "var(--color-text-muted)" }}>
                              {locale === "ja" ? "進捗" : "Progress"}
                            </Typography>
                            <Typography sx={{ color: "var(--color-text-secondary)" }}>
                              {completedCount}/{totalCount}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={progressPercent}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: "rgba(255, 255, 255, 0.1)",
                              "& .MuiLinearProgress-bar": {
                                background: "linear-gradient(90deg, var(--wagyu-gold), var(--wagyu-gold-light))",
                                borderRadius: 4,
                              },
                            }}
                          />
                        </Box>

                        <Divider sx={{ borderColor: "var(--glass-border)", mb: 3 }} />

                        {/* Addresses */}
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                            <Typography variant="caption" sx={{ color: "var(--color-text-muted)" }}>
                              {locale === "ja" ? "生産者" : "Producer"}
                            </Typography>
                            <a
                              href={getAddressUrl(info.producer)}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: "var(--wagyu-gold)", fontFamily: "monospace", fontSize: "0.85rem" }}
                            >
                              {shortenAddress(info.producer)}
                            </a>
                          </Box>
                          {info.locked && (
                            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                              <Typography variant="caption" sx={{ color: "var(--color-text-muted)" }}>
                                {locale === "ja" ? "購入者" : "Buyer"}
                              </Typography>
                              <a
                                href={getAddressUrl(info.buyer)}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: "var(--wagyu-gold)", fontFamily: "monospace", fontSize: "0.85rem" }}
                              >
                                {shortenAddress(info.buyer)}
                              </a>
                            </Box>
                          )}
                          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                            <Typography variant="caption" sx={{ color: "var(--color-text-muted)" }}>
                              {locale === "ja" ? "エスクロー" : "Escrow"}
                            </Typography>
                            <a
                              href={getAddressUrl(escrowAddress)}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: "var(--wagyu-gold)", fontFamily: "monospace", fontSize: "0.85rem" }}
                            >
                              {shortenAddress(escrowAddress)}
                            </a>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>

                    {/* Action Card */}
                    {wallet.address && (
                      <Card
                        sx={{
                          background: "var(--glass-bg)",
                          backdropFilter: "blur(20px)",
                          border: "1px solid var(--glass-border)",
                          borderRadius: 3,
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 600, color: "var(--color-text)", mb: 2 }}
                          >
                            {locale === "ja" ? "アクション" : "Actions"}
                          </Typography>

                          {/* Error */}
                          {actionError && (
                            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                              {actionError}
                            </Alert>
                          )}

                          {/* Success */}
                          {txHash && (
                            <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
                              <a
                                href={getTxUrl(txHash)}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: "inherit" }}
                              >
                                {locale === "ja" ? "トランザクションを確認" : "View Transaction"}
                              </a>
                            </Alert>
                          )}

                          {/* Lock Button (for non-producer, when open) */}
                          {info.status === "open" && userRole !== "producer" && (
                            <Button
                              variant="contained"
                              fullWidth
                              startIcon={actionLoading ? <CircularProgress size={20} /> : <LockIcon />}
                              onClick={handleLock}
                              disabled={actionLoading}
                              sx={{
                                background: "linear-gradient(135deg, var(--wagyu-gold), var(--wagyu-gold-light))",
                                color: "#000",
                                fontWeight: 600,
                                py: 1.5,
                                "&:hover": {
                                  background: "linear-gradient(135deg, var(--wagyu-gold-light), var(--wagyu-gold))",
                                },
                              }}
                            >
                              {actionLoading
                                ? locale === "ja"
                                  ? "処理中..."
                                  : "Processing..."
                                : locale === "ja"
                                ? `購入する (${formatAmount(info.totalAmount, decimals, symbol)})`
                                : `Purchase (${formatAmount(info.totalAmount, decimals, symbol)})`}
                            </Button>
                          )}

                          {/* Producer's own listing message */}
                          {info.status === "open" && userRole === "producer" && (
                            <Typography sx={{ color: "var(--color-text-muted)", textAlign: "center" }}>
                              {locale === "ja" ? "購入者を待っています..." : "Waiting for buyer..."}
                            </Typography>
                          )}

                          {/* Submit Button (for producer, when active) */}
                          {info.status === "active" && userRole === "producer" && nextMilestoneIndex >= 0 && (
                            <Button
                              variant="contained"
                              fullWidth
                              startIcon={actionLoading ? <CircularProgress size={20} /> : <SendIcon />}
                              onClick={() => handleSubmit(nextMilestoneIndex)}
                              disabled={actionLoading}
                              sx={{
                                background: "linear-gradient(135deg, var(--wagyu-gold), var(--wagyu-gold-light))",
                                color: "#000",
                                fontWeight: 600,
                                py: 1.5,
                                "&:hover": {
                                  background: "linear-gradient(135deg, var(--wagyu-gold-light), var(--wagyu-gold))",
                                },
                              }}
                            >
                              {actionLoading
                                ? locale === "ja"
                                  ? "処理中..."
                                  : "Processing..."
                                : locale === "ja"
                                ? `「${milestones[nextMilestoneIndex].name}」を完了報告`
                                : `Report "${milestones[nextMilestoneIndex].name}" Complete`}
                            </Button>
                          )}

                          {/* Buyer message when active */}
                          {info.status === "active" && userRole === "buyer" && (
                            <Typography sx={{ color: "var(--color-text-muted)", textAlign: "center" }}>
                              {locale === "ja" ? "生産者の進捗を確認中..." : "Tracking producer progress..."}
                            </Typography>
                          )}

                          {/* Completed message */}
                          {info.status === "completed" && (
                            <Box sx={{ textAlign: "center", py: 2 }}>
                              <CheckCircleIcon sx={{ fontSize: 48, color: "var(--status-success)", mb: 1 }} />
                              <Typography sx={{ color: "var(--color-text)" }}>
                                {locale === "ja" ? "全工程完了" : "All milestones completed"}
                              </Typography>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Connect Wallet prompt */}
                    {!wallet.address && info.status === "open" && (
                      <Card
                        sx={{
                          background: "var(--glass-bg)",
                          backdropFilter: "blur(20px)",
                          border: "1px solid var(--glass-border)",
                          borderRadius: 3,
                        }}
                      >
                        <CardContent sx={{ p: 3, textAlign: "center" }}>
                          <Typography sx={{ color: "var(--color-text-muted)", mb: 2 }}>
                            {locale === "ja"
                              ? "購入するにはウォレットを接続してください"
                              : "Connect wallet to purchase"}
                          </Typography>
                          <Button
                            variant="contained"
                            onClick={wallet.connect}
                            disabled={wallet.isConnecting}
                            sx={{
                              background: "linear-gradient(135deg, var(--wagyu-gold), var(--wagyu-gold-light))",
                              color: "#000",
                              fontWeight: 600,
                            }}
                          >
                            {wallet.isConnecting
                              ? locale === "ja"
                                ? "接続中..."
                                : "Connecting..."
                              : locale === "ja"
                              ? "ウォレット接続"
                              : "Connect Wallet"}
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </Box>

                  {/* Right: Milestones */}
                  <Box>
                    <Card
                      sx={{
                        background: "var(--glass-bg)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid var(--glass-border)",
                        borderRadius: 3,
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 600, color: "var(--color-text)", mb: 3 }}
                        >
                          {locale === "ja" ? "マイルストーン" : "Milestones"}
                        </Typography>

                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          {milestones.map((milestone, index) => {
                            const amount = (info.totalAmount * milestone.bps) / 10000n;
                            const isNext = index === nextMilestoneIndex && info.status === "active";

                            return (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: 2,
                                    p: 2,
                                    borderRadius: 2,
                                    background: isNext
                                      ? "rgba(212, 175, 55, 0.1)"
                                      : milestone.completed
                                      ? "rgba(76, 175, 80, 0.1)"
                                      : "transparent",
                                    border: isNext ? "1px solid var(--wagyu-gold)" : "1px solid transparent",
                                  }}
                                >
                                  {/* Icon */}
                                  <Box sx={{ pt: 0.5 }}>
                                    {milestone.completed ? (
                                      <CheckCircleIcon sx={{ color: "var(--status-success)" }} />
                                    ) : (
                                      <RadioButtonUncheckedIcon
                                        sx={{ color: isNext ? "var(--wagyu-gold)" : "var(--color-text-muted)" }}
                                      />
                                    )}
                                  </Box>

                                  {/* Content */}
                                  <Box sx={{ flex: 1 }}>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                                      <Typography
                                        sx={{
                                          fontWeight: 600,
                                          color: milestone.completed
                                            ? "var(--color-text)"
                                            : isNext
                                            ? "var(--wagyu-gold)"
                                            : "var(--color-text-secondary)",
                                        }}
                                      >
                                        {milestone.name}
                                      </Typography>
                                      <Typography
                                        sx={{
                                          color: milestone.completed
                                            ? "var(--status-success)"
                                            : "var(--color-text-muted)",
                                          fontWeight: 500,
                                        }}
                                      >
                                        {formatAmount(amount, decimals, symbol)}
                                      </Typography>
                                    </Box>
                                    <Typography
                                      variant="caption"
                                      sx={{ color: "var(--color-text-muted)" }}
                                    >
                                      {Number(milestone.bps) / 100}%
                                    </Typography>
                                  </Box>
                                </Box>
                              </motion.div>
                            );
                          })}
                        </Box>
                      </CardContent>
                    </Card>

                    {/* Event Timeline */}
                    {events.length > 0 && (
                      <Card
                        sx={{
                          mt: 3,
                          background: "var(--glass-bg)",
                          backdropFilter: "blur(20px)",
                          border: "1px solid var(--glass-border)",
                          borderRadius: 3,
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 600, color: "var(--color-text)", mb: 3 }}
                          >
                            {locale === "ja" ? "イベント履歴" : "Event History"}
                          </Typography>

                          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            {events.map((event, index) => (
                              <Box
                                key={index}
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  p: 1.5,
                                  borderRadius: 1,
                                  background: "rgba(255, 255, 255, 0.02)",
                                }}
                              >
                                <Box>
                                  <Typography sx={{ color: "var(--color-text)", fontWeight: 500 }}>
                                    {event.type === "Locked"
                                      ? locale === "ja"
                                        ? "購入"
                                        : "Purchased"
                                      : event.name || `Milestone #${event.index}`}
                                  </Typography>
                                  {event.amount && (
                                    <Typography variant="caption" sx={{ color: "var(--color-text-muted)" }}>
                                      {formatAmount(event.amount, decimals, symbol)}
                                    </Typography>
                                  )}
                                </Box>
                                <a
                                  href={getTxUrl(event.txHash)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: "var(--wagyu-gold)", fontSize: "0.85rem" }}
                                >
                                  {locale === "ja" ? "TX確認" : "View TX"}
                                </a>
                              </Box>
                            ))}
                          </Box>
                        </CardContent>
                      </Card>
                    )}
                  </Box>
                </Box>
              </motion.div>
            )}
          </Container>
        </Box>
      </div>
    </I18nContext.Provider>
  );
}
