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
} as const satisfies HomepageContentContract;
