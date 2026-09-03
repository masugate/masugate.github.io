import { legacyRedirectPresentation } from "../data/legacy-routes";

export interface LegacyRedirectNoticeProps {
  destination: `/${string}`;
  reason: string;
}

export function createLegacyRedirectClientScript(
  destination: `/${string}`,
): string {
  const serializedDestination = JSON.stringify(destination).replaceAll(
    "<",
    "\\u003c",
  );

  return `(() => {
  const destination = new URL(${serializedDestination}, window.location.origin);
  destination.search = window.location.search;
  window.location.replace(
    destination.pathname + destination.search + destination.hash,
  );
})();`;
}

export function LegacyRedirectNotice({
  destination,
  reason,
}: LegacyRedirectNoticeProps) {
  return (
    <main className="masugate-main" id="masugate-main">
      <meta httpEquiv="refresh" content={`1;url=${destination}`} />
      <script
        dangerouslySetInnerHTML={{
          __html: createLegacyRedirectClientScript(destination),
        }}
      />
      <section className="masugate-page-hero">
        <div className="masugate-shell">
          <p className="masugate-eyebrow">
            {legacyRedirectPresentation.eyebrow}
          </p>
          <h1>{legacyRedirectPresentation.title}</h1>
          <p className="masugate-page-intro">{reason}</p>
          <p>{legacyRedirectPresentation.fallbackMessage}</p>
          <div className="masugate-actions">
            <a
              className="masugate-button masugate-button-primary"
              href={destination}
            >
              {legacyRedirectPresentation.actionLabel}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
