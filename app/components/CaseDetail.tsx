import type { ReactNode } from "react";
import {
  ArrowLink,
  PageHero,
  SiteFooter,
  SiteHeader,
  StatusPill,
} from "./SiteChrome";

type Step = { title: string; body: string };

export function CaseDetail({
  eyebrow,
  title,
  intro,
  status,
  tone,
  rule,
  situation,
  problemTitle,
  problem,
  steps,
  outcomes,
  scope,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  status: string;
  tone: "sage" | "coral" | "gold" | "slate";
  rule: string;
  situation: string;
  problemTitle: string;
  problem: string;
  steps: Step[];
  outcomes: string[];
  scope: string[];
  children?: ReactNode;
}) {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main">
        <PageHero
          eyebrow={eyebrow}
          title={title}
          intro={intro}
          aside={
            <div className="rule-card">
              <StatusPill tone={tone}>{status}</StatusPill>
              <span>The shared rule</span>
              <strong>“{rule}”</strong>
            </div>
          }
        />

        <section className="section detail-intro-section">
          <div className="shell detail-grid">
            <div>
              <p className="eyebrow">The situation</p>
              <h2>Several agents. One shared outcome.</h2>
            </div>
            <p className="detail-lede">{situation}</p>
          </div>
        </section>

        <section className="section section-ink">
          <div className="shell detail-grid">
            <div>
              <p className="eyebrow">What can go wrong</p>
              <h2>{problemTitle}</h2>
            </div>
            <p className="detail-lede">{problem}</p>
          </div>
        </section>

        <section className="section">
          <div className="shell">
            <div className="section-heading">
              <p className="eyebrow">The SAGE path</p>
              <h2>Keep the rule, decision, and action connected.</h2>
            </div>
            <ol className="case-steps">
              {steps.map((step, index) => (
                <li key={step.title}>
                  <span>0{index + 1}</span>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {children}

        <section className="section outcomes-section">
          <div className="shell detail-grid">
            <div>
              <p className="eyebrow">What the organization gains</p>
              <h2>Fleet-wide control without fleet-wide policy glue.</h2>
            </div>
            <ul className="check-list">
              {outcomes.map((outcome) => (
                <li key={outcome}>{outcome}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section scope-section">
          <div className="shell scope-grid">
            <div>
              <p className="eyebrow">Current scope</p>
              <h2>What this example means—and where it stops.</h2>
            </div>
            <ul>
              {scope.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <ArrowLink href="/resources/evidence/">
              Inspect evidence and boundaries
            </ArrowLink>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
