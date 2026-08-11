import Link from "next/link";
import type {
  ArticleBlock,
  PublishedArticle,
} from "../../data/articles";
import { ArticleCodeBlock } from "./ArticleCodeBlock";
import styles from "./blog.module.css";

function CitationMarkers({
  article,
  citationIds,
}: {
  article: PublishedArticle;
  citationIds?: readonly string[];
}) {
  if (!citationIds?.length) return null;

  return (
    <sup className={styles.citationMarkers} aria-label="Sources">
      {citationIds.map((citationId) => {
        const citationIndex = article.citations.findIndex(
          ({ id }) => id === citationId,
        );

        if (citationIndex < 0) return null;

        return (
          <a href={`#source-${citationId}`} key={citationId}>
            [{citationIndex + 1}]
          </a>
        );
      })}
    </sup>
  );
}

function PolicySeparationDiagram() {
  return (
    <div className={styles.policyDiagram} aria-hidden="true">
      <div className={styles.diagramPlane}>
        <span>Policy management</span>
        <div className={styles.diagramFlow}>
          <b>Policy owner</b>
          <i>Author · review · test</i>
          <b>Versioned program</b>
        </div>
      </div>
      <div className={`${styles.diagramPlane} ${styles.runtimePlane}`}>
        <span>Governed runtime</span>
        <div className={styles.diagramFlow}>
          <b>Agent request</b>
          <i>Evaluate named revision</i>
          <b>Decision + record</b>
          <i>Provider boundary</i>
          <b>Governed effect</b>
        </div>
      </div>
    </div>
  );
}

function StaleBudgetDiagram() {
  return (
    <div className={styles.budgetDiagram} aria-hidden="true">
      <div className={styles.budgetState}>
        <span>Shared policy state</span>
        <b>9 of 10 units consumed</b>
      </div>
      <div className={styles.budgetPaths}>
        <div className={styles.budgetPath}>
          <span>Detached checks</span>
          <p>A reads 9 → allow +1</p>
          <p>B reads 9 → allow +1</p>
          <strong className={styles.badOutcome}>Both commit → 11 of 10</strong>
        </div>
        <div className={styles.budgetPath}>
          <span>Scoped coordination</span>
          <p>A reads 9 → commits → 10</p>
          <p>B reads 10 → deny</p>
          <strong className={styles.goodOutcome}>One commit → 10 of 10</strong>
        </div>
      </div>
    </div>
  );
}

function GovernanceBoundaryDiagram() {
  const steps = [
    ["01", "Governed request", "Trusted identity + typed arguments"],
    ["02", "Policy program", "Declared certified state views"],
    ["03", "Logical scopes", "Policy reads + effect footprint"],
    ["04", "Coordination", "Protected decision-effect interval"],
    ["05", "Provider effect", "Consequential operation"],
    ["06", "Operation record", "Request → decision → effect"],
  ] as const;

  return (
    <div className={styles.boundaryDiagram} aria-hidden="true">
      {steps.map(([number, title, description]) => (
        <div className={styles.boundaryStep} key={number}>
          <span>{number}</span>
          <b>{title}</b>
          <small>{description}</small>
        </div>
      ))}
    </div>
  );
}

function ArticleDiagram({ block }: { block: Extract<ArticleBlock, { kind: "diagram" }> }) {
  return (
    <figure className={styles.articleFigure}>
      <div className={styles.figureHeading}>
        <span>Conceptual schematic</span>
        <h3>{block.title}</h3>
        <p>{block.description}</p>
      </div>
      <div role="img" aria-label={block.description}>
        {block.variant === "policy-separation" ? (
          <PolicySeparationDiagram />
        ) : null}
        {block.variant === "stale-budget" ? <StaleBudgetDiagram /> : null}
        {block.variant === "governance-boundary" ? (
          <GovernanceBoundaryDiagram />
        ) : null}
      </div>
      <figcaption>
        {block.caption}{" "}
        {block.source ? (
          <a href={block.source.href} rel="noreferrer" target="_blank">
            {block.source.label}
          </a>
        ) : null}
      </figcaption>
    </figure>
  );
}

