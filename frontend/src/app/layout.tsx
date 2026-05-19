import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Carrot - Từ điển Nhật-Việt",
  description: "Tra cứu từ vựng tiếng Nhật, Kanji, ví dụ và học flashcard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
