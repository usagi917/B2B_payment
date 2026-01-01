"use client";

import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Box, Container, Typography, Grid, CircularProgress, Alert } from "@mui/material";
import {
  Header,
  ConnectWallet,
  ListingCard,
  CreateListingForm,
} from "@/components";
import {
  useWallet,
  useListingSummaries,
  useTokenInfo,
} from "@/lib/hooks";
import { I18nContext, translations, type Locale, type TranslationKey } from "@/lib/i18n";

export default function Home() {
  const [locale, setLocale] = useState<Locale>("ja");

  const i18nValue = useMemo(() => ({
    locale,
    setLocale,
    t: (key: TranslationKey) => translations[locale][key] as string,
  }), [locale]);

  const wallet = useWallet();
  const { summaries, isLoading, error, refetch } = useListingSummaries();
  const { symbol, decimals } = useTokenInfo();

  const handleListingCreated = useCallback(() => {
    refetch();
  }, [refetch]);

  const { t } = i18nValue;

  // Filter listings by status
  const openListings = summaries.filter((s) => s.status === "open");
  const activeListings = summaries.filter((s) => s.status === "active");
  const completedListings = summaries.filter((s) => s.status === "completed");

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
            {/* Hero */}
            <Box
              component="section"
              sx={{
                textAlign: "center",
                py: { xs: 4, md: 6 },
                mb: 4,
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <Typography
                  variant="overline"
                  sx={{
                    color: "var(--wagyu-gold)",
                    letterSpacing: "0.15em",
                    fontWeight: 600,
                    mb: 1,
                  }}
                >
                  {t("heroEyebrow")}
                </Typography>
                <Typography
                  variant="h2"
                  sx={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: { xs: "1.75rem", sm: "2.25rem", md: "2.75rem" },
                    lineHeight: 1.2,
                    color: "var(--color-text)",
                    mb: 2,
                  }}
                >
                  {t("heroTitle")}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "var(--color-text-secondary)",
                    maxWidth: 600,
                    mx: "auto",
                    lineHeight: 1.7,
                  }}
                >
                  {t("appSubtitle")}
                </Typography>
              </motion.div>
            </Box>

            {/* Wallet & Create */}
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 3, mb: 4 }}>
              <Box sx={{ flex: 1 }}>
                <ConnectWallet
                  address={wallet.address}
                  isConnecting={wallet.isConnecting}
                  error={wallet.error}
                  userRole="none"
                  onConnect={wallet.connect}
                  onDisconnect={wallet.disconnect}
                />
              </Box>
              {wallet.address && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CreateListingForm onSuccess={handleListingCreated} />
                </motion.div>
              )}
            </Box>

            {/* Loading */}
            {isLoading && (
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress sx={{ color: "var(--wagyu-gold)" }} />
              </Box>
            )}

            {/* Error */}
            {error && (
              <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {/* Open Listings */}
            {openListings.length > 0 && (
              <Box component="section" sx={{ mb: 6 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    color: "var(--color-text)",
                    mb: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: "var(--status-success)",
                    }}
                  />
                  {locale === "ja" ? "出品中" : "Open Listings"}
                  <Typography
                    component="span"
                    sx={{ color: "var(--color-text-muted)", fontWeight: 400 }}
                  >
                    ({openListings.length})
                  </Typography>
                </Typography>
                <Grid container spacing={3}>
                  {openListings.map((listing) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={listing.escrowAddress}>
                      <ListingCard
                        listing={listing}
                        tokenSymbol={symbol}
                        tokenDecimals={decimals}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Active Listings */}
            {activeListings.length > 0 && (
              <Box component="section" sx={{ mb: 6 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    color: "var(--color-text)",
                    mb: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: "var(--status-info)",
                    }}
                  />
                  {locale === "ja" ? "進行中" : "Active Listings"}
                  <Typography
                    component="span"
                    sx={{ color: "var(--color-text-muted)", fontWeight: 400 }}
                  >
                    ({activeListings.length})
                  </Typography>
                </Typography>
                <Grid container spacing={3}>
                  {activeListings.map((listing) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={listing.escrowAddress}>
                      <ListingCard
                        listing={listing}
                        tokenSymbol={symbol}
                        tokenDecimals={decimals}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Completed Listings */}
            {completedListings.length > 0 && (
              <Box component="section" sx={{ mb: 6 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    color: "var(--color-text)",
                    mb: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: "var(--color-text-muted)",
                    }}
                  />
                  {locale === "ja" ? "完了" : "Completed"}
                  <Typography
                    component="span"
                    sx={{ color: "var(--color-text-muted)", fontWeight: 400 }}
                  >
                    ({completedListings.length})
                  </Typography>
                </Typography>
                <Grid container spacing={3}>
                  {completedListings.map((listing) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={listing.escrowAddress}>
                      <ListingCard
                        listing={listing}
                        tokenSymbol={symbol}
                        tokenDecimals={decimals}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Empty State */}
            {!isLoading && summaries.length === 0 && (
              <Box
                sx={{
                  textAlign: "center",
                  py: 8,
                  color: "var(--color-text-muted)",
                }}
              >
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {locale === "ja" ? "まだ出品がありません" : "No listings yet"}
                </Typography>
                <Typography variant="body2">
                  {locale === "ja"
                    ? "ウォレットを接続して最初の出品を作成しましょう"
                    : "Connect your wallet and create the first listing"}
                </Typography>
              </Box>
            )}
          </Container>
        </Box>

        {/* Footer */}
        <Box
          component="footer"
          className="content-layer"
          sx={{
            borderTop: "1px solid var(--color-border)",
            py: 4,
            mt: 4,
          }}
        >
          <Container maxWidth="lg">
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "flex-start", sm: "center" },
                justifyContent: "space-between",
                gap: 3,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  component="img"
                  src="/jpyc-logo.png"
                  alt="JPYC logo"
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid var(--glass-border)",
                  }}
                />
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {t("appTitle")}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "var(--color-text-muted)" }}
                  >
                    {t("appSubtitle")}
                  </Typography>
                </Box>
              </Box>
              <Typography
                variant="caption"
                sx={{ color: "var(--color-text-muted)" }}
              >
                © {new Date().getFullYear()} {t("appTitle")}
              </Typography>
            </Box>
          </Container>
        </Box>
      </div>
    </I18nContext.Provider>
  );
}
