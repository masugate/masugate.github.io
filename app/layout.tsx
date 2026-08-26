import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const GOOGLE_ANALYTICS_ID_PATTERN = /^G-[A-Z0-9]+$/;

function configuredGoogleAnalyticsId(): string | undefined {
  const measurementId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

  return process.env.NODE_ENV === "production" &&
    measurementId &&
    GOOGLE_ANALYTICS_ID_PATTERN.test(measurementId)
    ? measurementId
    : undefined;
}

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
  const googleAnalyticsId = configuredGoogleAnalyticsId();

  return (
    <html lang="en">
      {googleAnalyticsId ? (
        <head>
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${googleAnalyticsId}');`,
            }}
          />
        </head>
      ) : null}
      <body>{children}</body>
    </html>
  );
}
