import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HaUI Smart Parking | Admin Dashboard",
  description:
    "Hệ thống quản lý bãi đỗ xe thông minh - Trường Đại học Công nghiệp Hà Nội",
  keywords: ["parking", "HaUI", "smart parking", "admin dashboard"],
  authors: [{ name: "HaUI IT Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
