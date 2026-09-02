import type { Metadata } from "next";
import { headers } from "next/headers";
import { createThemeBootScript } from "./data/theme";
import "./globals.css";

const GOOGLE_ANALYTICS_ID = "G-ZWBT158GJT";

export async function generateMetadata(): Promise<Metadata> {
  if (process.env.PAGES_BUILD === "1") {
    return {
      metadataBase: new URL("https://masugate.github.io"),
    };
  }

  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");

  return {
    metadataBase: new URL(protocol + "://" + host),
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: createThemeBootScript(),
          }}
        />
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GOOGLE_ANALYTICS_ID}');`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
