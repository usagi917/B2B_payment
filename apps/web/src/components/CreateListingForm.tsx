"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { useCreateListing, useTokenInfo, categoryToType } from "@/lib/hooks";
import { getTxUrl } from "@/lib/config";
import type { Address } from "viem";

interface CreateListingFormProps {
  onSuccess?: (escrow: Address, tokenId: bigint) => void;
}

const CATEGORIES = [
  { value: "wagyu", labelJa: "和牛", labelEn: "Wagyu Beef" },
  { value: "sake", labelJa: "日本酒", labelEn: "Japanese Sake" },
  { value: "craft", labelJa: "工芸品", labelEn: "Traditional Craft" },
];

export function CreateListingForm({ onSuccess }: CreateListingFormProps) {
  const { locale } = useI18n();
  const { symbol, decimals } = useTokenInfo();

  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState("wagyu");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [imageURI, setImageURI] = useState("");

  const handleSuccess = (escrow: Address, tokenId: bigint) => {
    setIsOpen(false);
    setTitle("");
    setDescription("");
    setAmount("");
    setImageURI("");
    onSuccess?.(escrow, tokenId);
  };

  const { createListing, isLoading, error, txHash } = useCreateListing(handleSuccess);

  const handleSubmit = async () => {
    if (!title || !amount) return;

    const amountBigInt = BigInt(parseFloat(amount) * Math.pow(10, decimals));
    const categoryType = categoryToType(category);
    await createListing(categoryType, title, description, amountBigInt, imageURI);
  };

  const t = {
    createListing: locale === "ja" ? "新規出品" : "Create Listing",
    category: locale === "ja" ? "カテゴリ" : "Category",
    title: locale === "ja" ? "タイトル" : "Title",
    titlePlaceholder: locale === "ja" ? "商品名を入力" : "Enter product name",
    description: locale === "ja" ? "説明" : "Description",
    descriptionPlaceholder: locale === "ja" ? "商品の説明を入力" : "Enter product description",
    amount: locale === "ja" ? "価格" : "Price",
    amountPlaceholder: locale === "ja" ? "価格を入力" : "Enter price",
    imageURI: locale === "ja" ? "画像URL (任意)" : "Image URL (optional)",
    imageURIPlaceholder: locale === "ja" ? "https://example.com/image.jpg" : "https://example.com/image.jpg",
    submit: locale === "ja" ? "出品する" : "Submit Listing",
    cancel: locale === "ja" ? "キャンセル" : "Cancel",
    processing: locale === "ja" ? "処理中..." : "Processing...",
    viewTx: locale === "ja" ? "トランザクションを確認" : "View Transaction",
  };

  return (
    <Box sx={{ mb: 3 }}>
      <AnimatePresence>
        {!isOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setIsOpen(true)}
              sx={{
                background: "linear-gradient(135deg, var(--wagyu-gold), var(--wagyu-gold-light))",
                color: "#000",
                fontWeight: 600,
                px: 3,
                py: 1.5,
                borderRadius: 2,
                "&:hover": {
                  background: "linear-gradient(135deg, var(--wagyu-gold-light), var(--wagyu-gold))",
                },
              }}
            >
              {t.createListing}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
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
                  sx={{
                    fontWeight: 600,
                    color: "var(--color-text)",
                    mb: 3,
                  }}
                >
                  {t.createListing}
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                  {/* Category */}
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: "var(--color-text-secondary)" }}>
                      {t.category}
                    </InputLabel>
                    <Select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      label={t.category}
                      sx={{
                        color: "var(--color-text)",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "var(--glass-border)",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "var(--wagyu-gold)",
                        },
                      }}
                    >
                      {CATEGORIES.map((cat) => (
                        <MenuItem key={cat.value} value={cat.value}>
                          {locale === "ja" ? cat.labelJa : cat.labelEn}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Title */}
                  <TextField
                    label={t.title}
                    placeholder={t.titlePlaceholder}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        color: "var(--color-text)",
                        "& fieldset": {
                          borderColor: "var(--glass-border)",
                        },
                        "&:hover fieldset": {
                          borderColor: "var(--wagyu-gold)",
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: "var(--color-text-secondary)",
                      },
                    }}
                  />

                  {/* Description */}
                  <TextField
                    label={t.description}
                    placeholder={t.descriptionPlaceholder}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    multiline
                    rows={3}
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        color: "var(--color-text)",
                        "& fieldset": {
                          borderColor: "var(--glass-border)",
                        },
                        "&:hover fieldset": {
                          borderColor: "var(--wagyu-gold)",
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: "var(--color-text-secondary)",
                      },
                    }}
                  />

                  {/* Amount */}
                  <TextField
                    label={`${t.amount} (${symbol || "JPYC"})`}
                    placeholder={t.amountPlaceholder}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    type="number"
                    required
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        color: "var(--color-text)",
                        "& fieldset": {
                          borderColor: "var(--glass-border)",
                        },
                        "&:hover fieldset": {
                          borderColor: "var(--wagyu-gold)",
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: "var(--color-text-secondary)",
                      },
                    }}
                  />

                  {/* Image URI */}
                  <TextField
                    label={t.imageURI}
                    placeholder={t.imageURIPlaceholder}
                    value={imageURI}
                    onChange={(e) => setImageURI(e.target.value)}
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        color: "var(--color-text)",
                        "& fieldset": {
                          borderColor: "var(--glass-border)",
                        },
                        "&:hover fieldset": {
                          borderColor: "var(--wagyu-gold)",
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: "var(--color-text-secondary)",
                      },
                    }}
                  />

                  {/* Error */}
                  {error && (
                    <Alert severity="error" sx={{ borderRadius: 2 }}>
                      {error}
                    </Alert>
                  )}

                  {/* Success */}
                  {txHash && (
                    <Alert severity="success" sx={{ borderRadius: 2 }}>
                      <a
                        href={getTxUrl(txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "inherit" }}
                      >
                        {t.viewTx}
                      </a>
                    </Alert>
                  )}

                  {/* Buttons */}
                  <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                    <Button
                      variant="outlined"
                      onClick={() => setIsOpen(false)}
                      disabled={isLoading}
                      sx={{
                        flex: 1,
                        borderColor: "var(--glass-border)",
                        color: "var(--color-text-secondary)",
                        "&:hover": {
                          borderColor: "var(--color-text-secondary)",
                        },
                      }}
                    >
                      {t.cancel}
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleSubmit}
                      disabled={isLoading || !title || !amount}
                      sx={{
                        flex: 1,
                        background: "linear-gradient(135deg, var(--wagyu-gold), var(--wagyu-gold-light))",
                        color: "#000",
                        fontWeight: 600,
                        "&:hover": {
                          background: "linear-gradient(135deg, var(--wagyu-gold-light), var(--wagyu-gold))",
                        },
                        "&:disabled": {
                          background: "rgba(255, 255, 255, 0.1)",
                          color: "var(--color-text-muted)",
                        },
                      }}
                    >
                      {isLoading ? (
                        <>
                          <CircularProgress size={20} sx={{ mr: 1, color: "#000" }} />
                          {t.processing}
                        </>
                      ) : (
                        t.submit
                      )}
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
