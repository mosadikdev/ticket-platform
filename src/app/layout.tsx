import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ticket Platform",
  description: "منصة بيع تذاكر الفعاليات",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={geist.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}