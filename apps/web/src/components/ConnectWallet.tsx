"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  Chip,
  Alert,
  CircularProgress,
} from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import LogoutIcon from "@mui/icons-material/Logout";
import type { Address } from "viem";
import { useI18n } from "@/lib/i18n";
import type { UserRole } from "@/lib/types";

interface ConnectWalletProps {
  address: Address | null;
  isConnecting: boolean;
  error: string | null;
  userRole: UserRole;
  onConnect: () => void;
  onDisconnect: () => void;
}

const buildIdenticonCells = (address: Address) => {
  const seed = address.toLowerCase().replace(/^0x/, "");
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }

  const cells: Array<{ x: number; y: number }> = [];
  for (let y = 0; y < 5; y += 1) {
    const row: boolean[] = [];
    for (let x = 0; x < 3; x += 1) {
      hash = (hash * 1103515245 + 12345) >>> 0;
      row.push((hash & 1) === 1);
    }
    const mirrored = row.slice(0, 2).reverse();
    const full = row.concat(mirrored);
    for (let x = 0; x < 5; x += 1) {
      if (full[x]) cells.push({ x, y });
    }
  }
  return cells;
};

const roleColors: Record<UserRole, { bg: string; color: string; border: string }> = {
  buyer: {
    bg: 'var(--color-buyer-surface)',
    color: 'var(--color-buyer)',
    border: 'rgba(96, 165, 250, 0.3)',
  },
  producer: {
    bg: 'var(--color-producer-surface)',
    color: 'var(--color-producer)',
    border: 'rgba(52, 211, 153, 0.3)',
  },
  admin: {
    bg: 'var(--color-admin-surface)',
    color: 'var(--color-admin)',
    border: 'rgba(167, 139, 250, 0.3)',
  },
  none: {
    bg: 'var(--color-surface-variant)',
    color: 'var(--color-text-muted)',
    border: 'var(--color-border)',
  },
};

export function ConnectWallet({
  address,
  isConnecting,
  error,
  userRole,
  onConnect,
  onDisconnect,
}: ConnectWalletProps) {
  const { t } = useI18n();

  const identiconCells = useMemo(
    () => (address ? buildIdenticonCells(address) : []),
    [address],
  );

  const shortenAddress = (addr: Address) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const roleConfig: Record<UserRole, string> = {
    buyer: t("buyer"),
    producer: t("producer"),
    admin: t("admin"),
    none: t("observer"),
  };

  const roleLabel = roleConfig[userRole];
  const colors = roleColors[userRole];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card
        sx={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--glass-border)',
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: 'var(--color-surface-variant)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AccountBalanceWalletIcon sx={{ color: 'var(--wagyu-gold)', fontSize: 20 }} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: '1rem',
                color: 'var(--color-text)',
              }}
            >
              {t("wallet")}
            </Typography>
          </Box>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Alert
                  severity="error"
                  sx={{
                    mb: 2,
                    background: 'var(--color-error-surface)',
                    color: 'var(--color-error)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    '& .MuiAlert-icon': { color: 'var(--color-error)' },
                  }}
                >
                  {error}
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {address ? (
              <motion.div
                key="connected"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                {/* Connected Status */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    borderRadius: 2,
                    background: 'var(--color-surface-variant)',
                    border: '1px solid var(--color-border)',
                    mb: 2,
                  }}
                >
                  {/* Identicon */}
                  <Box sx={{ position: 'relative' }}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--wagyu-gold) 0%, var(--wagyu-gold-dark) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'var(--shadow-gold)',
                      }}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 5 5"
                        aria-hidden="true"
                      >
                        {identiconCells.map((cell, index) => (
                          <rect
                            key={`${cell.x}-${cell.y}-${index}`}
                            x={cell.x + 0.08}
                            y={cell.y + 0.08}
                            width={0.84}
                            height={0.84}
                            rx={0.15}
                            fill="var(--wagyu-charcoal)"
                          />
                        ))}
                      </svg>
                    </Box>
                    {/* Online indicator */}
                    <Box
                      component={motion.div}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      sx={{
                        position: 'absolute',
                        bottom: -2,
                        right: -2,
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        background: 'var(--color-success)',
                        border: '3px solid var(--color-surface)',
                        boxShadow: 'var(--glow-success)',
                      }}
                    />
                  </Box>

                  {/* Address & Role */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: 'var(--color-text)',
                        mb: 0.5,
                      }}
                    >
                      {shortenAddress(address)}
                    </Typography>
                    <Chip
                      label={roleLabel}
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: '0.625rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        background: colors.bg,
                        color: colors.color,
                        border: `1px solid ${colors.border}`,
                      }}
                    />
                  </Box>
                </Box>

                {/* Disconnect Button */}
                <Button
                  onClick={onDisconnect}
                  fullWidth
                  variant="outlined"
                  startIcon={<LogoutIcon sx={{ fontSize: 18 }} />}
                  sx={{
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-secondary)',
                    py: 1.25,
                    '&:hover': {
                      borderColor: 'var(--color-error)',
                      color: 'var(--color-error)',
                      background: 'var(--color-error-surface)',
                    },
                  }}
                >
                  {t("disconnect")}
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="disconnected"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <Button
                  onClick={onConnect}
                  disabled={isConnecting}
                  fullWidth
                  variant="contained"
                  sx={{
                    py: 1.5,
                    background: 'linear-gradient(135deg, var(--color-info) 0%, var(--color-buyer) 100%)',
                    color: 'var(--color-text)',
                    fontWeight: 600,
                    boxShadow: '0 4px 24px rgba(59, 130, 246, 0.35)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, var(--color-buyer) 0%, var(--color-info) 100%)',
                      boxShadow: '0 0 40px rgba(59, 130, 246, 0.45)',
                    },
                    '&:disabled': {
                      background: 'var(--color-surface-variant)',
                      color: 'var(--color-text-muted)',
                    },
                  }}
                  startIcon={
                    isConnecting ? (
                      <CircularProgress size={18} sx={{ color: 'inherit' }} />
                    ) : (
                      <AccountBalanceWalletIcon sx={{ fontSize: 20 }} />
                    )
                  }
                >
                  {isConnecting ? t("connecting") : t("connectWallet")}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
