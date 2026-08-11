import {
  type Availability,
  available,
  unavailable,
} from "./contracts";
import { hasPublishedArticles } from "./articles";
import { contactContract } from "./contact";

export type NavigationItemId =
  | "challenge"
  | "demo"
  | "get-started"
  | "blog";

export interface NavigationItem {
  id: NavigationItemId;
  label: string;
  href: string;
}

export interface SiteIdentityContract {
  name: "MasuGate";
  homeHref: "/";
  category: string;
  shortDescription: string;
  publicPosture: string;
  navigation: Readonly<{
    primary: readonly NavigationItem[];
    conditional: readonly Readonly<{
      item: NavigationItem;
      gate: "has-published-article";
    }>[];
    contactAction: typeof contactContract.navigationAction;
  }>;
  metadata: Readonly<{
    defaultTitle: string;
    titleTemplate: string;
    description: string;
    canonicalOrigin: Availability<string>;
    socialImage: Availability<
      Readonly<{
        path: `/${string}`;
        width: number;
        height: number;
        alt: string;
      }>
    >;
  }>;
  sourceRepository: Availability<
    Readonly<{
      label: string;
      href: `https://${string}`;
    }>
  >;
  researchPaper: Availability<
    Readonly<{
      title: string;
      href: `https://${string}`;
    }>
  >;
}

const blogNavigationItem = {
  id: "blog",
  label: "Blog & Updates",
  href: "/blog/",
} as const satisfies NavigationItem;

export const masugateSite = {
  name: "MasuGate",
  homeHref: "/",
  category: "Stateful governance for concurrent agentic systems",
  shortDescription:
    "MasuGate helps agentic systems apply stateful policies across concurrent actions and retain a record connecting each request, decision, and effect.",
  publicPosture:
    "An open-source research and systems project with bounded integrations, inspectable evidence, and explicit limitations.",
  navigation: {
    primary: [
      { id: "challenge", label: "Challenge", href: "/#challenge" },
      { id: "demo", label: "OpenClaw Demo", href: "/demo/" },
      { id: "get-started", label: "Get Started", href: "/get-started/" },
    ],
    conditional: [
      {
        item: blogNavigationItem,
        gate: "has-published-article",
      },
    ],
    contactAction: contactContract.navigationAction,
  },
  metadata: {
    defaultTitle: "MasuGate — Stateful governance for concurrent agents",
    titleTemplate: "%s — MasuGate",
    description:
      "MasuGate connects stateful policies, shared mutable state, and governed effects so concurrent agent actions retain a valid policy explanation.",
    canonicalOrigin: unavailable(
      "canonical-source-unconfirmed",
      "The public domain has not been confirmed; omit a canonical URL until it is.",
    ),
    socialImage: available({
      path: "/og-masugate.png",
      width: 1200,
      height: 630,
      alt: "MasuGate — Stateful governance for concurrent agents",
    }),
  },
  sourceRepository: available({
    label: "MasuGate on GitHub",
    href: "https://github.com/masugate/masugate",
  }),
  researchPaper: available({
    title: "Stateful Governance for Concurrent Agentic Systems",
    href: "https://arxiv.org/abs/2608.02764v1",
  }),
} as const satisfies SiteIdentityContract;

export function selectPrimaryNavigation(): readonly NavigationItem[] {
  if (!hasPublishedArticles) {
    return masugateSite.navigation.primary;
  }

  return [...masugateSite.navigation.primary, blogNavigationItem];
}
