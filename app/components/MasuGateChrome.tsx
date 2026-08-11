import Link from "next/link";
import { selectLatestAnnouncement } from "../data/articles";
import { contactContract } from "../data/contact";
import {
  type NavigationItemId,
  masugateSite,
  selectPrimaryNavigation,
} from "../data/masugate-site";

const navigationMaps: Record<
  NavigationItemId,
  Readonly<{
    summary: string;
    links: readonly Readonly<{ label: string; href: string; detail: string }>[];
  }>
> = {
  challenge: {
    summary: "Understand the shared-state problem",
    links: [
      {
        label: "The shared-budget problem",
        href: "/#shared-budget",
        detail: "See why two valid checks can conflict.",
      },
      {
        label: "The governed path",
        href: "/#governed-action-path",
        detail: "See the connected decision-and-effect flow.",
      },
    ],
  },
  demo: {
    summary: "Walk through a governed OpenClaw route",
    links: [
      {
        label: "Interactive walkthrough",
        href: "/demo/#interactive-walkthrough",
        detail: "Step through the product scenario.",
      },
      {
        label: "Policy to runtime",
        href: "/demo/#policy-runtime-lifecycle",
        detail: "See where policy maintenance stops.",
      },
      {
        label: "Static transcript",
        href: "/demo/#demo-static-transcript",
        detail: "Review every deterministic branch.",
      },
      {
        label: "OpenClaw reference",
        href: "/demo/openclaw-reference/",
        detail: "Inspect the bounded integration profile.",
      },
    ],
  },
  "get-started": {
    summary: "Set up the reference demo",
    links: [
      {
        label: "Requirements",
        href: "/get-started/#requirements",
        detail: "Prepare the supported local environment.",
      },
      {
        label: "Five-minute demonstration",
        href: "/get-started/#run-demo",
        detail: "Run and verify the procurement scenario.",
      },
      {
        label: "Technical reference",
        href: "/get-started/technical/",
        detail: "Inspect profiles, outcomes, and boundaries.",
      },
    ],
  },
  blog: {
    summary: "Read the project’s technical notes",
    links: [
      {
        label: "All posts",
        href: "/blog/",
        detail: "Browse explainers and project updates.",
      },
      {
        label: "Policy as code, not prompt",
        href: "/blog/policy-as-code-not-prompt/",
        detail: "Read the practical policy-program primer.",
      },
      {
        label: "Why allowed goes stale",
        href: "/blog/when-allowed-goes-stale/",
        detail: "Read the concurrent-agent problem in depth.",
      },
    ],
  },
};

function MasuGateBrand() {
  return (
    <Link
      aria-label={`${masugateSite.name} home`}
      className="masugate-brand"
      href={masugateSite.homeHref}
    >
      <span aria-hidden="true" className="masugate-brand-mark">
        <span className="masugate-brand-gate-frame" />
        <span className="masugate-brand-gate-core" />
      </span>
      <span>{masugateSite.name}</span>
    </Link>
  );
}

function formatUpdateDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

export function MasuGateUpdateBanner() {
  const update = selectLatestAnnouncement();

  if (!update) return null;

  const updateDate = update.updatedAt ?? update.publishedAt;

  return (
    <aside
      aria-label="Latest announcement"
      className="masugate-update-banner"
    >
      <div className="masugate-shell masugate-update-banner-inner">
        <div className="masugate-update-meta">
          <span>Latest announcement</span>
          <time dateTime={updateDate}>{formatUpdateDate(updateDate)}</time>
        </div>
        <Link
          aria-label={`Read announcement: ${update.title}`}
          className="masugate-update-link"
          href={update.href}
        >
          <strong>{update.title}</strong>
          <span>Read announcement →</span>
        </Link>
      </div>
    </aside>
  );
}

export function MasuGateHeader() {
  const navigation = selectPrimaryNavigation();
  const contactAction = masugateSite.navigation.contactAction;

  return (
    <header className="masugate-header">
      <div className="masugate-shell masugate-header-inner">
        <MasuGateBrand />
        <nav className="masugate-desktop-nav" aria-label="Primary navigation">
          {navigation.map((item) => {
            const menu = navigationMaps[item.id];

            return (
              <div className="masugate-nav-menu" key={item.id}>
                <Link className="masugate-nav-link" href={item.href}>
                  {item.label}
                </Link>
                <div className="masugate-nav-panel">
                  <p>{menu.summary}</p>
                  <div>
                    {menu.links.map((link) => (
                      <Link href={link.href} key={link.href}>
                        <strong>{link.label}</strong>
                        <span>{link.detail}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>
        <Link className="masugate-header-action" href={contactAction.href}>
          {contactAction.label}
        </Link>
        <details className="masugate-mobile-nav">
          <summary aria-label="Open navigation">Menu</summary>
          <nav className="masugate-mobile-panel" aria-label="Mobile navigation">
            {navigation.map((item) => (
              <Link href={item.href} key={item.id}>
                {item.label}
              </Link>
            ))}
            <Link href={contactAction.href}>{contactAction.label}</Link>
          </nav>
        </details>
      </div>
    </header>
  );
}

export function MasuGateFooter() {
  const navigation = selectPrimaryNavigation();

  return (
    <footer className="masugate-footer">
      <div className="masugate-shell masugate-footer-grid">
        <div>
          <MasuGateBrand />
          <p>{masugateSite.shortDescription}</p>
          <p>{masugateSite.publicPosture}</p>
        </div>
        <nav className="masugate-footer-nav" aria-label="Footer navigation">
          <strong>Explore</strong>
          {navigation.map((item) => (
            <Link href={item.href} key={item.id}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="masugate-footer-contact">
          <strong>Contact</strong>
          <a href={contactContract.sharedInbox.mailtoHref}>
            {contactContract.sharedInbox.email}
          </a>
          <span>Team profiles</span>
          {contactContract.people.map((person) => (
            <a
              href={person.profileHref}
              key={person.id}
              rel="noreferrer"
              target="_blank"
            >
              {person.name}
            </a>
          ))}
        </div>
      </div>
      <div className="masugate-shell masugate-footer-bottom">
        <span>MasuGate open-source research project</span>
        <span>Explicit evidence and limitation boundaries</span>
      </div>
    </footer>
  );
}
