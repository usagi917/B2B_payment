import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Milestone Escrow",
  description: "B2B和牛肥育工程マイルストーンエスクローdApp",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
