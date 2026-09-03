import {
  type Availability,
  type ReferenceEvidence,
  type ScenarioStageId,
  available,
  unavailable,
} from "./contracts";
import {
  masugateSite,
  type SiteIdentityContract,
} from "./masugate-site";
import { masugateRelease } from "./release";

export type CandidateStageAlignment = "exact" | "related" | "none";

export interface CandidateStageCoverage {
  stageId: ScenarioStageId;
  stageLabel: string;
  alignment: CandidateStageAlignment;
  statusLabel: string;
  relationship: string;
  mismatch: string;
}

export interface CandidateEvidenceLane {
  id: "openclaw-host-roundtrip" | "concurrent-procurement";
  label: string;
  driver: string;
  sourceAssertions: readonly string[];
  boundary: string;
  gateLabel: string;
  capturedEvidence: Availability<never>;
}

export interface CandidatePromotionGate {
  id:
    | "git-candidate"
    | "static-controls"
    | "live-gate-contract"
    | "supported-runtime"
    | "retained-evidence"
    | "public-release"
    | "support-routes";
  status: "complete" | "pending";
  label: string;
  detail: string;
}

export interface OpenClawReferenceCandidate {
  id: "openclaw-reference-candidate";
  publication: "source-reference";
  releaseState: "source-public";
  maturity: "experimental";
  evidence: ReferenceEvidence;
  presentation: Readonly<{
    hero: Readonly<{
      intro: string;
      sourceBoundary: string;
      visibilityLabel: string;
      localRunBoundary: string;
    }>;
    identityDisclosure: Readonly<{
      eyebrow: string;
      title: string;
    }>;
    coverageDisclosure: Readonly<{
      eyebrow: string;
      title: string;
    }>;
  }>;
  identity: Readonly<{
    releaseId: "masugate-openclaw-reference/0.1.1";
    releaseChannel: "research-preview";
    repository: "https://github.com/masugate/masugate";
    defaultBranch: "main";
    originImplementationRevision: string;
    releaseTreeRevision: string;
    releaseTree: string;
    repositoryVisibility: "private" | "public";
    visibilityObservedAt: "2026-09-03";
    releaseTag: "not-published";
  }>;
  environment: Readonly<{
    os: "Linux";
    architecture: "amd64";
    python: "3.12";
    testedPython: "3.12.3";
    git: "2.43.0";
    node: "24.16.0";
    npm: "11.13.0";
    uv: "0.11.26";
    docker: "29.6.1";
    compose: "5.3.0";
    dockerRequired: true;
    composeRequired: true;
  }>;
  integration: Readonly<{
    host: "OpenClaw";
    hostVersion: "2026.7.1";
    adapterPackage: "@masugate/openclaw";
    adapterVersion: "0.1.1";
    referenceDistribution: "masugate-openclaw-reference";
    referenceDistributionVersion: "0.1.1";
    tool: "masugate_governed_action";
    route: "purchase";
    action: "spend.purchase";
    providerId: "masugate.spend.reference";
    executionPosition: "protected-external";
    connectorId: "reference-purchase-v1";
    policyId: "spend_budget_guard";
    policyVersion: "1.0.0";
    policyDigest: string;
    configurationDigest: string;
    agentId: "buyer-alpha";
    principalId: "openclaw:buyer-alpha";
    credentialEnvironment: "MASUGATE_BUYER_ALPHA_TOKEN";
  }>;
  configurationExcerpt: string;
  policySource: string;
  policyBoundary: string;
  providerView: Readonly<{
    name: "spend.available_cents";
    signature: "spend.available_cents(String) -> Int";
    owner: "spend";
    consistency: "scoped-policy-state";
    maximumLatencyMs: 100;
    bounded: true;
    scopeTemplate: "spend:team:<team>";
    reservationKind: "unsupported";
  }>;
  identityBoundary: string;
  replacementBoundary: string;
  sourceAudit: typeof masugateRelease.sourceAudit;
  evidenceLanes: readonly CandidateEvidenceLane[];
  stageCoverage: readonly CandidateStageCoverage[];
  promotionGates: readonly CandidatePromotionGate[];
  publicSource: Availability<Readonly<{ href: `https://${string}` }>>;
  publicInstructions: Availability<Readonly<{ href: `https://${string}` }>>;
  cleanCheckout: Availability<Readonly<{ href: `https://${string}` }>>;
  capturedRun: Availability<never>;
  verification: Availability<never>;
  cta: Readonly<{
    primary: Readonly<{ label: string; href: "/demo/" }>;
    secondary: Readonly<{ label: string; href: "/#contact" }>;
  }>;
}

