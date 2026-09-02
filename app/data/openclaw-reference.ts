import {
  type Availability,
  type ReferenceEvidence,
  type ScenarioStageId,
  unavailable,
} from "./contracts";
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
  publication: "candidate-only";
  releaseState: "unreleased";
  maturity: "experimental";
  evidence: ReferenceEvidence;
  presentation: Readonly<{
    hero: Readonly<{
      intro: string;
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
    releaseId: "masugate-openclaw-reference/0.1.0";
    releaseChannel: "research-preview";
    repository: "https://github.com/masugate/masugate";
    defaultBranch: "main";
    originImplementationRevision: string;
    releaseTreeRevision: string;
    releaseTree: string;
    repositoryVisibility: "private" | "public";
    visibilityObservedAt: "2026-08-10";
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
    adapterVersion: "0.1.0";
    referenceDistribution: "masugate-openclaw-reference";
    referenceDistributionVersion: "0.1.0";
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
  publicSource: Availability<never>;
  publicInstructions: Availability<never>;
  cleanCheckout: Availability<never>;
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

export const openClawReferenceCandidate = {
  id: "openclaw-reference-candidate",
  publication: "candidate-only",
  releaseState: "unreleased",
  maturity: "experimental",
  evidence: {
    status: "reference",
    sourceKind: "candidate-manifest",
    locator:
      "masugate/masugate@6b3852ecb70bd55cb22bf78769028b9b52af9735/release/reference-release.json",
    note:
      "Exact Git-backed candidate metadata; supported-runtime output, a public release, and public evidence destinations are absent.",
  },
  presentation: {
    hero: {
      intro:
        "Map the pinned OpenClaw purchase candidate to the website story without treating the simulation as recorded or verified execution.",
    },
    identityDisclosure: {
      eyebrow: "Secondary candidate detail",
      title: "Environment, source lineage, and publication state",
    },
    coverageDisclosure: {
      eyebrow: "Relationship to the three-stage walkthrough",
      title: "No website stage is release-backed yet.",
    },
  },
  identity: {
    releaseId: "masugate-openclaw-reference/0.1.0",
    releaseChannel: "research-preview",
    repository: masugateRelease.candidateSource.repository,
    defaultBranch: masugateRelease.candidateSource.defaultBranch,
    originImplementationRevision:
      masugateRelease.candidateSource.originSourceRevision,
    releaseTreeRevision:
      masugateRelease.candidateSource.releaseTreeRevision,
    releaseTree: masugateRelease.candidateSource.releaseTree,
    repositoryVisibility: "public",
    visibilityObservedAt: "2026-08-10",
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
    adapterVersion: "0.1.0",
    referenceDistribution: "masugate-openclaw-reference",
    referenceDistributionVersion: "0.1.0",
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
      "ef3ed59d53a0818b903231be46ae791ad63e909b17fe38fe95d0b4f4441fa423",
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
      driver: "OpenClaw 2026.7.1 agent harness and @masugate/openclaw 0.1.0",
      sourceAssertions: [
        "$1 purchase commits and an identical tool call replays the same operation",
        "$6 purchase returns a durable pending result",
        "Two concurrent $2.50 calls produce one committed and one denied result",
        "The committed audit contains a succeeded protected-execution receipt",
      ],
      boundary:
        "The pinned Git candidate contains this integration gate with PostgreSQL MasuGate state and a SQLite purchase-effect fixture, but this intake did not execute it on the required Linux/amd64 profile or retain its output.",
      gateLabel:
        "Pinned-host integration gate (PostgreSQL MasuGate state; SQLite effect fixture)",
      capturedEvidence: pending(
        "public-evidence-unavailable",
        "No captured host-roundtrip output or public evidence destination ships with the candidate repository.",
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
        "The verifier requires a PSS-valid history and retained governance records",
      ],
      boundary:
        "This workload matches the Stage 2 arithmetic, but it drives masugated directly rather than an OpenClaw conversation and uses different identifiers and policy artifacts.",
      gateLabel: "Five-minute procurement and flagship-verifier gates",
      capturedEvidence: pending(
        "public-evidence-unavailable",
        "The release intake did not execute or retain the five-minute clean-artifact demonstration on its supported profile.",
      ),
    },
  ],
  stageCoverage: [
    {
      stageId: "stage-1",
      stageLabel: "One governed purchase",
      alignment: "related",
      statusLabel: "Related candidate path",
      relationship:
        "The pinned host gate encodes test cases for a governed purchase, replay, pending result, and receipt.",
      mismatch:
        "The website uses a $40 Work Manager request and categorized-purchase@v1; the candidate uses buyer-alpha, spend_budget_guard@1.0.0, and different amounts.",
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
        "The candidate contains calendar and filesystem components and narrower reference checks.",
      mismatch:
        "No credential-free OpenClaw gate reproduces the website's overlap policy, fixed alternative, itinerary, and protected-file story.",
    },
  ],
  promotionGates: [
    {
      id: "git-candidate",
      status: "complete",
      label: "Pin the Git-backed candidate",
      detail:
        "Repository, main-branch release-tree commit, tree, origin implementation revision, descriptor, and package catalog are reconciled.",
    },
    {
      id: "static-controls",
      status: "complete",
      label: "Run source-level release checks",
      detail:
        "Release-control-document and documentation validation passed at the pinned release-tree commit; external release authorization remains pending.",
    },
    {
      id: "live-gate-contract",
      status: "pending",
      label: "Reconcile the live release gate",
      detail:
        "The live gate requires two offline Alpine inputs that the reviewer setup and checked-in test invocation do not currently provide. Fix and revalidate that release-owned path before execution evidence is accepted.",
    },
    {
      id: "supported-runtime",
      status: "pending",
      label: "Run the supported runtime gates",
      detail:
        "Run the clean-artifact, OpenClaw/PostgreSQL, containment, procurement, and flagship verifier gates on Linux/amd64 with the declared toolchain.",
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
      label: "Publish an immutable release",
      detail:
        "Create the reviewed v0.1.0 tag and GitHub Release, then attach checksums, SBOM, provenance, artifacts, and evidence.",
    },
    {
      id: "support-routes",
      status: "pending",
      label: "Enable public support routes",
      detail:
        "Confirm the issue tracker and a private security-reporting destination before activating those website links.",
    },
  ],
  publicSource: pending(
    "public-release-unavailable",
    "The MasuGate source repository is public, but the reviewed v0.1.0 tag and GitHub Release are not published yet.",
  ),
  publicInstructions: pending(
    "public-release-unavailable",
    "The candidate contains an artifact-review runbook, but there is no public tag, GitHub Release, or supported-run evidence yet.",
  ),
  cleanCheckout: pending(
    "verification-pending",
    "Static source checks passed, but the clean-artifact and runtime gates were not run on the required Linux/amd64 profile.",
  ),
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
    candidate.publication === "candidate-only" &&
    [
      candidate.publicSource,
      candidate.publicInstructions,
      candidate.cleanCheckout,
      candidate.capturedRun,
      candidate.verification,
      ...candidate.evidenceLanes.map(({ capturedEvidence }) => capturedEvidence),
    ].some(({ state }) => state === "available")
  ) {
    errors.push("A candidate-only route cannot expose release-backed availability.");
  }

  if (
    candidate.evidence.status !== "reference" ||
    candidate.releaseState !== "unreleased"
  ) {
    errors.push("The current OpenClaw reference must remain Reference and unreleased.");
  }

  if (
    candidate.integration.hostVersion !== "2026.7.1" ||
    candidate.integration.adapterVersion !== "0.1.0"
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

  return errors;
}

export const openClawReferenceValidationErrors =
  validateOpenClawReferenceCandidate();
