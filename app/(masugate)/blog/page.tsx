import type { Metadata } from "next";
import Link from "next/link";
import {
  blogPresentation,
  selectBlogIndexPublications,
} from "../../data/articles";
import { createMasuGatePageMetadata } from "../../data/metadata";
import styles from "./blog.module.css";

export const metadata: Metadata = createMasuGatePageMetadata({
  title: "Blog & Updates",
  description:
    "Technical articles, project updates, and announcements about MasuGate, stateful policy, concurrent agent actions, integrations, and evidence.",
  path: "/blog/",
});

const articleDate = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
  year: "numeric",
});

function formatArticleDate(value: string) {
  return articleDate.format(new Date(`${value}T00:00:00Z`));
}

export default function BlogIndexPage() {
  const publications = selectBlogIndexPublications();

  return (
    <main className="masugate-main" id="masugate-main">
      <section className={`masugate-page-hero ${styles.indexHero}`}>
        <div className={`masugate-shell ${styles.indexHeroGrid}`}>
          <div className={styles.indexIntro}>
            <p className="masugate-eyebrow">Blog &amp; Updates</p>
            <h1>Technical thinking and project updates, in one place.</h1>
            <p className="masugate-page-intro">
              Read the current explainers and return here for future MasuGate
              releases, studies, and project announcements.
            </p>
          </div>
          <aside className={styles.indexLedger} aria-label="Publication count">
            <span>{blogPresentation.index.ledgerLabel}</span>
            <strong>{String(publications.length).padStart(2, "0")}</strong>
            <small>{blogPresentation.index.entriesLabel}</small>
          </aside>
        </div>
      </section>

      <section className={`masugate-section ${styles.indexSection}`}>
        <div className="masugate-shell">
          {publications.length === 0 ? (
            <div className="masugate-empty-state">
              <p className="masugate-eyebrow">Publication gate</p>
              <h2>No articles or updates are published in this build.</h2>
              <p>
                Blog &amp; Updates remains out of the primary navigation until at
                least one substantive publication and its evidence boundaries
                are ready.
              </p>
              <div className="masugate-actions">
                <Link
                  className="masugate-button masugate-button-primary"
                  href="/demo/"
                >
                  Explore the developer demo
                </Link>
                <Link
                  className="masugate-button masugate-button-secondary"
                  href="/get-started/"
                >
                  Review Get Started
                </Link>
              </div>
            </div>
          ) : (
            <div className={styles.indexGrid}>
              {publications.map((article, index) => (
                <article
                  aria-labelledby={`publication-${article.slug}`}
                  className={styles.articleCard}
                  data-publication-type={article.publicationType}
                  key={article.slug}
                >
                  <span className={styles.cardIndex} aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className={styles.cardTopline}>
                    <span className={styles.cardKicker}>
                      {article.publicationType === "announcement"
                        ? "Announcement"
                        : "Technical article"}{" "}
                      · Evidence ·{" "}
                      {article.evidence.status === "reference"
                        ? "Reference"
                        : "Verified"}
                    </span>
                    <span className={styles.cardTiming}>
                      <time dateTime={article.updatedAt ?? article.publishedAt}>
                        {article.updatedAt
                          ? blogPresentation.index.updatedLabel
                          : blogPresentation.index.publishedLabel}{" "}
                        {formatArticleDate(
                          article.updatedAt ?? article.publishedAt,
                        )}
                      </time>
                      <span>{article.readingMinutes} min read</span>
                    </span>
                  </div>
                  <h2 id={`publication-${article.slug}`}>{article.title}</h2>
                  <p>{article.summary}</p>
                  <p className={styles.cardAudience}>For {article.audience}</p>
                  <ul className={styles.labelList} aria-label="Topics">
                    {article.labels.map((label) => (
                      <li key={label}>{label}</li>
                    ))}
                  </ul>
                  <Link className={styles.cardLink} href={article.href}>
                    {article.publicationType === "announcement"
                      ? "Read announcement"
                      : "Read article"}{" "}
                    →
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