function pending(
  reason: Parameters<typeof unavailable>[0],
  note: string,
): Availability<never> {
  return unavailable(reason, note);
}

const sourceRepositoryContract: SiteIdentityContract["sourceRepository"] =
  masugateSite.sourceRepository;

const supportRoutesPromotionGate: CandidatePromotionGate =
  sourceRepositoryContract.state === "available"
    ? {
        id: "support-routes",
        status: "complete",
        label: "Keep public support routes active",
        detail:
          "The public source exposes its issue tracker, review path, and SECURITY.md route. This does not imply a tagged or registry release.",
      }
    : {
        id: "support-routes",
        status: "pending",
        label: "Enable public support routes",
        detail:
          "Publish an issue tracker and security-policy route before marking support routing complete.",
      };

export const openClawReferenceCandidate = {
  id: "openclaw-reference-candidate",
  publication: "source-reference",
  releaseState: "source-public",
  maturity: "experimental",
  evidence: {
    status: "reference",
    sourceKind: "candidate-manifest",
    locator:
      "https://github.com/masugate/masugate/blob/main/release/reference-release.json",
    note:
      "The exact 0.1.1 descriptor and local runbook are public source. The website simulation is not captured runtime evidence, and no registry or tagged release is claimed.",
  },
  presentation: {
    hero: {
      intro:
        "Inspect the OpenClaw 2026.7.1 boundary declared by the MasuGate 0.1.1 public-source research preview without treating the website simulation as recorded execution.",
      sourceBoundary:
        "The source, descriptor, integration guide, and source-based runbook are public. The mutable main branch is not a v0.1.1 tag or package-registry release, and no independent retained run is claimed.",
      visibilityLabel: "Repository visibility observed on",
      localRunBoundary:
        "Run the credential-free procurement reference from source; do not substitute a registry install or infer production support.",
    },
    identityDisclosure: {
      eyebrow: "Public-source reference detail",
      title: "Environment, source lineage, and distribution state",
    },
    coverageDisclosure: {
      eyebrow: "Relationship to the three-stage walkthrough",
      title: "Related to the walkthrough, but not the same evidence.",
    },
  },
  identity: {
    releaseId: "masugate-openclaw-reference/0.1.1",
    releaseChannel: "research-preview",
    repository: masugateRelease.candidateSource.repository,
    defaultBranch: masugateRelease.candidateSource.defaultBranch,
    originImplementationRevision:
      masugateRelease.candidateSource.originSourceRevision,
    releaseTreeRevision:
      masugateRelease.candidateSource.releaseTreeRevision,
    releaseTree: masugateRelease.candidateSource.releaseTree,
    repositoryVisibility: "public",
    visibilityObservedAt: "2026-09-03",
    releaseTag: "not-published",
  },
  environment: {
    os: "Linux",
    architecture: "amd64",
    python: "3.12",
    testedPython: "3.12.3",
    git: "2.43.0",
    node: "24.16.0",
    npm: "11.13.0",
    uv: "0.11.26",
    docker: "29.6.1",
    compose: "5.3.0",
    dockerRequired: true,
    composeRequired: true,
  },
  integration: {
    host: "OpenClaw",
    hostVersion: "2026.7.1",
    adapterPackage: "@masugate/openclaw",
    adapterVersion: "0.1.1",
    referenceDistribution: "masugate-openclaw-reference",
    referenceDistributionVersion: "0.1.1",
    tool: "masugate_governed_action",
    route: "purchase",
    action: "spend.purchase",
    providerId: "masugate.spend.reference",
    executionPosition: "protected-external",
    connectorId: "reference-purchase-v1",
    policyId: "spend_budget_guard",
    policyVersion: "1.0.0",
    policyDigest:
      "5c072d7dbd39c0b274cfd9d078ed149536639c42c4ebefa802653b7693b16094",
    configurationDigest:
      "2675d08a41756224ab7fc1b15cdb5f43e724aac1eda4ecd3674ef5da35d914fc",
    agentId: "buyer-alpha",
    principalId: "openclaw:buyer-alpha",
    credentialEnvironment: "MASUGATE_BUYER_ALPHA_TOKEN",
  },
  configurationExcerpt: `{
  "masugatedBaseUrl": "http://masugated:8000",
  "agents": {
    "buyer-alpha": "MASUGATE_BUYER_ALPHA_TOKEN"
  },
  "routes": {
    "purchase": {
      "action": "spend.purchase",
      "arguments": {
        "amount_cents": "integer",
        "merchant_id": "string",
        "request_ref": "string"
      },
      "owner": {
        "providerId": "masugate.spend.reference",
        "position": "protected-external",
        "connectorId": "reference-purchase-v1"
      }
    }
  }
}`,
  policySource: `policy spend_budget_guard on spend.purchase {
  deny budget_cap when args.amount_cents > spend.available_cents(principal.team);
  escalate ask_first when args.amount_cents >= 500;
  allow otherwise;
}`,
  policyBoundary:
    "The 500-cent ask-first threshold belongs to this bounded reference deployment. It is not a universal spending rule, and the reference policy does not establish merchant, tax, fraud, or legal validity.",
  providerView: {
    name: "spend.available_cents",
    signature: "spend.available_cents(String) -> Int",
    owner: "spend",
    consistency: "scoped-policy-state",
    maximumLatencyMs: 100,
    bounded: true,
    scopeTemplate: "spend:team:<team>",
    reservationKind: "unsupported",
  },
  identityBoundary:
    "The adapter derives openclaw:<agentId> and a SHA-256 stable identity from trusted agent ID, canonical session key, live session ID, and tool-call ID. Model arguments cannot supply those fields.",
  replacementBoundary:
    "The configured MasuGate tool returns the authoritative committed, denied, or pending result. It does not call a second native purchase effect afterward, and it does not govern unrelated OpenClaw tools.",
  sourceAudit: masugateRelease.sourceAudit,
  evidenceLanes: [
    {
      id: "openclaw-host-roundtrip",
      label: "Pinned OpenClaw host round trip",
      driver: "OpenClaw 2026.7.1 agent harness and @masugate/openclaw 0.1.1",
      sourceAssertions: [
        "$1 purchase commits and an identical tool call replays the same operation",
        "$6 purchase returns a durable pending result",
        "Two concurrent $2.50 calls produce one committed and one denied result",
        "The committed audit contains a succeeded protected-execution receipt",
      ],
      boundary:
        "The public source contains this integration gate with PostgreSQL MasuGate state and a SQLite purchase-effect fixture. This website does not present a retained execution of that gate.",
      gateLabel:
        "Pinned-host integration gate (PostgreSQL MasuGate state; SQLite effect fixture)",
      capturedEvidence: pending(
        "public-evidence-unavailable",
        "No independently retained host-roundtrip output is published by this website.",
      ),
    },
    {
      id: "concurrent-procurement",
      label: "Clean-artifact concurrent procurement workload",
      driver: "Credential-free MasuGate service workload inside the reference stack",
      sourceAssertions: [
        "Two $60 requests compete for one $100 budget",
        "One request becomes pending while the other is denied against protected capacity",
        "Allow-once resolves the pending operation to one committed effect",
        "The verifier checks policy-state serializability (PSS): whether terminal decisions and effects retain a valid, real-time-respecting serial explanation over declared policy state",
      ],
      boundary:
        "This workload matches the Stage 2 arithmetic, but it drives masugated directly rather than an OpenClaw conversation and uses different identifiers and policy artifacts.",
      gateLabel: "Five-minute procurement and flagship-verifier gates",
      capturedEvidence: pending(
        "public-evidence-unavailable",
        "The public runbook generates local evidence; this website does not claim an independently retained public run.",
      ),
    },
  ],
  stageCoverage: [
    {
      stageId: "stage-1",
      stageLabel: "One governed purchase",
      alignment: "related",
      statusLabel: "Related source path",
      relationship:
        "The pinned host gate encodes test cases for a governed purchase, replay, pending result, and receipt.",
      mismatch:
        "The website uses a $40 Work Manager request and categorized-purchase@v1; the source reference uses buyer-alpha, spend_budget_guard@1.0.0, and different amounts.",
    },
    {
      stageId: "stage-2",
      stageLabel: "One budget across agents",
      alignment: "related",
      statusLabel: "Related workload",
      relationship:
        "The clean-artifact workload uses the same $60 + $60 against $100 concurrency and approval shape.",
      mismatch:
        "Its runner drives masugated directly, not an OpenClaw chat or tool turn, and its agent, route, and policy identifiers differ from the website fixture.",
    },
    {
      stageId: "stage-3",
      stageLabel: "More governed operations",
      alignment: "none",
      statusLabel: "Simulation only",
      relationship:
        "The public source contains calendar and filesystem components and narrower reference checks.",
      mismatch:
        "No credential-free OpenClaw gate reproduces the website's overlap policy, fixed alternative, itinerary, and protected-file story.",
    },
  ],
  promotionGates: [
    {
      id: "git-candidate",
      status: "complete",
      label: "Publish the 0.1.1 source reference",
      detail:
        "The repository, release descriptor, package catalog, and OpenClaw integration guide are publicly inspectable.",
    },
    {
      id: "static-controls",
      status: "complete",
      label: "Publish the source-level controls",
      detail:
        "The public tree includes documentation checks, exact version pins, locks, and the 0.1.1 descriptor.",
    },
    {
      id: "live-gate-contract",
      status: "complete",
      label: "Publish the source-based run contract",
      detail:
        "The exact setup, procurement run, verifier, expected output, and cleanup steps are documented for the Linux/amd64 profile.",
    },
    {
      id: "supported-runtime",
      status: "complete",
      label: "Expose the local reference workflow",
      detail:
        "The source-owned workflow builds the exact local artifacts and runs the credential-free procurement demonstration with its supplied verifier.",
    },
    {
      id: "retained-evidence",
      status: "pending",
      label: "Retain dated runtime evidence",
      detail:
        "Publish the request, decision, governed effect, record, verifier result, exact revisions, and verification date as one evidence bundle.",
    },
    {
      id: "public-release",
      status: "pending",
      label: "Publish an immutable distribution",
      detail:
        "A v0.1.1 tag, GitHub Release, and PyPI/npm packages do not exist yet. Do not present the source channel as those distribution forms.",
    },
    supportRoutesPromotionGate,
  ],
  publicSource: available({ href: "https://github.com/masugate/masugate" }),
  publicInstructions: available({
    href: "https://github.com/masugate/masugate#five-minute-local-demonstration",
  }),
  cleanCheckout: available({
    href: "https://github.com/masugate/masugate/blob/main/docs/artifact-evaluation.md#exact-one-time-setup",
  }),
  capturedRun: pending(
    "public-evidence-unavailable",
    "Generated procurement and OpenClaw evidence outputs are absent from the review bundle.",
  ),
  verification: pending(
    "verification-pending",
    "No supported-environment runtime verification date and retained evidence are available.",
  ),
  cta: {
    primary: { label: "Return to the interactive walkthrough", href: "/demo/" },
    secondary: { label: "Request a customized demo", href: "/#contact" },
  },
} as const satisfies OpenClawReferenceCandidate;

