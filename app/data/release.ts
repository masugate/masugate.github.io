import {
  type Availability,
  type Available,
  type IsoDate,
  type Maturity,
  type ReferenceEvidence,
  type Unavailable,
  available,
  unavailable,
} from "./contracts";

export interface VersionPin {
  component: string;
  version: string;
}

export interface PackageIdentity {
  id:
    | "python-platform"
    | "python-client"
    | "python-adapter-core"
    | "langchain-adapter"
    | "agent-framework-adapter"
    | "crewai-adapter"
    | "connector-sdk"
    | "google-calendar-connector"
    | "stripe-payment-intent-connector"
    | "filesystem-connector"
    | "calendar-operation"
    | "spend-operation"
    | "filesystem-operation"
    | "reference-deployment"
    | "typescript-client"
    | "typescript-adapter-core"
    | "openclaw-adapter"
    | "mcp-gateway";
  channel: "pypi" | "npm";
  version: string;
  publication: "declared-only" | "published";
  packageName: Availability<string>;
  installCommand: Availability<string>;
}

export interface CandidateSourceIdentity {
  repository: `https://${string}`;
  defaultBranch: "main";
  releaseTreeRevision: string;
  releaseTree: string;
  originSourceRevision: string;
  visibility: "private" | "public";
  observedAt: IsoDate;
  commitSignature: "unsigned" | "verified" | "unknown";
  releaseTag: Availability<string>;
  githubRelease: Availability<Readonly<{ href: `https://${string}` }>>;
}

export interface SourceQuickStart {
  guideHref: `https://${string}`;
  setupHref: `https://${string}`;
  reproductionHref: `https://${string}`;
  expectedResultsHref: `https://${string}`;
  reviewHref: `https://${string}`;
  claimsHref: `https://${string}`;
  setupCommand: string;
  runCommand: string;
  verifyCommand: string;
  cleanupCommand: string;
  expectedSetupOutput: string;
  expectedRunOutput: string;
  expectedVerificationResult: string;
}

interface ReleaseBase {
  id: string;
  version: string;
  maturity: Maturity;
  posture: "research-preview";
  referenceEnvironment: Readonly<{
    os: "Linux";
    architecture: "amd64";
    python: "3.12";
    dockerRequired: true;
    composeRequired: true;
  }>;
  reviewerToolchain: readonly VersionPin[];
  setupProfile: Readonly<{
    maximumColdSetupMinutes: 15;
    approximateFreeDiskGiB: 8;
    setupMayUseNetwork: true;
    measuredRunCredentialFree: true;
    measuredRunOfflineAfterSetup: true;
  }>;
  integrationPins: readonly VersionPin[];
  packages: readonly PackageIdentity[];
  candidateSource: CandidateSourceIdentity;
  registryObservation: Readonly<{
    observedAt: IsoDate;
    pypi: "not-found" | "published";
    npm: "not-found" | "published";
  }>;
  sourceAudit: Readonly<{
    checkedAt: IsoDate;
    releaseTreeRevision: string;
    sourcePublication: "public" | "private";
    documentation: "published" | "pending";
    runtimeRunbook: "published" | "pending";
    tagPublication: "not-published" | "published";
    packagePublication: "not-published" | "published";
    retainedPublicEvidence: "not-published" | "published";
    note: string;
  }>;
  candidateEvidence: ReferenceEvidence;
}

export type UnreleasedRelease = ReleaseBase &
  Readonly<{
    state: "unreleased";
    publicRepository: Availability<Readonly<{ href: `https://${string}` }>>;
    immutableRevision: Unavailable;
    verifiedAt: Unavailable;
    publicDocumentation: Availability<Readonly<{ href: `https://${string}` }>>;
    sourceQuickStart: Unavailable;
    primaryInstall: Readonly<{
      state: "unavailable";
      intendedChannel: "pypi";
      packageIdentity: Unavailable;
      command: Unavailable;
    }>;
    publicEvidenceLinks: Unavailable;
  }>;

