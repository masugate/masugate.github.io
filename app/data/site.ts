export type Tone = "sage" | "coral" | "gold" | "slate";

export const useCases = [
  {
    number: "01",
    slug: "purchasing" as const,
    href: "/use-cases/purchasing/",
    title: "Purchasing and shared budgets",
    summary:
      "Coordinate shared budgets, approval thresholds, and purchase attempts across many agents.",
    status: "Reference implementation",
    tone: "sage" as Tone,
  },
  {
    number: "02",
    slug: "calendar" as const,
    href: "/use-cases/calendar/",
    title: "Calendar and scheduling",
    summary:
      "Govern event creation and cancellation on a shared organizational calendar.",
    status: "Reference example",
    tone: "gold" as Tone,
  },
  {
    number: "03",
    slug: "workspace" as const,
    href: "/use-cases/workspace/",
    title: "Files and workspaces",
    summary:
      "Control where agents can write, replace, and remove shared work products.",
    status: "Reference pattern",
    tone: "coral" as Tone,
  },
  {
    number: "04",
    slug: "business-controls" as const,
    href: "/use-cases/business-controls/",
    title: "Business controls",
    summary:
      "Apply approved restrictions around data, destinations, counterparties, and operating conditions.",
    status: "Reference policy patterns",
    tone: "slate" as Tone,
  },
];

export const frameworkIntegrations = [
  {
    slug: "openclaw" as const,
    name: "OpenClaw",
    logo: "/logos/openclaw.svg",
    status: "Reference deployment",
    tone: "sage" as Tone,
    detail:
      "A bounded fleet profile for governed tools, approval, identity, and recovery.",
    scenario: "A purchasing agent requests a $60 office-supply order.",
    pattern: "Pinned governed tool",
    language: "TypeScript",
    code: `routes: {
  purchase: {
    action: "spend.purchase",
    owner: {
      providerId: "spend-v1",
      position: "protected-external",
      connectorId: "purchase-v1"
    }
  }
}`,
    steps: [
      "OpenClaw calls sage_governed_action with the declared purchase route.",
      "The adapter derives agent, session, and tool-call identity from trusted host context.",
      "SAGE returns pending; native allow-once resolves the durable SAGE operation.",
      "The tool returns SAGE’s committed result without calling a second native effect.",
    ],
    boundary:
      "The reference deployment governs the declared SAGE-owned tools. Installing the plugin alone does not govern unrelated native tools.",
  },
  {
    slug: "langchain-langgraph" as const,
    name: "LangChain / LangGraph",
    logo: "/logos/langchain.svg",
    status: "Reference integration",
    tone: "gold" as Tone,
    detail:
      "Generated replacement tools keep the shared decision lifecycle with SAGE.",
    scenario: "A graph node selects a governed purchase tool during a procurement workflow.",
    pattern: "Replacement tool pattern",
    language: "Python",
    code: `result = await sage.execute(
  "spend.purchase",
  {"amount_cents": 6000},
  stable_id=tool_call_id,
  trace_id=run_trace,
)
return result`,
    steps: [
      "The model selects the SAGE-backed replacement tool exposed by the graph.",
      "The adapter binds the graph invocation to one stable governed operation.",
      "SAGE evaluates the shared policy state and returns committed, denied, or pending.",
      "The result becomes the tool message; the original effect tool is not called afterward.",
    ],
    boundary:
      "This reference pattern governs replacement tools configured for SAGE. It does not intercept arbitrary LangChain or LangGraph tools.",
  },
  {
    slug: "microsoft-agent-framework" as const,
    name: "Microsoft Agent Framework",
    logo: "/logos/microsoft-agent-framework-icon.png",
    status: "Reference integration",
    tone: "coral" as Tone,
    detail:
      "A pinned tool-replacement profile with deployment-owned identity.",
    scenario: "An operations agent invokes a typed purchase function backed by SAGE.",
    pattern: "Typed function wrapper",
    language: "Python",
    code: `result = await sage.execute(
  "spend.purchase",
  {"amount_cents": 6000},
  stable_id=invocation_id,
  trace_id=workflow_trace,
)
return result`,
    steps: [
      "The agent invokes the typed SAGE-backed purchase function.",
      "The wrapper binds deployment-owned identity and the host invocation identifier.",
      "SAGE owns the policy, pending, effect, and audit lifecycle.",
      "The framework receives the authoritative governed result as the function outcome.",
    ],
    boundary:
      "The reference integration covers configured replacement functions and their declared compatibility profile, not every framework capability.",
  },
  {
    slug: "crewai" as const,
    name: "CrewAI",
    logo: "/logos/crewai.png",
    status: "Reference integration",
    tone: "slate" as Tone,
    detail:
      "Governed task tools with explicit replay and resume boundaries.",
    scenario: "A procurement task retries after the worker loses the first tool response.",
    pattern: "Governed task tool",
    language: "Python",
    code: `result = await sage.execute(
  "spend.purchase",
  {"amount_cents": 6000},
  stable_id=f"{task_id}:{tool_call_id}",
  trace_id=crew_trace,
)
return result`,
    steps: [
      "A Crew task invokes the configured governed purchase tool.",
      "Task and tool-call identity select one stable SAGE operation.",
      "A retry resumes or replays that operation instead of creating an unbound effect.",
      "The crew observes the existing authoritative result and continues the task.",
    ],
    boundary:
      "The reference pattern defines lifecycle handling for configured task tools. Crew orchestration and unrelated tools remain CrewAI-owned.",
  },
];
