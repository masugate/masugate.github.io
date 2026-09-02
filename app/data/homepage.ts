export interface HomepageContentContract {
  hero: Readonly<{
    eyebrow: string;
    title: string;
    lede: string;
    primaryAction: Readonly<{ label: string; href: "#shared-budget" }>;
    sourceActionLabel: string;
    diagram: Readonly<{
      liveLabel: string;
      motionControlLabel: string;
      title: string;
      description: string;
      scrollLabel: string;
      agentLabel: string;
      requestLabel: string;
      sharedStateLabel: string;
      budgetLabel: string;
      initialStateLabel: string;
      protectedStateLabel: string;
      firstOutcomeLabel: string;
      firstOutcomeDetail: string;
      secondOutcomeLabel: string;
      secondOutcomeDetail: string;
      committedStateLabel: string;
      caughtStateLabel: string;
      insufficientLabel: string;
      timelineLabels: readonly [string, string, string];
      caption: string;
    }>;
  }>;
  problem: Readonly<{
    eyebrow: string;
    title: string;
    independentDescription: string;
    governedDescription: string;
    outcomeLabels: Readonly<{
      independent: string;
      governed: string;
    }>;
    recordNote: string;
    action: Readonly<{ label: string; href: "/demo/" }>;
  }>;
  sharedState: Readonly<{
    eyebrow: string;
    title: string;
    items: readonly Readonly<{
      id: "capacity" | "time" | "work";
      label: string;
      caption: string;
    }>[];
  }>;
  mechanism: Readonly<{
    eyebrow: string;
    title: string;
    intro: string;
    figureKicker: string;
    figureTitle: string;
    boundaryLabel: string;
    steps: readonly [
      Readonly<{ label: string; detail: string }>,
      Readonly<{ label: string; detail: string }>,
      Readonly<{ label: string; detail: string }>,
    ];
    outcomesLabel: string;
    outcomes: readonly ["Committed", "Denied", "Pending"];
    scopeNote: string;
    recordNote: string;
  }>;
  proof: Readonly<{
    eyebrow: string;
    title: string;
    intro: string;
    items: readonly [
      Readonly<{
        id: "demo";
        title: string;
        description: string;
        status: string;
        actionLabel: string;
        detailsLabel: string;
        details: readonly [string, string];
      }>,
      Readonly<{
        id: "source";
        title: string;
        description: string;
        status: string;
        actionLabel: string;
        detailsLabel: string;
        details: readonly [string, string];
      }>,
      Readonly<{
        id: "paper";
        title: string;
        description: string;
        status: string;
        actionLabel: string;
        detailsLabel: string;
        details: readonly [string, string];
      }>,
    ];
  }>;
  closing: Readonly<{
    eyebrow: string;
    title: string;
    writingLabel: string;
    writingActionLabel: string;
    contactLabel: string;
    contactTitle: string;
    contactCopy: string;
    disclosureHint: string;
    teamLabel: string;
    publicationLabels: Readonly<{
      announcement: string;
      article: string;
    }>;
  }>;
}

