import type { ReactNode } from "react";
import Link from "next/link";
import { isAvailable } from "../data/contracts";
import {
  masugateSite,
  selectPrimaryNavigation,
} from "../data/masugate-site";

const navigation = selectPrimaryNavigation();
const contactAction = masugateSite.navigation.contactAction;
const sourceRepository = masugateSite.sourceRepository;
const researchPaper = masugateSite.researchPaper;

export function Brand() {
  return (
    <Link
      className="brand"
      href={masugateSite.homeHref}
      aria-label={`${masugateSite.name} home`}
    >
      <span className="brand-symbol" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span>{masugateSite.name}</span>
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
              <Link className="nav-trigger" href={item.href}>
                {item.label}
              </Link>
            </div>
          ))}
        </nav>
        <Link className="header-cta" href={contactAction.href}>
          {contactAction.label}
        </Link>
        <details className="mobile-nav">
          <summary aria-label="Open navigation">
            <span />
            <span />
          </summary>
          <nav aria-label="Mobile navigation">
            {navigation.map((item) => (
              <Link href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
            <Link className="mobile-demo-link" href={contactAction.href}>
              {contactAction.label}
            </Link>
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
          <p>{masugateSite.shortDescription}</p>
        </div>
        <div>
          <h2>Explore</h2>
          {navigation.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
        <div>
          <h2>Project</h2>
          <Link href="/demo/openclaw-reference/">OpenClaw reference</Link>
          <Link href="/get-started/technical/">Technical reference</Link>
          {isAvailable(sourceRepository) ? (
            <a href={sourceRepository.value.href} rel="noreferrer" target="_blank">
              Source on GitHub
            </a>
          ) : null}
          {isAvailable(researchPaper) ? (
            <a href={researchPaper.value.href} rel="noreferrer" target="_blank">
              Research paper
            </a>
          ) : null}
        </div>
        <div className="footer-statement">
          <span>Governance infrastructure</span>
          <p>{masugateSite.publicPosture}</p>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© 2026 {masugateSite.name} Project</span>
        <span>Open-source research preview</span>
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
