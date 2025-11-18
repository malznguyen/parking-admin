import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/components/providers";
import { ToastContainer } from "@/components/ui/toast-container";
import { GlobalLoading } from "@/components/ui/global-loading";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

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
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <StoreProvider>
          {children}
          <ToastContainer />
          <GlobalLoading />
          <ConfirmDialog />
        </StoreProvider>
      </body>
    </html>
  );
}
