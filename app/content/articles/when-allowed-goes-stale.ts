import type { PublishedArticle } from "../../data/article-types";

export const whenAllowedGoesStaleArticle = {
  status: "published",
  publicationType: "article",
  showInBanner: false,
  slug: "when-allowed-goes-stale",
  href: "/blog/when-allowed-goes-stale/",
  title: "When “Allowed” Goes Stale: Why Concurrent Agents Need Stateful Governance",
  summary:
    "An accessible bridge from one shared-budget race to policy-state serializability, delayed approval, and the governed boundary between decision and effect.",
  audience:
    "Agent builders, product engineers, system architects, and technical governance readers",
  publishedAt: "2026-08-08",
  labels: ["Stateful governance", "Concurrency", "Research"],
  readingMinutes: 12,
  relatedSourceRevision: "arXiv:2608.02764v1 · 3 August 2026",
  evidence: {
    status: "reference",
    sourceKind: "research-paper",
    locator: "Stateful Governance for Concurrent Agentic Systems, arXiv:2608.02764v1",
    note: "The article summarizes the paper's model and controlled evaluation; this website has not promoted the results to release-backed Verified evidence.",
  },
  limitations: [
    "The reported workloads are controlled benchmarks and a scripted, LLM-free procurement workflow—not open-ended production deployment traces.",
    "The prototype evaluates one concrete PostgreSQL-backed policy-state provider; production use needs additional certified views, adapters, hardening, and operational review.",
    "Policy-state serializability depends on sound provider contracts, complete mediation of governed routes, and correct effect, reservation, idempotency, and recovery behavior.",
    "A general protected-execution protocol for external APIs that cannot join a database transaction remains future work in arXiv v1.",
  ],
  citations: [
    {
      id: "masugate-paper",
      title: "Stateful Governance for Concurrent Agentic Systems",
      publisher: "arXiv:2608.02764v1 · 3 August 2026",
      href: "https://arxiv.org/abs/2608.02764v1",
      note: "Canonical v1 record and primary source for the definitions, architecture, Figures 2–4, evaluation, assumptions, and limitations; arXiv also provides PDF and HTML full text.",
    },
  ],
  sections: [
    {
      id: "effects-change-the-problem",
      eyebrow: "01 · From answers to effects",
      title: "The hard governance problem begins after an agent can change the world.",
      blocks: [
        {
          kind: "paragraph",
          text: "An assistant that only drafts an answer can be reviewed at the interface. An agent that issues a refund, reserves inventory, provisions cloud capacity, changes a shared calendar, or initiates a purchase creates a durable effect. That effect can change the facts every other agent is using.",
          citationIds: ["masugate-paper"],
        },
        {
          kind: "paragraph",
          text: "A request-time policy decision may be entirely correct when it is made. The problem is that time passes between checking the rule and committing the effect. During that interval another operation can change a budget, quota, inventory balance, approval status, or risk signal that justified the decision.",
          citationIds: ["masugate-paper"],
        },
        {
          kind: "callout",
          label: "Stale authorization",
          text: "A system acts on an allow decision after the mutable policy state that justified it has changed.",
          tone: "boundary",
          citationIds: ["masugate-paper"],
        },
      ],
    },
    {
      id: "nine-of-ten",
      eyebrow: "02 · The smallest useful race",
      title: "Nine units are gone. Two agents each ask for the last one.",
      blocks: [
        {
          kind: "paragraph",
          text: "A team has a 10-unit rolling limit and has already consumed 9 units. Agent A proposes a 1-unit action. Agent B proposes another 1-unit action at nearly the same time. Each request fits if it is considered alone against the same old state: 9 + 1 is 10.",
        },
        {
          kind: "diagram",
          variant: "stale-budget",
          title: "One valid check, then another—but both use the same old state",
          description:
            "Without a protected decision-effect interval, both agents observe 9 of 10 units consumed, both receive allow, and both effects commit. With scoped coordination, the first effect moves the state to 10 before the second policy evaluation is allowed to decide.",
          caption:
            "Website-native adaptation of the running budget sequence in Figure 3 of the MasuGate paper. Values use the paper's 9-of-10 example.",
          source: {
            label: "MasuGate paper · Figure 3 · arXiv v1",
            href: "https://arxiv.org/abs/2608.02764v1",
          },
        },
        {
          kind: "paragraph",
          text: "The two application effects can even touch different records. Their hidden conflict is the mutable policy state: both consume the same team's remaining budget. If the system protects only the application writes, it can miss the dependency that matters to the rule.",
          citationIds: ["masugate-paper"],
        },
        {
          kind: "callout",
          label: "Mutable policy state",
          text: "Any changing fact that policy evaluation depends on—such as rolling spend, inventory, quota, holds, approval status, or risk allowance.",
          tone: "note",
        },
      ],
    },
    {
      id: "serial-explanation",
      eyebrow: "03 · A correctness target",
      title: "Policy-state serializability asks whether the completed history still has a valid explanation.",
      blocks: [
        {
          kind: "paragraph",
          text: "Policy-state serializability, or PSS, does not require every operation in the whole system to run one at a time. It requires the terminal governed operations to fit a real-time-respecting serial order in which every decision is evaluated against the policy state immediately before its position, every allowed operation applies its governed effect there, and every denied operation applies no effect.",
          citationIds: ["masugate-paper"],
        },
        {
          kind: "callout",
          label: "Technical note",
          text: "PSS is a property of terminal histories. Pending review is not an allow, and it is not a promise that the operation will eventually commit. At resolution, the operation must consume a valid reservation or be evaluated against current certified state.",
          tone: "evidence",
          citationIds: ["masugate-paper"],
        },
        {
          kind: "paragraph",
          text: "In the 9-of-10 example, a valid serial explanation commits one 1-unit effect and denies the other. A history that commits both cannot be explained by the policy: after either effect, the state is already 10, so the second request no longer fits.",
        },
      ],
    },
    {
      id: "the-governed-boundary",
      eyebrow: "04 · What the runtime connects",
      title: "The policy remains reviewable; the boundary preserves its meaning through effect commit.",
      blocks: [
        {
          kind: "paragraph",
          text: "MasuGate keeps the policy as a bounded program, then asks a provider contract to name the certified state views and logical scopes that the policy and effect may touch. The runtime protects the relevant scopes while it evaluates the policy and handles the result. The provider still owns the actual state and effect implementation.",
          citationIds: ["masugate-paper"],
        },
        {
          kind: "diagram",
          variant: "governance-boundary",
          title: "A decision stays connected to the state and effect it governs",
          description:
            "The request enters with trusted identity and typed arguments. The policy declares certified state dependencies. The provider resolves those dependencies to logical scopes. Coordination protects the policy evaluation and governed effect, and the operation record retains the linkage.",
          caption:
            "Conceptual adaptation of the MasuGate runtime boundary in Figure 4 of arXiv v1. It is not evidence of a particular framework adapter.",
          source: {
            label: "MasuGate paper · Figure 4 · arXiv v1",
            href: "https://arxiv.org/abs/2608.02764v1",
          },
        },
        {
          kind: "list",
          items: [
            "Reviewable policy program: declares the rule and the registered state it may inspect.",
            "Provider-certified state views: return policy-visible facts from the system that owns them.",
            "Logical scopes: name policy-state dependencies that overlapping operations must agree about.",
            "Scoped coordination: protects the decision-effect interval only where dependencies overlap.",
            "Provider-owned effect: performs the consequential action through the governed path.",
            "Governance record: connects request, policy revision, decision, state evidence, effect outcome, and final status.",
          ],
        },
        {
          kind: "callout",
          label: "Decision is not effect",
          text: "Allow is a policy result. Committed means the governed effect occurred. Keeping those meanings separate prevents a detached allow from becoming reusable permission outside the protected path.",
          tone: "boundary",
        },
      ],
    },
    {
      id: "delayed-approval",
      eyebrow: "05 · When a person needs time",
      title: "Approval can also go stale, so the system must reserve or revalidate.",
      blocks: [
        {
          kind: "paragraph",
          text: "Human review lengthens the same check-then-act interval. A request may be reasonable when it enters review, but another operation can consume the last capacity while the approver is deciding. The approval then reflects an old state rather than the state in which the effect would occur.",
          citationIds: ["masugate-paper"],
        },
        {
          kind: "comparison",
          items: [
            {
              label: "Revalidate",
              title: "Check current state at resolution",
              description:
                "Treat approval as one input to a fresh governed evaluation. The operation may still be denied if intervening work consumed the relevant capacity.",
            },
            {
              label: "Reserve",
              title: "Preserve capacity while review waits",
              description:
                "Atomically remove reserved capacity from what other operations can consume, then commit, release, or expire it through a governed lifecycle.",
            },
          ],
        },
        {
          kind: "paragraph",
          text: "Neither path turns a human click into a detached effect token. Revalidation may reject the operation after approval; a reservation is meaningful only if its provider contract prevents double consumption and handles cancellation, retries, and recovery correctly.",
          citationIds: ["masugate-paper"],
        },
      ],
    },
    {
      id: "what-the-paper-evaluated",
      eyebrow: "06 · Evidence, with its boundary",
      title: "The paper isolates stale authorization in controlled workloads.",
      blocks: [
        {
          kind: "paragraph",
          text: "In a PostgreSQL-backed prototype, arXiv v1 reports that the tested MasuGate transaction and reservation modes prevented stale authorizations in minimal and multiprocess shared-budget races while satisfying PSS. It also evaluates delayed approval, policy-evolution fixtures, and a scripted, LLM-free procurement workflow over shared budget and inventory state.",
          citationIds: ["masugate-paper"],
        },
        {
          kind: "callout",
          label: "Evidence status · Reference",
          text: "This article summarizes the authors' controlled results from arXiv:2608.02764v1. The website does not label them Verified because the canonical public release and retained website evidence gate are still pending.",
          tone: "evidence",
        },
        {
          kind: "paragraph",
          text: "The useful conclusion is narrow: the experiments exercise the policy-state conflict that request-local checks can miss and test whether the declared boundary preserves the policy under those workloads. They are not a general benchmark of agent quality, model intelligence, or production readiness.",
        },
      ],
    },
    {
      id: "assumptions-and-open-work",
      eyebrow: "07 · Assumptions and limits",
      title: "The guarantee is only as sound as the boundary around it.",
      blocks: [
        {
          kind: "paragraph",
          text: "The provider must return the promised policy-state facts, name every relevant logical dependency, apply effects consistently with visible outcomes, preserve reservations, and make retries safe. Governed routes must not be bypassed by an unmediated copy of the original consequential tool.",
          citationIds: ["masugate-paper"],
        },
        {
          kind: "paragraph",
          text: "The paper's prototype covers central execution paths with PostgreSQL-backed state, pending approval, reservations, scoped holds, and evaluation harnesses. It does not establish production deployment tooling, policy-bundle signing, a concrete dependency on every agent framework API, or the general protected-execution protocol needed by external APIs that cannot join a transaction.",
          citationIds: ["masugate-paper"],
        },
        {
          kind: "callout",
          label: "Where to go next",
          text: "Use the interactive Demo to inspect the request, policy, trace, and record shape. Use the paper for definitions, proofs, experiments, and the complete limitation discussion.",
          tone: "note",
        },
      ],
    },
  ],
  relatedLinks: [
    {
      label: "Read the companion",
      title: "Policy as Code, Not Prompt",
      description:
        "Review the policy-as-code benefits that MasuGate preserves before adding mutable state and concurrency.",
      href: "/blog/policy-as-code-not-prompt/",
    },
    {
      label: "Inspect the experience",
      title: "Open the OpenClaw developer demo",
      description:
        "Walk through one governed purchase, one budget across agents, and the artifacts behind each stage.",
      href: "/demo/",
    },
    {
      label: "Primary source",
      title: "Read arXiv:2608.02764v1",
      description:
        "Open the full paper for the formal model, architecture, experiments, assumptions, and limitations.",
      href: "https://arxiv.org/abs/2608.02764v1",
    },
  ],
} as const satisfies PublishedArticle;
