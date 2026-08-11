import type { PublishedArticle } from "../../data/article-types";

export const policyAsCodeNotPromptArticle = {
  status: "published",
  publicationType: "article",
  showInBanner: false,
  slug: "policy-as-code-not-prompt",
  href: "/blog/policy-as-code-not-prompt/",
  title: "Policy as Code, Not Prompt: A Practical Introduction",
  summary:
    "A practical guide to keeping consequential rules reviewable, testable, and independently maintainable—without confusing a policy decision with safe execution.",
  audience:
    "Developers, product engineers, policy owners, and technically curious readers",
  publishedAt: "2026-08-08",
  labels: ["Policy as code", "Policy language", "Governance design"],
  readingMinutes: 9,
  evidence: {
    status: "reference",
    sourceKind: "planning",
    locator: "planning/README.md §8.1 and the cited Cedar primary sources",
    note: "Conceptual guidance reviewed against the site claim boundaries; the example is not release syntax.",
  },
  limitations: [
    "The example is explanatory pseudocode, not copy-ready MasuGate syntax or an installation guide.",
    "Cedar establishes policy-as-code precedent; its proofs, performance, tooling maturity, and analysis guarantees do not transfer to MasuGate.",
    "A structured policy language alone does not keep mutable state current, coordinate concurrent operations, or execute a governed effect.",
  ],
  citations: [
    {
      id: "cedar-guide",
      title: "What is Cedar?",
      publisher: "Cedar Policy Language Reference Guide",
      href: "https://docs.cedarpolicy.com/",
      note: "Official guide for Cedar 4.5; describes separation from application code and human-readable policies.",
    },
    {
      id: "cedar-validation",
      title: "Policy validation against schema",
      publisher: "Cedar Policy Language Reference Guide",
      href: "https://docs.cedarpolicy.com/policies/validation.html",
      note: "Official description of schema-based validation and its stated limits.",
    },
    {
      id: "cedar-paper",
      title: "Cedar: A new language for expressive, fast, safe, and analyzable authorization",
      publisher: "Amazon Science",
      href: "https://www.amazon.science/publications/cedar-a-new-language-for-expressive-fast-safe-and-analyzable-authorization",
      note: "Primary publication describing Cedar's policy-language design and analysis goals.",
    },
    {
      id: "masugate-paper",
      title: "Stateful Governance for Concurrent Agentic Systems",
      publisher: "arXiv:2608.02764v1",
      href: "https://arxiv.org/abs/2608.02764v1",
      note: "Canonical source for MasuGate's policy-as-program and stateful-governance boundary.",
    },
  ],
  sections: [
    {
      id: "three-places-for-a-rule",
      eyebrow: "01 · Start with the separation",
      title: "The same sentence behaves differently in a prompt, in application code, and in a policy program.",
      blocks: [
        {
          kind: "paragraph",
          text: "Suppose an organization says: business purchases must stay inside the shared budget. Putting that sentence in an agent prompt can help the model plan and explain, but the instruction travels with one conversation. A different prompt, agent, or tool path can omit it, reinterpret it, or reach the effect without it.",
        },
        {
          kind: "paragraph",
          text: "An application check is stronger because trusted code can block an operation. But when each product team embeds a version of the rule in its own tool, review and change become a code-discovery problem: Which checks are active? Do they mean the same thing? Which deployment contains the latest requirement?",
        },
        {
          kind: "comparison",
          items: [
            {
              label: "Prompt guidance",
              title: "Helps one model reason",
              description:
                "Useful context for planning and explanation, but not an independent enforcement artifact.",
            },
            {
              label: "Application check",
              title: "Blocks one code path",
              description:
                "Runs in trusted code, but often couples the rule to one tool implementation and release cycle.",
            },
            {
              label: "Policy program",
              title: "Defines one reviewable rule",
              description:
                "A structured artifact that can be owned, tested, versioned, reused, and named in a decision record.",
            },
          ],
        },
        {
          kind: "callout",
          label: "The practical move",
          text: "Treat the rule as its own program and put its evaluation on the consequential action path. The goal is not more forceful prose; it is an independently governed artifact.",
          tone: "note",
        },
      ],
    },
    {
      id: "read-one-policy",
      eyebrow: "02 · Read one small policy",
      title: "A structured rule makes its inputs and outcomes inspectable.",
      blocks: [
        {
          kind: "code",
          label: "Conceptual policy — explanatory pseudocode",
          language: "Policy-shaped pseudocode",
          code: "for purchase:\n  deny if category is not business\n  deny if amount exceeds current business budget\n  otherwise allow",
          note: "This deliberately avoids release-shaped MasuGate syntax. It illustrates the rule's structure, not a command or API contract.",
          contextLink: {
            label: "Read why language alone is not the runtime boundary",
            href: "#language-boundary",
          },
        },
        {
          kind: "paragraph",
          text: "Read it from top to bottom. The policy names the governed action, checks a stable request fact, checks a policy-visible budget fact, and reaches an explicit default. A reviewer can ask whether a category is defined correctly, whether the budget view is the right one, and what happens when no denial applies.",
        },
        {
          kind: "paragraph",
          text: "Interpretability here does not mean letting a model improvise the rule from natural language. It means expressing the rule in a bounded, structured form whose evaluation can be inspected and whose inputs can be validated.",
        },
        {
          kind: "diagram",
          variant: "policy-separation",
          title: "One policy-management plane, one governed runtime path",
          description:
            "A policy owner authors and reviews a versioned program. The runtime evaluates that named revision for a governed request, while the provider remains responsible for the certified state view and effect.",
          caption:
            "Conceptual separation adapted from the policy-as-program discussion and Figure 2 of the MasuGate paper.",
          source: {
            label: "MasuGate paper · Figure 2 · arXiv v1",
            href: "https://arxiv.org/abs/2608.02764v1",
          },
        },
      ],
    },
    {
      id: "what-policy-as-code-buys",
      eyebrow: "03 · Established benefits",
      title: "Policy as code creates a lifecycle around the rule.",
      blocks: [
        {
          kind: "paragraph",
          text: "Once the policy is a first-class artifact, ownership can be separated from prompt authorship and tool implementation. A policy owner can propose a change; reviewers can inspect the exact diff; tests can exercise expected allows and denials; a deployment can select a named revision; and a record can say which revision produced a decision.",
        },
        {
          kind: "list",
          items: [
            "Independent ownership: the rule has an explicit maintainer and change path outside individual agent prompts.",
            "Interpretability: reviewers inspect a bounded program and its declared inputs instead of reconstructing intent from scattered code.",
            "Review and versioning: changes become diffs with authorship, approval, and rollback history.",
            "Testing and static checks: fixtures and schemas can catch mismatched names, types, or unsupported inputs before evaluation.",
            "Reuse: several applications can evaluate the same policy artifact instead of copying equivalent checks.",
            "Decision provenance: an operation record can retain the policy revision and the facts used for evaluation.",
          ],
        },
        {
          kind: "paragraph",
          text: "These are not new benefits invented by MasuGate. Cedar is an important precedent: its official material emphasizes keeping authorization policies separate from application code, using human-readable policies, validating them against schemas, and enabling analysis. MasuGate follows the broader policy-as-program pattern while addressing a different systems boundary.",
          citationIds: ["cedar-guide", "cedar-validation", "cedar-paper"],
        },
        {
          kind: "callout",
          label: "No guarantee transfer",
          text: "Cedar's formal results and performance measurements are properties of Cedar. Citing that precedent does not establish the same proofs, analysis completeness, tooling maturity, or safe defaults for MasuGate.",
          tone: "boundary",
          citationIds: ["cedar-paper"],
        },
      ],
    },
    {
      id: "policy-lifecycle",
      eyebrow: "04 · Operate the artifact",
      title: "A useful policy is maintained deliberately, not autonomously.",
      blocks: [
        {
          kind: "list",
          ordered: true,
          items: [
            "Author the requirement in a bounded policy language and name its owner.",
            "Review the rule, its declared inputs, and the effect it is intended to govern.",
            "Test expected decisions and run available static validation before promotion.",
            "Version the policy so decisions and later revisions remain distinguishable.",
            "Deploy a selected revision independently of conversational prompt changes.",
            "Observe decisions, governed outcomes, and records without treating an allow as proof that an effect occurred.",
            "Revise the policy through the same review path when the requirement evolves.",
          ],
        },
        {
          kind: "paragraph",
          text: "This is why independently maintainable is the right phrase. A policy does not safely rewrite, approve, test, or deploy itself. People and controlled automation maintain it through an explicit lifecycle.",
        },
      ],
    },
    {
      id: "language-boundary",
      eyebrow: "05 · Know the boundary",
      title: "Language makes the rule manageable. It does not keep changing state still.",
      blocks: [
        {
          kind: "paragraph",
          text: "The conceptual policy above asks for the current business budget. If several agents act at once, each evaluation may receive a reasonable value and still become obsolete before its purchase occurs. The language can declare the dependency, but language alone does not coordinate the underlying state or bind a decision to the later effect.",
          citationIds: ["masugate-paper"],
        },
        {
          kind: "callout",
          label: "The next systems question",
          text: "What changes when several agents rely on the same mutable policy state, and one agent's effect can invalidate another agent's decision?",
          tone: "evidence",
        },
      ],
    },
  ],
  relatedLinks: [
    {
      label: "Continue the series",
      title: "When “Allowed” Goes Stale",
      description:
        "See why a good policy decision can still fail under concurrent state change—and what the runtime must preserve.",
      href: "/blog/when-allowed-goes-stale/",
    },
    {
      label: "Apply the idea",
      title: "Open the developer demo",
      description:
        "Follow one policy as the OpenClaw scenario grows from a single purchase to shared-state coordination.",
      href: "/demo/",
    },
  ],
} as const satisfies PublishedArticle;
