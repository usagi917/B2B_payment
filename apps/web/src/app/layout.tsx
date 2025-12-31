import type { Metadata } from "next";
import { ThemeProvider } from "@/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wagyu Milestone Escrow",
  description: "B2B和牛肥育工程マイルストーンエスクローdApp - Premium Blockchain Payment Infrastructure",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased min-h-screen">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