export type SourcePublicRelease = ReleaseBase &
  Readonly<{
    state: "source-public";
    publicRepository: Available<Readonly<{ href: `https://${string}` }>>;
    immutableRevision: Unavailable;
    verifiedAt: Unavailable;
    publicDocumentation: Available<Readonly<{ href: `https://${string}` }>>;
    sourceQuickStart: Available<SourceQuickStart>;
    primaryInstall: Readonly<{
      state: "unavailable";
      intendedChannel: "pypi";
      packageIdentity: Unavailable;
      command: Unavailable;
    }>;
    publicEvidenceLinks: Unavailable;
  }>;

export type PublishedRelease = ReleaseBase &
  Readonly<{
    state: "released";
    publicRepository: Available<Readonly<{ href: `https://${string}` }>>;
    immutableRevision: Available<Readonly<{ tag: string; commit: string }>>;
    verifiedAt: Available<IsoDate>;
    publicDocumentation: Available<Readonly<{ href: `https://${string}` }>>;
    sourceQuickStart: Available<SourceQuickStart>;
    primaryInstall: Readonly<{
      state: "available";
      channel: "pypi";
      packageIdentity: string;
      command: string;
    }>;
    publicEvidenceLinks: Available<
      readonly Readonly<{ label: string; href: `https://${string}` }>[]
    >;
  }>;

export type ReleaseContract =
  | UnreleasedRelease
  | SourcePublicRelease
  | PublishedRelease;

const unavailableInstallCommand = () =>
  unavailable(
    "install-command-unavailable",
    "MasuGate 0.1.1 is available from source; no registry install command is published.",
  );

const declaredPackage = (
  id: PackageIdentity["id"],
  channel: PackageIdentity["channel"],
  packageName: string,
): PackageIdentity => ({
  id,
  channel,
  version: "0.1.1",
  publication: "declared-only",
  packageName: available(packageName),
  installCommand: unavailableInstallCommand(),
});