export const homepageContent = {
  hero: {
    eyebrow: "Stateful governance for concurrent agents",
    title: "Many agents. One changing state.",
    lede:
      "MasuGate keeps each policy decision and its effect on one protected path, even when agents act at the same time.",
    primaryAction: {
      label: "See it happen",
      href: "#shared-budget",
    },
    sourceActionLabel: "GitHub",
    diagram: {
      liveLabel: "Concurrent path · live model",
      motionControlLabel: "Pause motion",
      title: "Two concurrent agents act on one changing budget",
      description:
        "Both agents read the same available budget. The first operation protects capacity; the later decision sees the lower balance and denies the overlapping request.",
      scrollLabel: "Concurrent budget diagram",
      agentLabel: "Agent",
      requestLabel: "Request",
      sharedStateLabel: "Shared state",
      budgetLabel: "budget",
      initialStateLabel: "Both agents read",
      protectedStateLabel: "Capacity protected",
      firstOutcomeLabel: "Escalate → commit",
      firstOutcomeDetail: "Capacity stays protected",
      secondOutcomeLabel: "Deny",
      secondOutcomeDetail: "The later request sees the lower balance.",
      committedStateLabel: "Committed",
      caughtStateLabel: "Request caught",
      insufficientLabel: "cannot cover",
      timelineLabels: ["Same read", "State moves", "Later decision updates"],
      caption:
        "One changing fact stays connected to both decisions and outcomes.",
    },
  },
  problem: {
    eyebrow: "The problem",
    title: "Both requests fit. Together, they do not.",
    independentDescription: "Both checks trust the same original observation.",
    governedDescription: "Protected capacity updates the later decision.",
    outcomeLabels: {
      independent: "Rule broken",
      governed: "Rule preserved",
    },
    recordNote: "Separate records retain the committed and denied operations.",
    action: {
      label: "Run the complete demo",
      href: "/demo/",
    },
  },
  sharedState: {
    eyebrow: "It is everywhere",
    title: "Shared state is more than a budget.",
    items: [
      {
        id: "capacity",
        label: "Capacity",
        caption: "Inventory, budgets, quotas, and service limits.",
      },
      {
        id: "time",
        label: "Time",
        caption: "Calendar commitments shared across assistants.",
      },
      {
        id: "work",
        label: "Work",
        caption: "Files and workspaces changed by many agents.",
      },
    ],
  },
  mechanism: {
    eyebrow: "How it works",
    title: "Keep the decision connected to the effect.",
    intro:
      "Request, live policy decision, and governed effect travel one protected path.",
    figureKicker: "One protected path",
    figureTitle: "Request → live decision → governed effect",
    boundaryLabel: "MasuGate protected path",
    steps: [
      {
        label: "Request",
        detail: "A selected consequential action enters.",
      },
      {
        label: "Policy decision",
        detail: "The rule reads live shared state.",
      },
      {
        label: "Governed effect",
        detail: "The provider returns one authoritative outcome.",
      },
    ],
    outcomesLabel: "Authoritative outcome",
    outcomes: ["Committed", "Denied", "Pending"],
    scopeNote:
      "MasuGate governs configured consequential routes; the host keeps orchestration and model behavior.",
    recordNote:
      "The receipt keeps the revision, state facts, decision, and outcome linked.",
  },
  proof: {
    eyebrow: "Inspect the project",
    title: "Try it. Read it. Check the evidence.",
    intro:
      "The demo, public source, and paper expose different layers of the same system.",
    items: [
      {
        id: "demo",
        title: "Interactive demo",
        description:
          "Watch overlapping actions resolve against one changing budget.",
        status: "Simulated · Reference",
        actionLabel: "Run the demo",
        detailsLabel: "Integration boundary",
        details: [
          "OpenClaw keeps orchestration; selected consequential calls cross the protected path.",
          "The reference scenario uses categorized-purchase@v2.",
        ],
      },
      {
        id: "source",
        title: "Public source",
        description:
          "Review the implementation, policy lifecycle, and validation path.",
        status: "Open source",
        actionLabel: "Browse GitHub",
        detailsLabel: "Review scope",
        details: [
          "Bounded policies read registered views: spend, capacity, approval, or risk.",
          "Reviewers inspect policy revisions and state facts.",
        ],
      },
      {
        id: "paper",
        title: "Research paper",
        description:
          "Inspect the formal model, assumptions, and controlled evaluation.",
        status: "Paper · v1",
        actionLabel: "Open the paper",
        detailsLabel: "Technical premise",
        details: [
          "The model is policy-state serializability under explicit policy, provider, and enforcement assumptions.",
          "Claims name premises, evaluation boundaries, and evidence paths.",
        ],
      },
    ],
  },
  closing: {
    eyebrow: "Continue",
    title: "Read the latest. Test your own scenario.",
    writingLabel: "Latest writing",
    writingActionLabel: "All posts",
    contactLabel: "Bring your system",
    contactTitle: "Request a customized demo.",
    contactCopy:
      "Tell us the action, policy, and shared state. We will scope it.",
    disclosureHint: "Opens a prepared email draft",
    teamLabel: "Project team",
    publicationLabels: {
      announcement: "Announcement",
      article: "Article",
    },
  },
} as const satisfies HomepageContentContract;
