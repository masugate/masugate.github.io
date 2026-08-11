import { PageHero, SiteFooter, SiteHeader, StatusPill } from "../components/SiteChrome";
import { UseCaseVisual } from "../components/UseCaseVisual";
import { useCases } from "../data/site";

export default function UseCasesPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="Use cases"
          title="Govern the outcome agents share."
          intro="SAGE is useful where many agents act on the same money, time, information, or work product. Start with the organization-wide rule that must remain true."
        />
        <section className="section">
          <div className="shell case-grid">
            {useCases.map((item) => (
              <a className="case-card" href={item.href} key={item.slug}>
                <div>
                  <StatusPill tone={item.tone}>{item.status}</StatusPill>
                  <span className="case-number">{item.number}</span>
                </div>
                <UseCaseVisual slug={item.slug} />
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
                <span className="card-link">Explore the case →</span>
              </a>
            ))}
          </div>
        </section>
        <section className="section section-ink">
          <div className="shell">
            <p className="eyebrow">A useful starting question</p>
            <p className="large-statement">
              “What must remain true even when several agents act at once?”
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