export function validateOpenClawReferenceCandidate(
  candidate: OpenClawReferenceCandidate = openClawReferenceCandidate,
): readonly string[] {
  const errors: string[] = [];
  const stageIds = new Set<ScenarioStageId>();
  const presentationCopy = [
    candidate.presentation.hero.intro,
    candidate.presentation.hero.sourceBoundary,
    candidate.presentation.hero.visibilityLabel,
    candidate.presentation.hero.localRunBoundary,
    candidate.presentation.identityDisclosure.eyebrow,
    candidate.presentation.identityDisclosure.title,
    candidate.presentation.coverageDisclosure.eyebrow,
    candidate.presentation.coverageDisclosure.title,
  ];

  if (presentationCopy.some((value) => value.trim().length === 0)) {
    errors.push("The OpenClaw reference presentation copy is incomplete.");
  }

  for (const stage of candidate.stageCoverage) {
    if (stageIds.has(stage.stageId)) {
      errors.push(`Duplicate OpenClaw reference stage: ${stage.stageId}`);
    }
    stageIds.add(stage.stageId);

    if (stage.alignment === "none" && stage.statusLabel !== "Simulation only") {
      errors.push(`Unaligned stage is not labeled Simulation only: ${stage.stageId}`);
    }
  }

  if (stageIds.size !== 3) {
    errors.push("OpenClaw reference coverage must state all three website stages.");
  }

  if (candidate.stageCoverage.some(({ alignment }) => alignment === "exact")) {
    errors.push("The current candidate cannot claim exact website-stage alignment.");
  }

  if (
    candidate.publication !== "source-reference" ||
    [candidate.publicSource, candidate.publicInstructions, candidate.cleanCheckout].some(
      ({ state }) => state !== "available",
    ) ||
    [
      candidate.capturedRun,
      candidate.verification,
      ...candidate.evidenceLanes.map(({ capturedEvidence }) => capturedEvidence),
    ].some(({ state }) => state === "available")
  ) {
    errors.push("The OpenClaw source and retained-evidence boundary is inconsistent.");
  }

  if (
    candidate.evidence.status !== "reference" ||
    candidate.releaseState !== "source-public"
  ) {
    errors.push("The OpenClaw reference must remain public source with Reference evidence.");
  }

  if (
    candidate.integration.hostVersion !== "2026.7.1" ||
    candidate.integration.adapterVersion !== "0.1.1"
  ) {
    errors.push("The OpenClaw reference pins drifted from the candidate descriptor.");
  }

  if (
    !candidate.policySource.includes("spend.available_cents(principal.team)") ||
    candidate.providerView.name !== "spend.available_cents" ||
    candidate.providerView.consistency !== "scoped-policy-state" ||
    candidate.providerView.maximumLatencyMs !== 100
  ) {
    errors.push("The OpenClaw policy or provider-view contract drifted from the candidate.");
  }

  if (
    candidate.identity.releaseTreeRevision !==
      masugateRelease.candidateSource.releaseTreeRevision ||
    candidate.identity.originImplementationRevision !==
      masugateRelease.candidateSource.originSourceRevision ||
    candidate.sourceAudit.releaseTreeRevision !==
      candidate.identity.releaseTreeRevision
  ) {
    errors.push("The OpenClaw source identity drifted from the release contract.");
  }

  if (
    !candidate.promotionGates.some(({ status }) => status === "complete") ||
    !candidate.promotionGates.some(({ status }) => status === "pending")
  ) {
    errors.push("The candidate must distinguish completed intake from pending promotion gates.");
  }

  const supportRoutes = candidate.promotionGates.find(
    ({ id }) => id === "support-routes",
  );
  const expectedSupportStatus =
    sourceRepositoryContract.state === "available" ? "complete" : "pending";
  if (!supportRoutes || supportRoutes.status !== expectedSupportStatus) {
    errors.push("The OpenClaw support gate drifted from the site availability contract.");
  }

  return errors;
}

export const openClawReferenceValidationErrors =
  validateOpenClawReferenceCandidate();