export const masugateRelease = {
  id: "masugate-openclaw-reference/0.1.1",
  version: "0.1.1",
  state: "source-public",
  maturity: "experimental",
  posture: "research-preview",
  referenceEnvironment: {
    os: "Linux",
    architecture: "amd64",
    python: "3.12",
    dockerRequired: true,
    composeRequired: true,
  },
  reviewerToolchain: [
    { component: "CPython", version: "3.12.3" },
    { component: "Git", version: "2.43.0" },
    { component: "Node.js", version: "24.16.0" },
    { component: "npm", version: "11.13.0" },
    { component: "uv", version: "0.11.26" },
    { component: "Docker Engine", version: "29.6.1" },
    { component: "Docker Compose", version: "5.3.0" },
  ],
  setupProfile: {
    maximumColdSetupMinutes: 15,
    approximateFreeDiskGiB: 8,
    setupMayUseNetwork: true,
    measuredRunCredentialFree: true,
    measuredRunOfflineAfterSetup: true,
  },
  integrationPins: [
    { component: "OpenClaw", version: "2026.7.1" },
    { component: "LangChain", version: "1.3.14" },
    { component: "LangGraph", version: "1.2.9" },
    { component: "Microsoft Agent Framework Core", version: "1.12.0" },
    { component: "CrewAI", version: "1.15.6" },
    { component: "CrewAI Core", version: "1.15.6" },
  ],
  packages: [
    declaredPackage("python-platform", "pypi", "masugate"),
    declaredPackage("connector-sdk", "pypi", "masugate-connector-sdk"),
    declaredPackage("python-client", "pypi", "masugate-client"),
    declaredPackage("python-adapter-core", "pypi", "masugate-adapter-core"),
    declaredPackage("langchain-adapter", "pypi", "masugate-langchain"),
    declaredPackage("agent-framework-adapter", "pypi", "masugate-agent-framework"),
    declaredPackage("crewai-adapter", "pypi", "masugate-crewai"),
    declaredPackage("google-calendar-connector", "pypi", "masugate-connector-google-calendar"),
    declaredPackage("stripe-payment-intent-connector", "pypi", "masugate-connector-stripe-payment-intent"),
    declaredPackage("filesystem-connector", "pypi", "masugate-connector-filesystem"),
    declaredPackage("calendar-operation", "pypi", "masugate-operation-calendar"),
    declaredPackage("spend-operation", "pypi", "masugate-operation-spend"),
    declaredPackage("filesystem-operation", "pypi", "masugate-operation-filesystem"),
    declaredPackage("reference-deployment", "pypi", "masugate-openclaw-reference"),
    declaredPackage("typescript-client", "npm", "@masugate/client"),
    declaredPackage("typescript-adapter-core", "npm", "@masugate/adapter-core"),
    declaredPackage("mcp-gateway", "npm", "@masugate/mcp-gateway"),
    declaredPackage("openclaw-adapter", "npm", "@masugate/openclaw"),
  ],
  candidateSource: {
    repository: "https://github.com/masugate/masugate",
    defaultBranch: "main",
    releaseTreeRevision: "10f097ced9480ca86c138a9c3d8c92bebdadcefa",
    releaseTree: "75ae5448eb7b688895be34260f937a4a51dfdc54",
    originSourceRevision: "1373f5507c1680c60a7700d8a6c26a8b4d3fb025",
    visibility: "public",
    observedAt: "2026-09-03",
    commitSignature: "unknown",
    releaseTag: unavailable(
      "public-release-unavailable",
      "The public repository has no v0.1.1 Git tag.",
    ),
    githubRelease: unavailable(
      "public-release-unavailable",
      "No v0.1.1 GitHub Release is published.",
    ),
  },
  registryObservation: {
    observedAt: "2026-09-03",
    pypi: "not-found",
    npm: "not-found",
  },
  sourceAudit: {
    checkedAt: "2026-09-03",
    releaseTreeRevision: "10f097ced9480ca86c138a9c3d8c92bebdadcefa",
    sourcePublication: "public",
    documentation: "published",
    runtimeRunbook: "published",
    tagPublication: "not-published",
    packagePublication: "not-published",
    retainedPublicEvidence: "not-published",
    note:
      "MasuGate 0.1.1 is public as a source-based research preview with a documented local demonstration. The mutable main branch is not a tagged release, registry packages are not published, and no independent retained public run is claimed.",
  },
  candidateEvidence: {
    status: "reference",
    sourceKind: "candidate-manifest",
    locator:
      "https://github.com/masugate/masugate/blob/main/release/reference-release.json",
    note:
      "The public descriptor and runbook are inspectable Reference material; they are not a claim of registry publication, production assurance, or independent verification.",
  },
  publicRepository: available({
    href: "https://github.com/masugate/masugate",
  }),
  immutableRevision: unavailable(
    "public-release-unavailable",
    "The public source is available on mutable main, but no v0.1.1 tag or GitHub Release exists.",
  ),
  verifiedAt: unavailable(
    "verification-pending",
    "No independent retained public run has been accepted yet.",
  ),
  publicDocumentation: available({
    href: "https://github.com/masugate/masugate/blob/main/README.md",
  }),
  sourceQuickStart: available({
    guideHref:
      "https://github.com/masugate/masugate#five-minute-local-demonstration",
    setupHref:
      "https://github.com/masugate/masugate/blob/main/docs/artifact-evaluation.md#exact-one-time-setup",
    reproductionHref:
      "https://github.com/masugate/masugate/blob/main/docs/reproduction.md",
    expectedResultsHref:
      "https://github.com/masugate/masugate/blob/main/docs/expected-results.md",
    reviewHref:
      "https://github.com/masugate/masugate/blob/main/REVIEWING.md",
    claimsHref:
      "https://github.com/masugate/masugate/blob/main/docs/claims-and-limitations.md",
    setupCommand: `test ! -e /tmp/masugate-reviewer-setup
python3 scripts/prepare-reference-demo.py \\
  --outdir /tmp/masugate-reviewer-setup`,
    runCommand: `. /tmp/masugate-reviewer-setup/reviewer.env
cd "$MASUGATE_CANDIDATE_DIR"
test ! -e /tmp/masugate-five-minute-demo
"$MASUGATE_REVIEWER_PYTHON" scripts/run_reference_demos.py procurement \\
  --release-dir "$MASUGATE_RELEASE_VERIFICATION_RELEASE_DIR" \\
  --offline-npm-cache "$MASUGATE_OFFLINE_NPM_CACHE" \\
  --source-revision "$MASUGATE_SOURCE_REVISION" \\
  --source-date-epoch "$MASUGATE_SOURCE_DATE_EPOCH" \\
  --outdir /tmp/masugate-five-minute-demo`,
    verifyCommand: `"$MASUGATE_REVIEWER_PYTHON" scripts/verify-flagship-demo.py \\
  --outdir /tmp/masugate-five-minute-demo`,
    cleanupCommand: "rm -r -- /tmp/masugate-five-minute-demo",
    expectedSetupOutput:
      "MasuGate reviewer inputs: /tmp/masugate-reviewer-setup/reviewer.env",
    expectedRunOutput:
      "MasuGate procurement evidence: /tmp/masugate-five-minute-demo/evidence/procurement.json",
    expectedVerificationResult: 'JSON containing "result": "PASS"',
  }),
  primaryInstall: {
    state: "unavailable",
    intendedChannel: "pypi",
    packageIdentity: unavailable(
      "public-release-unavailable",
      "The 0.1.1 Python distributions are declared for locally built release artifacts, not published on PyPI.",
    ),
    command: unavailableInstallCommand(),
  },
  publicEvidenceLinks: unavailable(
    "public-evidence-unavailable",
    "The source includes verification tools and expected results, but no independent retained public run is claimed.",
  ),
} as const satisfies SourcePublicRelease;