function ArticleBlockView({
  article,
  block,
}: {
  article: PublishedArticle;
  block: ArticleBlock;
}) {
  if (block.kind === "paragraph") {
    return (
      <p>
        {block.text}
        <CitationMarkers article={article} citationIds={block.citationIds} />
      </p>
    );
  }

  if (block.kind === "list") {
    const List = block.ordered ? "ol" : "ul";
    return (
      <List className={block.ordered ? styles.numberedList : styles.articleList}>
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </List>
    );
  }

  if (block.kind === "comparison") {
    return (
      <div className={styles.comparisonGrid}>
        {block.items.map((item) => (
          <article key={item.label}>
            <span>{item.label}</span>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    );
  }

  if (block.kind === "code") {
    return <ArticleCodeBlock block={block} />;
  }

  if (block.kind === "callout") {
    return (
      <aside className={`${styles.callout} ${styles[block.tone]}`}>
        <span>{block.label}</span>
        <p>
          {block.text}
          <CitationMarkers article={article} citationIds={block.citationIds} />
        </p>
      </aside>
    );
  }

  return <ArticleDiagram block={block} />;
}

function RelatedLink({ link }: { link: PublishedArticle["relatedLinks"][number] }) {
  const content = (
    <>
      <span>{link.label}</span>
      <h3>{link.title}</h3>
      <p>{link.description}</p>
      <b>Open →</b>
    </>
  );

  if (link.href.startsWith("/")) {
    return (
      <Link className={styles.relatedCard} href={link.href}>
        {content}
      </Link>
    );
  }

  return (
    <a
      className={styles.relatedCard}
      href={link.href}
      rel="noreferrer"
      target="_blank"
    >
      {content}
    </a>
  );
}

export function ArticleBody({ article }: { article: PublishedArticle }) {
  return (
    <div className={styles.articleLayout}>
      <aside className={styles.tableOfContents} aria-label="In this article">
        <span>In this article</span>
        <nav>
          {article.sections.map((section, index) => (
            <a href={`#${section.id}`} key={section.id}>
              {String(index + 1).padStart(2, "0")} · {section.title}
            </a>
          ))}
          <a href="#evidence-and-limitations">Evidence and limitations</a>
          <a href="#sources">Sources</a>
        </nav>
      </aside>

      <div className={styles.articleBody}>
        {article.sections.map((section) => (
          <section id={section.id} key={section.id}>
            <p className="masugate-eyebrow">{section.eyebrow}</p>
            <h2>{section.title}</h2>
            {section.blocks.map((block, index) => (
              <ArticleBlockView
                article={article}
                block={block}
                key={`${section.id}-${block.kind}-${index}`}
              />
            ))}
          </section>
        ))}

        <section id="evidence-and-limitations">
          <p className="masugate-eyebrow">Publication boundary</p>
          <h2>Evidence and limitations</h2>
          <div className={styles.evidenceGrid}>
            <div>
              <span>
                Evidence ·{" "}
                {article.evidence.status === "reference"
                  ? "Reference"
                  : "Verified"}
              </span>
              <h3>
                {article.evidence.status === "reference"
                  ? article.evidence.locator
                  : article.evidence.immutableRevision}
              </h3>
              <p>
                {article.evidence.status === "reference"
                  ? article.evidence.note
                  : `Verified ${article.evidence.verifiedAt} through ${article.evidence.gate}.`}
              </p>
            </div>
            <div>
              <span>Limitations</span>
              <ul>
                {article.limitations.map((limitation) => (
                  <li key={limitation}>{limitation}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="sources">
          <p className="masugate-eyebrow">Primary sources</p>
          <h2>Sources and further reading</h2>
          <ol className={styles.sourceList}>
            {article.citations.map((citation) => (
              <li id={`source-${citation.id}`} key={citation.id}>
                <a href={citation.href} rel="noreferrer" target="_blank">
                  {citation.title}
                </a>
                <span>{citation.publisher}</span>
                {citation.note ? <p>{citation.note}</p> : null}
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.relatedSection}>
          <p className="masugate-eyebrow">Continue exploring</p>
          <h2>Related paths</h2>
          <div className={styles.relatedGrid}>
            {article.relatedLinks.map((link) => (
              <RelatedLink key={`${link.href}-${link.title}`} link={link} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
