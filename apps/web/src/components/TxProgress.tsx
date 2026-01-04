"use client";

import { Box, Typography, CircularProgress, Alert, Link } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { motion, AnimatePresence } from "framer-motion";
import type { TxStep } from "@/lib/hooks";
import { getTxUrl } from "@/lib/config";
import { useI18n } from "@/lib/i18n";

interface TxProgressProps {
  step: TxStep;
  txHash?: string | null;
  error?: string | null;
  onClose?: () => void;
}

const stepMessages = {
  ja: {
    idle: "",
    checking: "残高・承認状況を確認中...",
    approving: "ウォレットで承認してください...",
    "approve-confirming": "承認トランザクション確認中...",
    signing: "ウォレットで署名してください...",
    confirming: "トランザクション確認中...",
    success: "完了しました",
    error: "エラーが発生しました",
  },
  en: {
    idle: "",
    checking: "Checking balance and allowance...",
    approving: "Please approve in your wallet...",
    "approve-confirming": "Confirming approval transaction...",
    signing: "Please sign in your wallet...",
    confirming: "Confirming transaction...",
    success: "Completed successfully",
    error: "An error occurred",
  },
};

export function TxProgress({ step, txHash, error, onClose }: TxProgressProps) {
  const { locale } = useI18n();
  const messages = stepMessages[locale];

  if (step === "idle") return null;

  const isProcessing = ["checking", "approving", "approve-confirming", "signing", "confirming"].includes(step);
  const isSuccess = step === "success";
  const isError = step === "error";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        <Alert
          severity={isSuccess ? "success" : isError ? "error" : "info"}
          icon={
            isProcessing ? (
              <CircularProgress size={20} sx={{ color: "inherit" }} />
            ) : isSuccess ? (
              <CheckCircleIcon />
            ) : isError ? (
              <ErrorIcon />
            ) : undefined
          }
          onClose={isSuccess || isError ? onClose : undefined}
          sx={{
            borderRadius: 2,
            mb: 2,
            background: isSuccess
              ? "var(--status-success-surface)"
              : isError
              ? "var(--status-error-surface)"
              : "var(--status-info-surface)",
            color: isSuccess
              ? "var(--status-success)"
              : isError
              ? "var(--status-error)"
              : "var(--status-info)",
            border: `1px solid ${
              isSuccess
                ? "rgba(110, 191, 139, 0.25)"
                : isError
                ? "rgba(214, 104, 83, 0.25)"
                : "rgba(107, 157, 196, 0.25)"
            }`,
            "& .MuiAlert-icon": {
              color: "inherit",
            },
          }}
        >
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {isError && error ? error : messages[step]}
            </Typography>
            {txHash && (
              <Link
                href={getTxUrl(txHash)}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: "inherit",
                  fontSize: "0.75rem",
                  opacity: 0.8,
                  "&:hover": { opacity: 1 },
                }}
              >
                {locale === "ja" ? "トランザクションを確認" : "View Transaction"} →
              </Link>
            )}
          </Box>
        </Alert>
      </motion.div>
    </AnimatePresence>
  );
}