export function isPublishedRelease(
  release: ReleaseContract,
): release is PublishedRelease {
  return release.state === "released";
}

export function isSourcePublicRelease(
  release: ReleaseContract,
): release is SourcePublicRelease | PublishedRelease {
  return release.state === "source-public" || release.state === "released";
}

export function getPackageIdentity(
  packageId: PackageIdentity["id"],
): PackageIdentity {
  const packageIdentity = masugateRelease.packages.find(
    ({ id }) => id === packageId,
  );

  if (!packageIdentity) {
    throw new Error(`Unknown package identity: ${packageId}`);
  }

  return packageIdentity;
}

export function validateRelease(
  release: ReleaseContract = masugateRelease,
): readonly string[] {
  const errors: string[] = [];
  const packageIds = new Set<PackageIdentity["id"]>();

  for (const packageIdentity of release.packages) {
    if (packageIds.has(packageIdentity.id)) {
      errors.push(`Duplicate release package id: ${packageIdentity.id}`);
    }
    packageIds.add(packageIdentity.id);

    if (
      packageIdentity.installCommand.state === "available" &&
      packageIdentity.installCommand.value.trim().length === 0
    ) {
      errors.push(`Package ${packageIdentity.id} has an empty install command.`);
    }
    if (packageIdentity.version !== release.version) {
      errors.push(`Package ${packageIdentity.id} drifted from the release version.`);
    }
    if (
      packageIdentity.publication === "published" &&
      packageIdentity.installCommand.state !== "available"
    ) {
      errors.push(`Published package ${packageIdentity.id} has no install command.`);
    }
  }

  const revisionShape = /^[0-9a-f]{40}$/;
  if (
    !revisionShape.test(release.candidateSource.releaseTreeRevision) ||
    !revisionShape.test(release.candidateSource.releaseTree) ||
    !revisionShape.test(release.candidateSource.originSourceRevision)
  ) {
    errors.push("Source Git identities must be full lowercase revisions.");
  }

  if (
    release.sourceAudit.releaseTreeRevision !==
    release.candidateSource.releaseTreeRevision
  ) {
    errors.push("Source-audit revision drifted from the source identity.");
  }

  if (
    release.state !== "released" &&
    release.packages.some(({ publication }) => publication === "published")
  ) {
    errors.push("A source-only manifest cannot claim a published package.");
  }

  if (release.state === "source-public") {
    if (
      release.candidateSource.visibility !== "public" ||
      release.sourceAudit.sourcePublication !== "public" ||
      release.sourceQuickStart.state !== "available"
    ) {
      errors.push("A public-source release must expose its source and runbook.");
    }
    if (
      release.primaryInstall.state !== "unavailable" ||
      release.candidateSource.releaseTag.state !== "unavailable" ||
      release.candidateSource.githubRelease.state !== "unavailable" ||
      release.registryObservation.pypi !== "not-found" ||
      release.registryObservation.npm !== "not-found"
    ) {
      errors.push("The source-only release boundary contradicts distribution state.");
    }
  }

  if (
    release.state === "released" &&
    release.primaryInstall.command.trim().length === 0
  ) {
    errors.push("A released manifest cannot have an empty primary install command.");
  }

  return errors;
}

export const releaseValidationErrors = validateRelease();
