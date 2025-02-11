import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import NextTopLoader from "nextjs-toploader";

import "./globals.css";

import { ThemeProvider } from "@/providers/theme-provider";
import { SessionProvider } from "next-auth/react";
// import { Toaster } from "@/components/ui/toaster";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.APP_URL
      ? `${process.env.APP_URL}`
      : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : `http://localhost:${process.env.PORT || 3000}`
  ),
  title: "bridgebooks",
  description:
    "Simple, exclusive and easy to use crm software for bridgebooks.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    url: "/",
    title: "bridgebooks",
    description:
      "Simple, exclusive and easy to use crm software for bridgebooks.",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Simple, exclusive and easy to use crm software for bridgebooks.",
    description:
      "Simple, exclusive and easy to use crm software for bridgebooks."
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={GeistSans.className}>
        <SessionProvider>
          <NextTopLoader color="#C2A76D" />
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
            <Toaster />
            {/* <Sonner /> */}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
