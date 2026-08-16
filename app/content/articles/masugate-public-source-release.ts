import type { PublishedArticle } from "../../data/article-types";

export const masugatePublicSourceRelease = {
  status: "published",
  publicationType: "announcement",
  showInBanner: true,
  slug: "masugate-public-source-release",
  href: "/blog/masugate-public-source-release/",
  title: "MasuGate Is Now Public: From Research Prototype to Product-Oriented Release",
  summary:
    "The MasuGate 0.1.0 research-preview source is open: a product-oriented implementation of the ideas developed in our stateful-governance paper, with concrete paths into today’s agent frameworks.",
  audience:
    "Agent-framework developers, systems researchers, technical leaders, and artifact reviewers",
  publishedAt: "2026-08-16",
  labels: ["Public source release", "Research to engineering", "Agent integrations"],
  readingMinutes: 4,
  relatedReleaseId: "MasuGate 0.1.0 · public-source research preview",
  relatedSourceRevision: "arXiv:2608.02764v2 · 10 August 2026",
  evidence: {
    status: "reference",
    sourceKind: "candidate-manifest",
    locator: "github.com/masugate/masugate · 0.1.0 research-preview source tree",
    note: "This announcement describes the public source, checked-in release controls, documentation, and exact integration profiles. It does not claim an independently verified package-registry release or general production assurance.",
  },
  limitations: [
    "This is a public-source research preview, not a general compliance product or a compatibility promise for unlisted framework versions.",
    "The repository publishes source and exact artifact profiles; a tagged GitHub release and package-registry distributions are not claimed here.",
    "The paper’s model and prototype evidence explain the technique, while the released repository has its own documented implementation and support boundaries.",
  ],
  citations: [
    {
      id: "masugate-paper",
      title: "Stateful Governance for Concurrent Agentic Systems",
      publisher: "arXiv:2608.02764v2",
      href: "https://arxiv.org/abs/2608.02764",
      note: "The in-depth technical account of MasuGate’s stateful-governance model and research prototype.",
    },
    {
      id: "masugate-repository",
      title: "MasuGate public source repository",
      publisher: "GitHub",
      href: "https://github.com/masugate/masugate",
      note: "The product-oriented 0.1.0 research-preview implementation, documentation, tests, and release artifacts.",
    },
    {
      id: "framework-adapters",
      title: "MasuGate framework-adapter support boundary",
      publisher: "MasuGate repository documentation",
      href: "https://github.com/masugate/masugate/blob/main/docs/framework-adapters.md",
      note: "Exact framework versions, generated tool surfaces, and trusted-context requirements for the included adapters.",
    },
    {
      id: "release-descriptor",
      title: "MasuGate reference-release descriptor",
      publisher: "MasuGate repository",
      href: "https://github.com/masugate/masugate/blob/main/release/reference-release.json",
      note: "The machine-readable reference profile for the research-preview artifact.",
    },
  ],
  sections: [
    {
      id: "the-gate-is-open",
      eyebrow: "01 · Public source release",
      title: "The gate is open.",
      blocks: [
        {
          kind: "paragraph",
          text: "Today we are opening the MasuGate 0.1.0 research-preview repository. It is the first public source release that brings the project’s central idea—keeping a policy decision valid across a consequential agent action—into an implementation that developers can inspect, test, extend, and connect to existing agent systems.",
          citationIds: ["masugate-repository"],
        },
        {
          kind: "paragraph",
          text: "Concurrent agents make governance a systems problem. Two requests can each look acceptable against the same snapshot and still produce an unacceptable combined outcome. MasuGate puts policy evaluation, declared shared state, coordination, the provider effect, and an operation record on one governed path. The release makes that path concrete without hiding the research-preview boundary.",
          citationIds: ["masugate-paper"],
        },
        {
          kind: "callout",
          label: "Why release now",
          text: "The research idea is strongest when people can trace it through real interfaces: from a framework tool call, through policy and coordination, to a committed, denied, or pending outcome with a receipt.",
          tone: "note",
        },
      ],
    },
    {
      id: "paper-and-release",
      eyebrow: "02 · One idea, two artifacts",
      title: "The paper explains the technique. The repository engineers the path.",
      blocks: [
        {
          kind: "comparison",
          items: [
            {
              label: "The paper",
              title: "Go deep on the systems model",
              description:
                "Stateful Governance for Concurrent Agentic Systems develops the technical motivation, policy-state serializability model, design, and evaluation through a research prototype.",
            },
            {
              label: "The release",
              title: "Follow the idea through a usable system",
              description:
                "The public repository turns that foundation into typed protocols, deployable services, clients, adapters, tests, documentation, and reproducible release controls.",
            },
          ],
        },
        {
          kind: "paragraph",
          text: "They are deliberately complementary. Read the paper when you want the why, the formal lens, and the in-depth technique. Open the repository when you want to see where trust enters, how an action is declared, which state a policy reads, how the decision stays connected to the effect, and what evidence is retained afterward.",
          citationIds: ["masugate-paper", "masugate-repository"],
        },
        {
          kind: "diagram",
          variant: "governance-boundary",
          title: "A governed action remains one connected path",
          description:
            "A request moves through a versioned policy, declared state, scoped coordination, a protected provider effect, and an operation record.",
          caption:
            "The public implementation gives each boundary a concrete protocol or runtime surface; the paper explains why the boundaries matter.",
          source: {
            label: "Read the paper",
            href: "https://arxiv.org/abs/2608.02764",
          },
        },
      ],
    },
    {
      id: "product-oriented-shape",
      eyebrow: "03 · Beyond a research prototype",
      title: "Closer to a product-level engineering shape—without overclaiming maturity.",
      blocks: [
        {
          kind: "paragraph",
          text: "The released tree is designed for serious evaluation. It includes a service boundary that executes rather than merely checks, closed protocol schemas, typed Python and TypeScript clients, operation and connector packages, explicit outcome handling, receipts, and documentation that maps public claims back to source and evidence.",
          citationIds: ["masugate-repository", "release-descriptor"],
        },
        {
          kind: "list",
          items: [
            "A declared-action runtime that keeps authorization and execution connected.",
            "Coordination over declared policy state, with PSS history and inspectable outcomes.",
            "Reproducible demonstrations, adversarial cases, and release-control checks.",
            "A documented trust boundary for identities, retries, framework context, connectors, and providers.",
            "Exact version and environment profiles so support claims remain reviewable rather than implied.",
          ],
        },
        {
          kind: "callout",
          label: "The maturity line",
          text: "Product-oriented means the repository has been shaped for integration, operation, review, and repeatability. Research preview means its assurances remain bounded to the documented profiles; it is not a blanket production or compliance claim.",
          tone: "boundary",
        },
      ],
    },
    {
      id: "meet-agents-where-they-run",
      eyebrow: "04 · Framework connections",
      title: "Governance should meet agents where they already run.",
      blocks: [
        {
          kind: "paragraph",
          text: "The release includes concrete integration artifacts for LangChain and LangGraph, Microsoft Agent Framework, CrewAI, a stdio MCP gateway, and OpenClaw. It also includes typed clients for teams that want to integrate at the protocol boundary instead of adopting a framework adapter.",
          citationIds: ["framework-adapters"],
        },
        {
          kind: "paragraph",
          text: "These are not decorative examples. Each profile identifies the supported host version and the trusted context the host must supply. The adapters replace the consequential tool path with generated governed tools, so a model does not receive the original bypassable tool alongside its governed counterpart. That is where the research principle becomes an engineering constraint.",
          citationIds: ["framework-adapters"],
        },
        {
          kind: "callout",
          label: "Included profiles",
          text: "LangChain 1.3.14, LangGraph 1.2.9, Microsoft Agent Framework Core 1.12.0, CrewAI 1.15.6, stdio MCP, and OpenClaw 2026.7.1 are the exact documented targets—not a promise for every version or host configuration.",
          tone: "evidence",
          citationIds: ["framework-adapters"],
        },
      ],
    },
    {
      id: "choose-your-entry-point",
      eyebrow: "05 · Explore the release",
      title: "Choose your entry point—and tell us where the boundary bends.",
      blocks: [
        {
          kind: "paragraph",
          text: "Systems researchers can move from the paper’s model into the paper-to-code provenance map. Framework developers can inspect the adapter profile closest to their stack. Platform teams can start at the wire protocol, provider boundary, and receipt model. Reviewers can follow the reproducibility and claims documentation before interpreting any result.",
          citationIds: ["masugate-paper", "masugate-repository"],
        },
        {
          kind: "paragraph",
          text: "Most importantly, the public release makes the conversation testable. If an assumption is unclear, an integration boundary is too narrow, or an agent workflow exposes a path we have not governed well, open an issue. The next version should be shaped by concrete systems, concrete traces, and concrete failure modes—not by abstractions alone.",
          citationIds: ["masugate-repository"],
        },
        {
          kind: "callout",
          label: "Start with both",
          text: "Read the paper for the full technique. Explore the repository for the product-oriented implementation. The website now keeps both paths connected as MasuGate evolves.",
          tone: "note",
        },
      ],
    },
  ],
  relatedLinks: [
    {
      label: "Explore the release",
      title: "Open the MasuGate repository",
      description:
        "Inspect the runtime, clients, adapters, protocols, demonstrations, and evidence boundaries.",
      href: "https://github.com/masugate/masugate",
    },
    {
      label: "Read the research",
      title: "Stateful Governance for Concurrent Agentic Systems",
      description:
        "Go deeper into the technical model, policy-state serializability, design, and research prototype.",
      href: "https://arxiv.org/abs/2608.02764",
    },
    {
      label: "See it in context",
      title: "Return to the MasuGate website",
      description:
        "Explore the challenge, interactive scenario, technical boundary, and project resources.",
      href: "/",
    },
    {
      label: "Evaluate the artifact",
      title: "Open Get Started",
      description:
        "Review the exact environment, public source, documentation, and release limitations.",
      href: "/get-started/",
    },
  ],
} as const satisfies PublishedArticle;
