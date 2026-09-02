import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBody } from "../ArticleBody";
import {
  getPublishedArticle,
  publishedArticles,
} from "../../../data/articles";
import {
  createMasuGateArticleMetadata,
  createMasuGatePageMetadata,
} from "../../../data/metadata";
import styles from "../blog.module.css";

type BlogArticlePageProps = {
  params: Promise<{ slug: string }>;
};

const articleDate = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
  year: "numeric",
});

function formatArticleDate(value: string) {
  return articleDate.format(new Date(`${value}T00:00:00Z`));
}

export function generateStaticParams() {
  return publishedArticles.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: BlogArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getPublishedArticle(slug);

  if (!article) {
    return createMasuGatePageMetadata({
      title: "Article unavailable",
      description: "This MasuGate technical article is not published.",
      path: `/blog/${slug}/`,
    });
  }

  return createMasuGateArticleMetadata(article);
}

export default async function BlogArticlePage({
  params,
}: BlogArticlePageProps) {
  const { slug } = await params;
  const article = getPublishedArticle(slug);

  if (!article) {
    notFound();
  }

  return (
    <main className="masugate-main" id="masugate-main">
      <article>
        <header className={`masugate-page-hero ${styles.articleHero}`}>
          <div className={`masugate-shell ${styles.articleHeroGrid}`}>
            <div className={styles.articleHeroCopy}>
              <Link className={styles.articleBackLink} href="/blog/">
                <span aria-hidden="true">←</span> Blog &amp; Updates
              </Link>
              <p className="masugate-eyebrow">
                {article.publicationType === "announcement"
                  ? "MasuGate announcement"
                  : "Technical article"}
              </p>
              <h1>{article.title}</h1>
              <p className="masugate-page-intro">{article.summary}</p>
              <ul className={`${styles.labelList} ${styles.heroLabels}`} aria-label="Topics">
                {article.labels.map((label) => (
                  <li key={label}>{label}</li>
                ))}
              </ul>
            </div>
            <aside className={styles.metadataCard} aria-label="Article metadata">
              <div className={styles.metadataHeading}>
                <span>Article record</span>
                <strong>{article.readingMinutes} min</strong>
              </div>
              <dl>
                <div>
                  <dt>For</dt>
                  <dd>{article.audience}</dd>
                </div>
                <div>
                  <dt>Published</dt>
                  <dd>
                    <time dateTime={article.publishedAt}>
                      {formatArticleDate(article.publishedAt)}
                    </time>
                  </dd>
                </div>
                {article.updatedAt ? (
                  <div>
                    <dt>Updated</dt>
                    <dd>
                      <time dateTime={article.updatedAt}>
                        {formatArticleDate(article.updatedAt)}
                      </time>
                    </dd>
                  </div>
                ) : null}
                <div>
                  <dt>Reading time</dt>
                  <dd>{article.readingMinutes} minutes</dd>
                </div>
                <div>
                  <dt>Evidence</dt>
                  <dd>
                    {article.evidence.status === "reference"
                      ? "Reference"
                      : "Verified"}
                  </dd>
                </div>
                {article.relatedSourceRevision ? (
                  <div>
                    <dt>Related source</dt>
                    <dd>{article.relatedSourceRevision}</dd>
                  </div>
                ) : null}
                {article.relatedReleaseId ? (
                  <div>
                    <dt>Related release</dt>
                    <dd>{article.relatedReleaseId}</dd>
                  </div>
                ) : null}
                {article.relatedPolicyRevision ? (
                  <div>
                    <dt>Related policy</dt>
                    <dd>{article.relatedPolicyRevision}</dd>
                  </div>
                ) : null}
              </dl>
            </aside>
          </div>
        </header>

        <div className={`masugate-section ${styles.articleSection}`}>
          <div className="masugate-shell">
            <ArticleBody article={article} />
            <div className={`masugate-actions ${styles.articleFooterAction}`}>
              <Link
                className="masugate-button masugate-button-secondary"
                href="/blog/"
              >
                Back to Blog &amp; Updates
              </Link>
            </div>
          </div>
        </div>
      </article>
    </main>
  );
}
