"use client";

import { motion } from "framer-motion";
import { AppBar, Toolbar, Box, Typography, ToggleButtonGroup, ToggleButton, Container } from "@mui/material";
import { useI18n, type Locale } from "@/lib/i18n";

interface HeaderProps {
  onLocaleChange: (locale: Locale) => void;
}

export function Header({ onLocaleChange }: HeaderProps) {
  const { locale, t } = useI18n();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: 'rgba(13, 13, 15, 0.9)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar
          disableGutters
          sx={{
            minHeight: { xs: 64, sm: 72 },
            justifyContent: 'space-between',
          }}
        >
          {/* Logo & Title */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                component="img"
                src="/jpyc-logo.png"
                alt="JPYC logo"
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  boxShadow: 'var(--shadow-sm)',
                  border: '2px solid var(--glass-border)',
                }}
              />
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 600,
                    fontSize: { xs: '0.95rem', sm: '1.1rem' },
                    color: 'var(--color-text)',
                    letterSpacing: '0.02em',
                  }}
                >
                  {t("appTitle")}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '0.7rem',
                    color: 'var(--wagyu-gold)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    display: { xs: 'none', sm: 'block' },
                  }}
                >
                  {t("appSubtitle")}
                </Typography>
              </Box>
            </Box>
          </motion.div>

          {/* Language Switcher */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          >
            <ToggleButtonGroup
              value={locale}
              exclusive
              onChange={(_, newLocale) => newLocale && onLocaleChange(newLocale)}
              size="small"
              sx={{
                background: 'transparent',
                borderRadius: 2,
                border: 'none',
                gap: 0.5,
                '& .MuiToggleButtonGroup-grouped': {
                  margin: 0,
                  border: 'none',
                },
                '& .MuiToggleButton-root': {
                  color: 'var(--color-text)',
                  border: 'none',
                  background: 'var(--color-info)',
                  boxShadow: 'none',
                  px: 2,
                  py: 0.75,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: 'var(--color-progress-dark)',
                  },
                  '&.Mui-selected': {
                    background: 'var(--color-progress-dark)',
                    color: 'var(--color-text)',
                    boxShadow: 'none',
                    '&:hover': {
                      background: 'var(--color-progress-dark)',
                    },
                  },
                },
              }}
            >
              <ToggleButton value="ja">JP</ToggleButton>
              <ToggleButton value="en">EN</ToggleButton>
            </ToggleButtonGroup>
          </motion.div>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
