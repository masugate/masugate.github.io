import type { PublishedArticle } from "../../data/article-types";

export const whenTimeBecomesAgentPolicyArticle = {
  status: "published",
  publicationType: "article",
  showInBanner: false,
  slug: "when-time-becomes-agent-policy",
  href: "/blog/when-time-becomes-agent-policy/",
  title: "Approved at 5:05: When Time Becomes Part of an Agent Policy",
  summary:
    "Follow one vendor transfer from a simple business-hours rule through live revalidation, a shared 24-hour budget, reservations, and auditable time evidence.",
  audience:
    "Agent builders, product teams, policy owners, and technically curious readers",
  publishedAt: "2026-08-25",
  labels: ["Time-aware policy", "Delayed approval", "Shared state"],
  readingMinutes: 11,
  relatedReleaseId: "MasuGate 0.1.1 · research preview",
  evidence: {
    status: "reference",
    sourceKind: "candidate-manifest",
    locator:
      "MasuGate 0.1.1 research-preview source tree and docs/time-aware-policies.md",
    note: "This article explains current policy syntax, shipped provider contracts, tested transfer policy shapes, and clearly labeled extension designs. It does not promote the combined clocked-transfer composition or illustrative temporal views to a turnkey release claim.",
  },
  limitations: [
    "The shipped certified-time contracts and asynchronous PostgreSQL transfer path still require a compatible adapter and deployment composition before the combined examples become a turnkey reference profile.",
    "The repository now contains an experimental, opt-in event-history provider with three fixed transfer views: protected-attempt count, distinct receivers, and recent request-bound approval. It remains outside 0.1.1 and disabled by default; vendor freshness, arbitrary history.* views, a temporal-query language, automatic request/response ingestion, and sequence views remain future extensions.",
    "A live-window fact establishes truth at a protected evaluation point; it does not by itself prove that a database commit or remote completion occurred before closing.",
    "The current transfer reservation has a fixed one-hour entitlement and a proof bound to the configured 24-hour argument; its escrow counter requires a sound reset or rebase before claiming continuously sliding reservation semantics.",
  ],
  citations: [
    {
      id: "time-guide",
      title: "Time-Aware Policies in MasuGate",
      publisher: "MasuGate repository documentation",
      href: "https://github.com/masugate/masugate/blob/main/docs/time-aware-policies.md",
      note: "The detailed guide behind this article, including policy examples, provider obligations, implementation status, and exact temporal boundaries.",
    },
    {
      id: "masugate-repository",
      title: "MasuGate public source repository",
      publisher: "GitHub",
      href: "https://github.com/masugate/masugate",
      note: "Source for the policy language, certified-context contracts, PostgreSQL rolling-budget views, reservation path, tests, and PSS checker.",
    },
    {
      id: "event-history-provider",
      title: "Bounded Event History for Policy",
      publisher: "MasuGate repository documentation",
      href: "https://github.com/masugate/masugate/blob/main/docs/event-history-provider.md",
      note: "The exact experimental provider contracts, opt-in activation path, evidence model, and current limitations.",
    },
    {
      id: "masugate-paper",
      title: "Stateful Governance for Concurrent Agentic Systems",
      publisher: "arXiv:2608.02764",
      href: "https://arxiv.org/abs/2608.02764",
      note: "The in-depth model behind MasuGate’s treatment of mutable policy state, concurrent effects, delayed decisions, and policy-state serializability.",
    },
  ],
  sections: [
    {
      id: "five-minutes-before-close",
      eyebrow: "01 · One transfer, several clocks",
      title: "A $50 transfer is approved at 5:05. Should it run?",
      blocks: [
        {
          kind: "paragraph",
          text: "At 4:55 p.m., an agent asks to send $50 to a vendor. Transfers above $40 require a person to review them, so the operation waits. The reviewer approves at 5:05. The organization’s operating window closed at 5:00. Is the transfer still allowed?",
        },
        {
          kind: "paragraph",
          text: "The answer depends on what “during business hours” means. It might mean the request reached the service before closing. It might mean MasuGate admitted the operation into its protected decision path before closing. It might require the approval evaluation, the database commit, or even a remote provider’s completion to happen before closing. Those are five different rules.",
          citationIds: ["time-guide"],
        },
        {
          kind: "comparison",
          items: [
            {
              label: "4:55 · Admitted",
              title: "The governed operation starts in-window",
              description:
                "MasuGate has protected the shared state needed for the decision and certified the admission-time fact.",
            },
            {
              label: "4:55–5:05 · Waiting",
              title: "Pending is not permission",
              description:
                "A human can review the intent, but the transfer cannot bypass the governed resolution path.",
            },
            {
              label: "5:05 · Re-evaluated",
              title: "The live window is now closed",
              description:
                "Approval is one input; fresh policy state still decides whether the effect may proceed.",
            },
          ],
        },
        {
          kind: "callout",
          label: "The central idea",
          text: "Time is not one ambient value called “now.” It is a set of named, provider-owned facts whose meaning stays attached to the governed operation.",
          tone: "note",
        },
      ],
    },
    {
      id: "which-time-counts",
      eyebrow: "02 · Make the business meaning explicit",
      title: "The request can be on time while authorization is too late.",
      blocks: [
        {
          kind: "paragraph",
          text: "MasuGate uses certified inputs for small trusted facts. One fact records whether protected admission occurred inside the configured operating window. Another is refreshed for the protected authorization evaluation. The first is historical; the second can change while a request waits.",
          citationIds: ["time-guide", "masugate-repository"],
        },
        {
          kind: "paragraph",
          text: "A provider is the trusted component that owns an authoritative fact, resource, or effect boundary. A logical scope is the shared slice—such as one team’s budget—that related operations must coordinate over.",
        },
        {
          kind: "code",
          label: "Admission time and live authorization time",
          language: "MasuGate PVL",
          code: "policy transfer_live_window on transfer {\n  deny admitted_outside_window when\n    certified.request_time_window_open == false;\n  deny authorization_window_closed when\n    certified.live_resolution_window_open == false;\n  escalate high_value_review when args.amount_cents > 4000;\n  allow otherwise;\n}",
          note: "Amounts use cents, so 4000 means $40. The clock and timezone come from the provider contract, not from the agent.",
          contextLink: {
            label: "Read the complete time-aware policy guide",
            href: "https://github.com/masugate/masugate/blob/main/docs/time-aware-policies.md",
          },
        },
        {
          kind: "paragraph",
          text: "Read the policy from top to bottom. A transfer admitted outside the window is denied. An operation whose live authorization evaluation occurs after closing is also denied. Only after those checks does a high-value request enter review. When the reviewer responds, resolution returns through MasuGate and refreshes the live fact.",
        },
        {
          kind: "paragraph",
          text: "Protected admission is not network arrival. In the reference path, MasuGate establishes the admission-time anchor after protecting the shared state needed for the decision. Queue or lock wait can move that anchor past closing. This keeps the clock meaning honest instead of letting a client-supplied timestamp control the outcome.",
          citationIds: ["time-guide"],
        },
      ],
    },
    {
      id: "shared-twenty-four-hours",
      eyebrow: "03 · Time can also describe shared history",
      title: "“The last 24 hours” is policy state, not just clock arithmetic.",
      blocks: [
        {
          kind: "paragraph",
          text: "Now give the team a $1,000 limit over committed transfers in the provider’s rolling 24-hour window. The policy needs the current account balance, the team’s retained transfer history, a trusted evaluation anchor, and a clear definition of which events count.",
        },
        {
          kind: "code",
          label: "Current balance plus rolling team spend",
          language: "MasuGate PVL",
          code: "policy transfer_rolling_budget on transfer {\n  deny insufficient_funds when\n    accounts.balance(principal.id) < args.amount_cents;\n  deny daily_team_budget when\n    ledger.sum_sent_by_team(principal.team, 24h)\n      + args.amount_cents > 100000;\n  allow otherwise;\n}",
          note: "The 24h token is a typed Duration. This reference view counts committed provider effects, not every attempted request.",
          contextLink: {
            label: "Inspect the PostgreSQL provider",
            href: "https://github.com/masugate/masugate/blob/main/src/masugate/resources/postgres.py",
          },
        },
        {
          kind: "paragraph",
          text: "Suppose the team has already spent $990. Two agents concurrently request different $10 vendor transfers. Each fits if it reads the same old total. Together they would exceed the rule. MasuGate makes the team budget a shared logical scope, so both operations cannot spend the same last $10: one can commit at the limit, and the other must observe the updated state and deny.",
          citationIds: ["masugate-paper", "time-guide"],
        },
        {
          kind: "callout",
          label: "Name what the window counts",
          text: "Committed effects, attempts, reservations, and external settlements are different histories. A provider must name the event and update the matching policy scope; a duration literal alone cannot do that.",
          tone: "boundary",
        },
      ],
    },
    {
      id: "while-a-person-waits",
      eyebrow: "04 · Delayed decisions",
      title: "Human review forces a choice: revalidate current truth or reserve capacity.",
      blocks: [
        {
          kind: "paragraph",
          text: "A reviewer needs time. During that interval, the business window can close, the account balance can change, and another agent can consume the remaining team budget. MasuGate therefore treats pending as durable state, not as an allow token waiting to be redeemed.",
          citationIds: ["masugate-paper"],
        },
        {
          kind: "comparison",
          items: [
            {
              label: "Revalidate",
              title: "Ask whether the action is still allowed",
              description:
                "Reacquire the relevant scopes, refresh volatile facts, and evaluate current balance and budget. Approval can still end in denial.",
            },
            {
              label: "Reserve",
              title: "Preserve one narrow resource",
              description:
                "Hold scarce capacity while review waits, like holding a seat. The reservation is visible to competing operations but is not blanket permission.",
            },
          ],
        },
        {
          kind: "paragraph",
          text: "Revalidation favors current truth and leaves capacity available to other work. Reservation gives the reviewer a stronger expectation about one admitted capacity predicate. Approved transfer resolution must validate and consume the live entitlement before applying the database transfer in the same locked transaction. Rejection releases it; provider expiry processing releases stale capacity; and late resolution fails closed.",
          citationIds: ["time-guide", "masugate-repository"],
        },
        {
          kind: "callout",
          label: "Current reference boundary",
          text: "The transfer reservation is a narrow proof tied to the configured 24-hour argument, proof identity, and provider configuration. Its entitlement lasts one hour. The current escrow counter does not automatically decay as old transfers age out, so continuously sliding reservation semantics require a sound reset or rebase.",
          tone: "evidence",
          citationIds: ["time-guide"],
        },
      ],
    },
    {
      id: "richer-time-concepts",
      eyebrow: "05 · Provider-owned event history",
      title: "Freshness, cooldowns, and request-bound approval can share the same policy story.",
      blocks: [
        {
          kind: "paragraph",
          text: "The policy language does not need to hand every rule an unrestricted clock. A provider can expose bounded temporal views with typed duration arguments. In the vendor-transfer story, a deployment could require a fresh vendor assessment, reject a recent duplicate to the same vendor, and require a still-valid approval bound to the exact high-value request.",
          citationIds: ["time-guide"],
        },
        {
          kind: "paragraph",
          text: "Some policies need to ask what happened before this request: Was this exact transfer approved recently? How many protected attempts came from this team? How much money actually settled? The repository now includes an experimental, opt-in event-history provider that authenticates and retains protected lifecycle events, then exposes three fixed, typed, scoped, and versioned answers: transfer-attempt count, distinct transfer receivers, and recent approval bound to the exact request. It is disabled by default and remains outside the 0.1.1 release boundary.",
          citationIds: ["time-guide", "event-history-provider"],
        },
        {
          kind: "list",
          items: [
            "Freshness — vendor.assessment_fresh(receiver, 5m): is the authoritative vendor assessment recent enough?",
            "Matching prerequisite — history.recent_bound_approval(principal.id, request.digest, 30m): did approval for this exact transfer occur recently enough?",
            "Recent count — history.transfer_attempt_count(team, 10m): how many protected attempts occurred in the window?",
            "Distinct count — history.distinct_transfer_receivers(team, 24h): how many different vendors were involved?",
            "Rolling sum — ledger.sum_sent_by_team(team, 24h): how much actually committed?",
            "Sequence condition — history.vendor_reviewed_since_change(receiver, 30d): did the required review happen after the vendor record last changed within the retained window?",
          ],
        },
        {
          kind: "paragraph",
          text: "These views turn a potentially large event log into small policy questions. Their names alone do not define the answer: the provider must say whether denied attempts count, whether the current event is included, how retries are deduplicated, which clock and scope apply, and which lifecycle transition updates the history. One-use approval must be consumed from the same approval scope in the protected transaction that relies on it, or through a provider-bound entitlement protocol. The three named history views above are implemented as an experimental opt-in provider, not as part of 0.1.1, and remain disabled by default. vendor.assessment_fresh(...), arbitrary history.* contracts, a temporal-query language, automatic request/response ingestion, and the sequence view remain future extensions; ledger.sum_sent_by_team(team, 24h) remains the separate current reference view.",
          citationIds: ["event-history-provider", "time-guide"],
        },
        {
          kind: "callout",
          label: "No automatic distributed transaction",
          text: "State that must change atomically needs one sound coordination domain. A policy can declare a strong requirement; MasuGate does not manufacture atomicity across unrelated services that cannot protect or validate it.",
          tone: "boundary",
        },
      ],
    },
    {
      id: "what-a-deadline-proves",
      eyebrow: "06 · Be precise about deadlines",
      title: "A fact observed before closing is not proof that every later step finished before closing.",
      blocks: [
        {
          kind: "paragraph",
          text: "The live-window fact answers whether the window was open at a protected authorization evaluation. A slow database transaction might commit later. A remote API might accept a request now and complete it minutes afterward. If the policy truly requires commit or remote completion before a deadline, the provider or connector must define and authoritatively observe that event.",
          citationIds: ["time-guide"],
        },
        {
          kind: "list",
          items: [
            "Admission deadline: bind the rule to protected admission, not network arrival.",
            "Authorization deadline: refresh a certified fact for the protected evaluation.",
            "Serialization or handoff deadline: bind the check and authority consumption at the named provider boundary.",
            "Completion deadline: require authoritative completion evidence from the system that performs the work.",
          ],
        },
        {
          kind: "paragraph",
          text: "The same care applies to expiry. Generic transfer revalidation has no automatic approval timeout. The transfer reservation has its own fixed one-hour entitlement. A separate spend.purchase profile defaults to a 600-second deadline for durably recording initial human approval. None of these statements means a remote purchase must finish inside the same interval.",
          citationIds: ["time-guide", "masugate-repository"],
        },
      ],
    },
    {
      id: "carry-the-clock-forward",
      eyebrow: "07 · Evidence after the decision",
      title: "A time-aware decision should carry its clock and history forward.",
      blocks: [
        {
          kind: "paragraph",
          text: "An operation record should preserve the protected admission and evaluation anchors, certified-input source and freshness, duration arguments, values and versions read, policy revision, decision, effect, and the causal links among reservation and settlement. Otherwise a later reviewer sees a timestamp without knowing which question it answered.",
          citationIds: ["time-guide"],
        },
        {
          kind: "paragraph",
          text: "Policy-State Serializability, or PSS, checks whether terminal decisions and visible coordination transitions fit a real-time-respecting serial explanation over the declared policy state. The structural checker does not interpret an evaluation timestamp or prove a wall-clock deadline. A provider-aware validator must replay what each recorded time predicate meant.",
          citationIds: ["masugate-paper", "time-guide"],
        },
        {
          kind: "callout",
          label: "What MasuGate adds to the clock",
          text: "The capability is not merely writing 24h in a rule. It is connecting authoritative time, shared state, delayed authority, concurrency, and the governed effect in one explicit, auditable path.",
          tone: "note",
        },
        {
          kind: "paragraph",
          text: "That brings us back to 5:05. The reviewer’s approval matters, but it does not erase the closing time, preserve an old balance, or mint reusable permission. MasuGate lets the policy say which temporal facts are historical, which must be refreshed, which capacity can be held, and what evidence must survive the outcome.",
        },
      ],
    },
  ],
  relatedLinks: [
    {
      label: "Read the full guide",
      title: "Time-Aware Policies in MasuGate",
      description:
        "See all six policy stages, implementation status, provider obligations, and the design checklist.",
      href: "https://github.com/masugate/masugate/blob/main/docs/time-aware-policies.md",
    },
    {
      label: "Continue the systems story",
      title: "When “Allowed” Goes Stale",
      description:
        "Understand why shared mutable state can invalidate a reasonable decision before its effect commits.",
      href: "/blog/when-allowed-goes-stale/",
    },
    {
      label: "Inspect bounded event history",
      title: "Experimental Event-History Provider",
      description:
        "Review its three fixed transfer views, opt-in activation, evidence, replay, and current limits.",
      href: "https://github.com/masugate/masugate/blob/main/docs/event-history-provider.md",
    },
    {
      label: "Inspect the implementation",
      title: "Open the MasuGate repository",
      description:
        "Explore the policy language, providers, coordination modes, tests, and evidence boundary.",
      href: "https://github.com/masugate/masugate",
    },
    {
      label: "See the governed path",
      title: "Open the interactive developer demo",
      description:
        "Follow a consequential action through policy, review, shared state, and its operation record.",
      href: "/demo/",
    },
  ],
} as const satisfies PublishedArticle;
