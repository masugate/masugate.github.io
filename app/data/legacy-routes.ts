export type LegacyRedirect = Readonly<{
  source: `/${string}`;
  disposition: "redirect";
  destination: `/${string}`;
  reason: string;
}>;

export type RetainedLegacyRoute = Readonly<{
  source: `/${string}`;
  disposition: "retain";
  gate: string;
}>;

export type LegacyRouteDisposition =
  | LegacyRedirect
  | RetainedLegacyRoute;

export type LegacyRedirectStaticParam = Readonly<{
  legacyPath: string[];
}>;

export const legacyRedirectPresentation = {
  metadataTitle: "Page moved",
  unavailableMetadataTitle: "Page unavailable",
  eyebrow: "Page moved",
  title: "This MasuGate page has a new home.",
  fallbackMessage:
    "If you are not redirected automatically, use the link below.",
  actionLabel: "Continue to the current page",
} as const;

/**
 * The authoritative pre-launch migration map for legacy public routes.
 *
 * A route may move to `redirect` only after its destination preserves the
 * useful material. Retained routes stay reachable but remain outside the
 * MasuGate navigation and eventual sitemap.
 */
export const legacyRouteDispositions = [
  {
    source: "/team",
    disposition: "redirect",
    destination: "/#contact",
    reason: "The compact contact section names both current team members.",
  },
  {
    source: "/project",
    disposition: "redirect",
    destination: "/#contact",
    reason: "The project alias has the same compact public successor as Team.",
  },
  {
    source: "/resources",
    disposition: "redirect",
    destination: "/blog/",
    reason:
      "The Blog index now publishes substantive technical articles and project updates.",
  },
  {
    source: "/resources/policy-as-program",
    disposition: "redirect",
    destination: "/blog/policy-as-code-not-prompt/",
    reason: "The policy-as-code article is the reviewed conceptual successor.",
  },
  {
    source: "/resources/technical-foundation",
    disposition: "redirect",
    destination: "/blog/when-allowed-goes-stale/",
    reason: "The stateful-governance article carries forward the reviewed mechanism.",
  },
  {
    source: "/how-it-works",
    disposition: "redirect",
    destination: "/blog/when-allowed-goes-stale/#the-governed-boundary",
    reason: "The governed-boundary section is the focused mechanism successor.",
  },
  {
    source: "/integrations",
    disposition: "redirect",
    destination: "/demo/#framework-portability",
    reason: "The OpenClaw demo contains the current bounded Reference integration profiles.",
  },
  {
    source: "/use-cases/purchasing",
    disposition: "redirect",
    destination: "/#shared-budget",
    reason: "The accepted homepage preserves the complete shared-budget teaching story.",
  },
  {
    source: "/use-cases/calendar",
    disposition: "redirect",
    destination: "/demo/#demo-transcript-stage-3",
    reason: "The Stage 3 transcript preserves the bounded calendar workflow.",
  },
  {
    source: "/use-cases/workspace",
    disposition: "redirect",
    destination: "/demo/#demo-transcript-stage-3",
    reason: "The Stage 3 transcript preserves the protected-workspace workflow.",
  },
  {
    source: "/use-cases",
    disposition: "retain",
    gate: "No current destination preserves discovery across every useful use case.",
  },
  {
    source: "/use-cases/business-controls",
    disposition: "retain",
    gate: "No reviewed destination preserves its data and counterparty scenario.",
  },
  {
    source: "/resources/get-started",
    disposition: "retain",
    gate: "The release-backed Milestone 4B destination remains incomplete.",
  },
  {
    source: "/resources/governed-action-lifecycle",
    disposition: "retain",
    gate: "No reviewed destination preserves the complete protocol document walkthrough.",
  },
  {
    source: "/resources/evidence",
    disposition: "retain",
    gate: "No reviewed destination preserves the evidence matrix and deployment checklist.",
  },
] as const satisfies readonly LegacyRouteDisposition[];

export const activeLegacyRedirects: readonly LegacyRedirect[] =
  legacyRouteDispositions.filter(
    (route): route is Extract<
      (typeof legacyRouteDispositions)[number],
      { disposition: "redirect" }
    > => route.disposition === "redirect",
  );

export const retainedLegacyRoutes: readonly RetainedLegacyRoute[] =
  legacyRouteDispositions.filter(
    (route): route is Extract<
      (typeof legacyRouteDispositions)[number],
      { disposition: "retain" }
    > => route.disposition === "retain",
  );

export function findLegacyRedirect(
  pathname: string,
): LegacyRedirect | undefined {
  const normalizedPathname =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;

  return activeLegacyRedirects.find(
    ({ source }) => source === normalizedPathname,
  );
}

export function getLegacyRedirectStaticParams(): readonly LegacyRedirectStaticParam[] {
  return activeLegacyRedirects.map(({ source }) => ({
    legacyPath: source.slice(1).split("/"),
  }));
}

export function findLegacyRedirectBySegments(
  legacyPath: readonly string[],
): LegacyRedirect | undefined {
  return findLegacyRedirect(`/${legacyPath.join("/")}`);
}
