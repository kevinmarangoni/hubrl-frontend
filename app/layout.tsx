import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import Script from "next/script";
import { getThemeInitScript } from "@/lib/theme-constants";
import { Providers } from "./providers";
import "./globals.css";

const urbanist = Urbanist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-urbanist",
});

export const metadata: Metadata = {
  title: "hubrl",
  description: "hubrl",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={urbanist.variable} suppressHydrationWarning>
      <body className={`${urbanist.className} min-h-screen`}>
        <Script id="hubrl-theme-init" strategy="beforeInteractive">
          {getThemeInitScript()}
        </Script>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
