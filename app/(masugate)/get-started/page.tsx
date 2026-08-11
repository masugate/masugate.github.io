import type { Metadata } from "next";
import Link from "next/link";
import { createMasuGatePageMetadata } from "../../data/metadata";
import styles from "./get-started.module.css";

export const metadata: Metadata = createMasuGatePageMetadata({
  title: "Get Started",
  description:
    "Prepare the supported local environment, then run and verify the MasuGate five-minute reference demonstration.",
});

const demoCommand = `. /tmp/masugate-reviewer-setup/reviewer.env
cd "$MASUGATE_CANDIDATE_DIR"
test ! -e /tmp/masugate-five-minute-demo
"$MASUGATE_REVIEWER_PYTHON" scripts/run_reference_demos.py procurement \\
  --release-dir "$MASUGATE_RELEASE_VERIFICATION_RELEASE_DIR" \\
  --offline-npm-cache "$MASUGATE_OFFLINE_NPM_CACHE" \\
  --source-revision "$MASUGATE_SOURCE_REVISION" \\
  --source-date-epoch "$MASUGATE_SOURCE_DATE_EPOCH" \\
  --outdir /tmp/masugate-five-minute-demo`;

const verifyCommand = `"$MASUGATE_REVIEWER_PYTHON" scripts/verify-flagship-demo.py \\
  --outdir /tmp/masugate-five-minute-demo`;

const setupCommand = `test ! -e /tmp/masugate-reviewer-setup
python3 scripts/prepare-reference-demo.py \\
  --outdir /tmp/masugate-reviewer-setup`;

export default function GetStartedPage() {
  return (
    <main className="masugate-main" id="masugate-main">
      <section className={styles.hero}>
        <div className={`masugate-shell ${styles.heroGrid}`}>
          <div>
            <p className="masugate-eyebrow">Get Started</p>
            <h1>Run the reference demo.</h1>
            <p className={styles.intro}>
              Prepare the supported local workspace once, then run a governed
              procurement scenario in under five minutes.
            </p>
            <a className="masugate-button masugate-button-primary" href="#run-demo">
              Go to the demo command
            </a>
          </div>
          <aside className={styles.summary} aria-label="Quick-start summary">
            <span>Two steps</span>
            <ol>
              <li>Prepare the local release workspace.</li>
              <li>Run and verify the procurement scenario.</li>
            </ol>
            <p>No credentials are needed for the required local demonstration.</p>
          </aside>
        </div>
      </section>

      <section className={styles.section} id="requirements">
        <div className="masugate-shell">
          <div className={styles.sectionHeading}>
            <p className="masugate-eyebrow">1 · Prepare once</p>
            <h2>Set up the local workspace.</h2>
            <p>
              The one-time setup creates a pinned release workspace and offline
              demo cache. It can take up to 15 minutes; the demonstration below
              is the short repeatable run.
            </p>
          </div>
          <div className={styles.requirementGrid}>
            <article>
              <span>Environment</span>
              <h3>Linux/amd64 with CPython 3.12</h3>
              <p>Use the supported host profile for the reference scenario.</p>
            </article>
            <article>
              <span>Local services</span>
              <h3>Docker and Compose</h3>
              <p>The demo starts a disposable local stack and removes it automatically.</p>
            </article>
            <article>
              <span>Workspace</span>
              <h3>About 8 GiB free</h3>
              <p>Keep the release checkout and one-time setup environment together.</p>
            </article>
          </div>
          <div className={styles.commandCard}>
            <div className={styles.commandLabel}>In a clean release checkout, prepare once</div>
            <pre><code>{setupCommand}</code></pre>
          </div>
          <details className={styles.setupDetails}>
            <summary>What the one-time setup provides</summary>
            <p>
              It writes <code>/tmp/masugate-reviewer-setup/reviewer.env</code>
              with a clean release workspace, offline npm cache, and reviewed
              Python environment. The demonstration below uses only those
              prepared inputs.
            </p>
          </details>
        </div>
      </section>

      <section className={styles.demoSection} id="run-demo">
        <div className="masugate-shell">
          <div className={styles.sectionHeading}>
            <p className="masugate-eyebrow">2 · Five-minute demonstration</p>
            <h2>Run one governed procurement action.</h2>
            <p>
              From the prepared release workspace, run this command exactly once.
              It writes evidence to a disposable directory under <code>/tmp</code>.
            </p>
          </div>
          <div className={styles.demoLayout}>
            <div className={styles.commandCard}>
              <div className={styles.commandLabel}>Run the scenario</div>
              <pre><code>{demoCommand}</code></pre>
            </div>
            <aside className={styles.resultCard}>
              <span>Expected result</span>
              <h3>A governed receipt and PSS-valid execution.</h3>
              <p>
                A successful run prints the procurement evidence path and exits
                with status zero. The output retains both the unsafe baseline and
                the governed comparison.
              </p>
            </aside>
          </div>
        </div>
      </section>

      <section className={styles.verifySection} id="verify-demo">
        <div className={`masugate-shell ${styles.verifyGrid}`}>
          <div>
            <p className="masugate-eyebrow">Verify</p>
            <h2>Check the generated evidence.</h2>
            <p>
              The verifier checks the expected observations and the demonstration
              duration without rerunning the scenario.
            </p>
          </div>
          <div className={styles.commandCard}>
            <div className={styles.commandLabel}>Verify the result</div>
            <pre><code>{verifyCommand}</code></pre>
          </div>
        </div>
      </section>

      <section className={styles.nextSection}>
        <div className={`masugate-shell ${styles.nextGrid}`}>
          <div>
            <p className="masugate-eyebrow">Next</p>
            <h2>See the same path in the OpenClaw walkthrough.</h2>
            <p>
              The interactive demo shows the request, policy, decision, effect,
              and receipt as the scenario grows.
            </p>
          </div>
          <div className={styles.nextActions}>
            <Link className="masugate-button masugate-button-primary" href="/demo/">
              Open the OpenClaw demo
            </Link>
            <Link className="masugate-button" href="/get-started/technical/">
              Open technical reference
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
