"use client";

import { useState, useCallback, useMemo, Suspense, lazy } from "react";
import { motion } from "framer-motion";
import { Box, Container, Typography, Grid } from "@mui/material";
import {
  Header,
  ConnectWallet,
  ContractSummary,
  Actions,
  MilestonesList,
  HeroNFT,
} from "@/components";
import {
  useWallet,
  useContractData,
  useContractActions,
} from "@/lib/hooks";
import { I18nContext, translations, type Locale, type TranslationKey } from "@/lib/i18n";

// Lazy load Three.js background for performance
const MarbleBackground = lazy(() =>
  import("@/components/three/MarbleBackground").then((mod) => ({
    default: mod.default,
  }))
);

export default function Home() {
  const [locale, setLocale] = useState<Locale>("ja");

  const i18nValue = useMemo(() => ({
    locale,
    setLocale,
    t: (key: TranslationKey) => translations[locale][key] as string,
  }), [locale]);

  const wallet = useWallet();
  const contractData = useContractData();

  const handleSuccess = useCallback(() => {
    contractData.refetch();
  }, [contractData]);

  const actions = useContractActions(handleSuccess);
  const userRole = contractData.getUserRole(wallet.address);

  const { t } = i18nValue;

  return (
    <I18nContext.Provider value={i18nValue}>
      <div className="app-shell">
        {/* Three.js Background */}
        <Suspense fallback={null}>
          <MarbleBackground />
        </Suspense>

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
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: { xs: 3, md: 4 },
                py: { xs: 3, md: 4 },
                mb: 4,
              }}
            >
              {/* Hero Copy */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
              >
                <Typography
                  variant="overline"
                  sx={{
                    color: 'var(--wagyu-gold)',
                    letterSpacing: '0.15em',
                    fontWeight: 600,
                    mb: 1,
                  }}
                >
                  {t("heroEyebrow")}
                </Typography>
                <Typography
                  variant="h2"
                  sx={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
                    lineHeight: 1.2,
                    color: 'var(--color-text)',
                    mb: 2,
                    '& .accent': {
                      background: 'linear-gradient(135deg, var(--wagyu-gold) 0%, var(--wagyu-gold-light) 50%, var(--wagyu-gold) 100%)',
                      backgroundSize: '200% auto',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      animation: 'shimmer 3s ease-in-out infinite',
                    },
                  }}
                >
                  {t("heroTitle")}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'var(--color-text-secondary)',
                    maxWidth: 480,
                    lineHeight: 1.7,
                  }}
                >
                  {t("appSubtitle")}
                </Typography>
              </motion.div>

              {/* Hero Visual */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    width: { xs: 280, sm: 320 },
                    aspectRatio: '4 / 5',
                  }}
                >
                  <HeroNFT tokenId={1} />
                </Box>
              </motion.div>
            </Box>

            {/* Main Grid */}
            <Grid container spacing={3}>
              {/* Left Sidebar */}
              <Grid
                size={{ xs: 12, lg: 5 }}
                sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
              >
                <ConnectWallet
                  address={wallet.address}
                  isConnecting={wallet.isConnecting}
                  error={wallet.error}
                  userRole={userRole}
                  onConnect={wallet.connect}
                  onDisconnect={wallet.disconnect}
                />

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <ContractSummary
                    summary={contractData.summary}
                    tokenSymbol={contractData.tokenSymbol}
                    tokenDecimals={contractData.tokenDecimals}
                    isLoading={contractData.isLoading}
                    error={contractData.error}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <Actions
                    address={wallet.address}
                    summary={contractData.summary}
                    milestones={contractData.milestones}
                    userRole={userRole}
                    onLock={actions.lock}
                    onSubmit={actions.submit}
                    onCancel={actions.cancel}
                    isLoading={actions.isLoading}
                    error={actions.error}
                    txHash={actions.txHash}
                  />
                </motion.div>
              </Grid>

              {/* Right Content */}
              <Grid size={{ xs: 12, lg: 7 }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <MilestonesList milestones={contractData.milestones} />
                </motion.div>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Footer */}
        <Box
          component="footer"
          className="content-layer"
          sx={{
            borderTop: '1px solid var(--color-border)',
            py: 4,
            mt: 4,
          }}
        >
          <Container maxWidth="lg">
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                justifyContent: 'space-between',
                gap: 3,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  component="img"
                  src="/jpyc-logo.png"
                  alt="JPYC logo"
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid var(--glass-border)',
                  }}
                />
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    {t("appTitle")}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: 'var(--color-text-muted)' }}
                  >
                    {t("appSubtitle")}
                  </Typography>
                </Box>
              </Box>
              <Typography
                variant="caption"
                sx={{ color: 'var(--color-text-muted)' }}
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
