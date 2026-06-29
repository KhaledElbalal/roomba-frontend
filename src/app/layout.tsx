import type { Metadata } from "next";
import "./globals.css";

import { spaceGrotesk, jetbrainsMono } from "./fonts";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "@/components/providers";
import { QueryProvider } from "@/components/query-provider";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001",
  ),
  title: "roomba",
  description:
    "Autonomous agents that close the loop — from a Linear issue to an isolated container.",
  openGraph: {
    images: ["/brand/social/roomba-og-1200x630.png"],
  },
  icons: {
    icon: [
      { url: "/brand/favicon/favicon.svg", type: "image/svg+xml" },
      { url: "/brand/favicon/favicon-32.png", sizes: "32x32" },
    ],
    apple: "/brand/favicon/apple-touch-icon-180.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Roomba is dark-first: `dark` + the font variables live on <html>.
  return (
    <html
      lang="en"
      className={`dark ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <Providers>
            <QueryProvider>{children}</QueryProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
