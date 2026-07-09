import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MiaTalk",
  description: "AI English speaking practice companion for primary students."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
