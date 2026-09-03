import type { Metadata } from "next";
import {
  type LegacyRedirect,
  legacyRedirectPresentation,
} from "./legacy-routes";
import { createMasuGatePageMetadata } from "./metadata";

export function createLegacyRedirectMetadata(
  redirect: LegacyRedirect,
): Metadata {
  const canonicalPath = redirect.destination.split("#", 1)[0] as `/${string}`;

  return {
    ...createMasuGatePageMetadata({
      title: legacyRedirectPresentation.metadataTitle,
      description: redirect.reason,
      path: canonicalPath,
    }),
    robots: { index: false, follow: true },
  };
}
