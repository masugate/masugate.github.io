import type { ReactNode } from "react";
import Link from "next/link";

const navigation = [
  {
    href: "/use-cases/",
    label: "Use Cases",
    items: [
      { href: "/use-cases/", label: "All use cases", detail: "See where shared rules matter" },
      { href: "/use-cases/purchasing/", label: "Purchasing", detail: "Budgets and approvals" },
      { href: "/use-cases/calendar/", label: "Scheduling", detail: "Shared organizational calendars" },
      { href: "/use-cases/workspace/", label: "Workspaces", detail: "Files and protected paths" },
      { href: "/use-cases/business-controls/", label: "Business controls", detail: "Approved operating restrictions" },
    ],
  },
  {
    href: "/how-it-works/",
    label: "How It Works",
    items: [
      { href: "/how-it-works/", label: "The governance path", detail: "From request to reconciled result" },
      { href: "/demo/", label: "Interactive demo", detail: "Inside one governed action" },
      { href: "/resources/technical-foundation/", label: "Technical foundation", detail: "Coordination under the surface" },
    ],
  },
  {
    href: "/integrations/",
    label: "Integrations",
    items: [
      { href: "/integrations/", label: "Integration overview", detail: "Bring SAGE to agent frameworks" },
      { href: "/integrations/#openclaw", label: "OpenClaw", detail: "Reference deployment" },
      { href: "/integrations/#langchain-langgraph", label: "LangChain / LangGraph", detail: "Reference integration" },
      { href: "/integrations/#microsoft-agent-framework", label: "Microsoft Agent Framework", detail: "Reference integration" },
      { href: "/integrations/#crewai", label: "CrewAI", detail: "Reference integration" },
    ],
  },
  {
    href: "/resources/",
    label: "Resources",
    items: [
      { href: "/resources/", label: "Article library", detail: "Examples, walkthroughs, and results" },
      { href: "/resources/get-started/", label: "Get Started", detail: "Build one governed action" },
      { href: "/resources/policy-as-program/", label: "Policy as Program", detail: "Read an annotated SAGE policy" },
      { href: "/resources/governed-action-lifecycle/", label: "Governed Action Lifecycle", detail: "Inspect concrete protocol documents" },
      { href: "/resources/technical-foundation/", label: "Technical foundation", detail: "Coordination under the surface" },
      { href: "/resources/evidence/", label: "Evidence & boundaries", detail: "Claims, records, and limits" },
    ],
  },
  {
    href: "/team/",
    label: "Team",
    items: [
      { href: "/team/", label: "Meet the team", detail: "The people behind SAGE" },
      { href: "/team/#contact", label: "Contact", detail: "Start a project or research conversation" },
      { href: "/team/#project-status", label: "Current project", detail: "What the research preview includes" },
    ],
  },
];

export function Brand() {
  return (
    <Link className="brand" href="/" aria-label="SAGE home">
      <span className="brand-symbol" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span>SAGE</span>
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Brand />
        <nav className="desktop-nav" aria-label="Primary navigation">
          {navigation.map((item) => (
            <div className="nav-menu" key={item.href}>
              <a
                aria-haspopup="true"
                className="nav-trigger"
                href={item.href}
              >
                {item.label}
                <span aria-hidden="true">⌄</span>
              </a>
              <div className="nav-dropdown">
                {item.items.map((child, index) => (
                  <a
                    className={index === 0 ? "nav-overview-link" : ""}
                    href={child.href}
                    key={child.href}
                  >
                    <strong>{child.label}</strong>
                    <small>{child.detail}</small>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <a className="header-cta" href="/demo/">
          See the Demo
        </a>
        <details className="mobile-nav">
          <summary aria-label="Open navigation">
            <span />
            <span />
          </summary>
          <nav aria-label="Mobile navigation">
            {navigation.map((item) => (
              <details key={item.href}>
                <summary>{item.label}</summary>
                <div>
                  {item.items.map((child) => (
                    <a href={child.href} key={child.href}>
                      {child.label}
                    </a>
                  ))}
                </div>
              </details>
            ))}
            <a className="mobile-demo-link" href="/demo/">
              See the Demo
            </a>
          </nav>
        </details>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-brand">
          <Brand />
          <p>One set of rules for agent fleets.</p>
        </div>
        <div>
          <h2>Explore</h2>
          <a href="/use-cases/">Use Cases</a>
          <a href="/how-it-works/">How It Works</a>
          <a href="/integrations/">Integrations</a>
          <a href="/demo/">Demo</a>
        </div>
        <div>
          <h2>Team &amp; project</h2>
          <a href="/team/">Team &amp; Contact</a>
          <a href="/resources/">Resources</a>
          <a href="/resources/get-started/">Get Started</a>
          <a href="/resources/technical-foundation/">Technical Foundation</a>
          <a href="/resources/evidence/">Evidence &amp; Boundaries</a>
        </div>
        <div className="footer-statement">
          <span>Governance infrastructure</span>
          <p>
            Shared rules, coordinated decisions, and bounded actions across the
            fleet.
          </p>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© 2026 SAGE Project</span>
        <span>Research preview</span>
      </div>
    </footer>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  light = false,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  light?: boolean;
}) {
  return (
    <div className={`section-heading${light ? " section-heading-light" : ""}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {intro ? <p className="section-intro">{intro}</p> : null}
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  intro,
  aside,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  aside?: ReactNode;
}) {
  return (
    <section className="page-hero">
      <div className="shell page-hero-grid">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{intro}</p>
        </div>
        {aside ? <div className="page-hero-aside">{aside}</div> : null}
      </div>
    </section>
  );
}

export function ArrowLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a className="arrow-link" href={href}>
      <span>{children}</span>
      <span aria-hidden="true">↗</span>
    </a>
  );
}

export function StatusPill({
  children,
  tone = "sage",
}: {
  children: ReactNode;
  tone?: "sage" | "coral" | "gold" | "slate";
}) {
  return <span className={`status-pill status-${tone}`}>{children}</span>;
}
