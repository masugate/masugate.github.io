import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegacyRedirectNotice } from "../../components/LegacyRedirectNotice";
import { createLegacyRedirectMetadata } from "../../data/legacy-redirect-metadata";
import {
  findLegacyRedirectBySegments,
  getLegacyRedirectStaticParams,
  legacyRedirectPresentation,
} from "../../data/legacy-routes";

interface LegacyRedirectPageProps {
  params: Promise<{ legacyPath: string[] }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return [...getLegacyRedirectStaticParams()];
}

export async function generateMetadata({
  params,
}: LegacyRedirectPageProps): Promise<Metadata> {
  const { legacyPath } = await params;
  const redirect = findLegacyRedirectBySegments(legacyPath);

  if (!redirect) {
    return {
      title: legacyRedirectPresentation.unavailableMetadataTitle,
      robots: { index: false, follow: false },
    };
  }

  return createLegacyRedirectMetadata(redirect);
}

export default async function LegacyRedirectPage({
  params,
}: LegacyRedirectPageProps) {
  const { legacyPath } = await params;
  const redirect = findLegacyRedirectBySegments(legacyPath);

  if (!redirect) {
    notFound();
  }

  return (
    <LegacyRedirectNotice
      destination={redirect.destination}
      reason={redirect.reason}
    />
  );
}
