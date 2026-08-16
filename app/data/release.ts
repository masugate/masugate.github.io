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
    | "langchain-adapter"
    | "agent-framework-adapter"
    | "crewai-adapter"
    | "reference-deployment"
    | "typescript-client"
    | "openclaw-adapter"
    | "mcp-gateway"
    | "container-image";
  channel: "pypi" | "npm" | "release-asset" | "container";
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
  commitSignature: "unsigned" | "verified";
  releaseTag: Availability<string>;
  githubRelease: Availability<Readonly<{ href: `https://${string}` }>>;
}

interface ReleaseBase {
  id: "masugate-candidate-0.1.0" | string;
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
    releaseControlDocumentValidation: "passed";
    documentation: "passed";
    externalReleaseAuthorization: "pending";
    publishingWorkflows: "disabled";
    liveGateContract: "needs-reconciliation";
    supportedRuntimeGates: "not-run" | "passed";
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
    immutableRevision: Available<
      Readonly<{
        tag: string;
        commit: string;
      }>
    >;
    verifiedAt: Available<IsoDate>;
    publicDocumentation: Available<Readonly<{ href: `https://${string}` }>>;
    primaryInstall: Readonly<{
      state: "available";
      channel: "pypi";
      packageIdentity: string;
      command: string;
    }>;
    publicEvidenceLinks: Available<
      readonly Readonly<{
        label: string;
        href: `https://${string}`;
      }>[]
    >;
  }>;

export type ReleaseContract = UnreleasedRelease | PublishedRelease;

const unavailableInstallCommand = () =>
  unavailable(
    "install-command-unavailable",
    "No copy-ready command is published until it passes the named release gate.",
  );

export const masugateRelease = {
  id: "masugate-candidate-0.1.0",
  version: "0.1.0",
  state: "unreleased",
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
    {
      id: "python-platform",
      channel: "pypi",
      version: "0.1.0",
      publication: "declared-only",
      packageName: available("masugate"),
      installCommand: unavailableInstallCommand(),
    },
    {
      id: "python-client",
      channel: "pypi",
      version: "0.1.0",
      publication: "declared-only",
      packageName: available("masugate-client"),
      installCommand: unavailableInstallCommand(),
    },
    {
      id: "langchain-adapter",
      channel: "pypi",
      version: "0.1.0",
      publication: "declared-only",
      packageName: available("masugate-langchain"),
      installCommand: unavailableInstallCommand(),
    },
    {
      id: "agent-framework-adapter",
      channel: "pypi",
      version: "0.1.0",
      publication: "declared-only",
      packageName: available("masugate-agent-framework"),
      installCommand: unavailableInstallCommand(),
    },
    {
      id: "crewai-adapter",
      channel: "pypi",
      version: "0.1.0",
      publication: "declared-only",
      packageName: available("masugate-crewai"),
      installCommand: unavailableInstallCommand(),
    },
    {
      id: "reference-deployment",
      channel: "release-asset",
      version: "0.1.0",
      publication: "declared-only",
      packageName: available("masugate-openclaw-reference"),
      installCommand: unavailableInstallCommand(),
    },
    {
      id: "typescript-client",
      channel: "npm",
      version: "0.1.0",
      publication: "declared-only",
      packageName: available("@masugate/client"),
      installCommand: unavailableInstallCommand(),
    },
    {
      id: "openclaw-adapter",
      channel: "npm",
      version: "0.1.0",
      publication: "declared-only",
      packageName: available("@masugate/openclaw"),
      installCommand: unavailableInstallCommand(),
    },
    {
      id: "mcp-gateway",
      channel: "npm",
      version: "0.1.0",
      publication: "declared-only",
      packageName: available("@masugate/mcp-gateway"),
      installCommand: unavailableInstallCommand(),
    },
    {
      id: "container-image",
      channel: "container",
      version: "0.1.0",
      publication: "declared-only",
      packageName: unavailable(
        "public-release-unavailable",
        "The public image identity and digest remain release-gated.",
      ),
      installCommand: unavailableInstallCommand(),
    },
  ],
  candidateSource: {
    repository: "https://github.com/masugate/masugate",
    defaultBranch: "main",
    releaseTreeRevision:
      "6b3852ecb70bd55cb22bf78769028b9b52af9735",
    releaseTree: "6b3852ecb70bd55cb22bf78769028b9b52af9735",
    originSourceRevision:
      "d56701ad9dddd8bd3136880bce619387f277f71c",
    visibility: "public",
    observedAt: "2026-08-10",
    commitSignature: "unsigned",
    releaseTag: unavailable(
      "public-release-unavailable",
      "The repository has no v0.1.0 Git tag yet.",
    ),
    githubRelease: unavailable(
      "public-release-unavailable",
      "No GitHub Release is published for the candidate.",
    ),
  },
  registryObservation: {
    observedAt: "2026-08-08",
    pypi: "not-found",
    npm: "not-found",
  },
  sourceAudit: {
    checkedAt: "2026-08-10",
    releaseTreeRevision:
      "6b3852ecb70bd55cb22bf78769028b9b52af9735",
    releaseControlDocumentValidation: "passed",
    documentation: "passed",
    externalReleaseAuthorization: "pending",
    publishingWorkflows: "disabled",
    liveGateContract: "needs-reconciliation",
    supportedRuntimeGates: "not-run",
    note:
      "The public MasuGate source identity is verified, but that does not authorize a release. A public v0.1.0 tag, GitHub Release, publish authorization, and retained runtime evidence are still required before installation or verification claims can be shown.",
  },
  candidateEvidence: {
    status: "reference",
    sourceKind: "candidate-manifest",
    locator:
      "masugate/masugate@6b3852ecb70bd55cb22bf78769028b9b52af9735",
    note:
      "Git-backed candidate metadata is source material, not retained runtime evidence or a public release guarantee.",
  },
  publicRepository: available({
    href: "https://github.com/masugate/masugate",
  }),
  immutableRevision: unavailable(
    "public-release-unavailable",
    "The candidate commit is pinned, but no public v0.1.0 tag or GitHub Release exists yet.",
  ),
  verifiedAt: unavailable(
    "verification-pending",
    "A public-release verification date is not available.",
  ),
  publicDocumentation: available({
    href: "https://github.com/masugate/masugate/blob/main/README.md",
  }),
  primaryInstall: {
    state: "unavailable",
    intendedChannel: "pypi",
    packageIdentity: unavailable(
      "public-release-unavailable",
      "The intended PyPI distribution is declared, but the 0.1.0 package is not published.",
    ),
    command: unavailableInstallCommand(),
  },
  publicEvidenceLinks: unavailable(
    "public-evidence-unavailable",
    "Public release evidence links have not been published.",
  ),
} as const satisfies ReleaseContract;

export function isPublishedRelease(
  release: ReleaseContract,
): release is PublishedRelease {
  return release.state === "released";
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
    errors.push("Candidate Git identities must be full lowercase revisions.");
  }

  if (release.sourceAudit.releaseTreeRevision !== release.candidateSource.releaseTreeRevision) {
    errors.push("Source-audit revision drifted from the candidate source identity.");
  }

  if (
    release.state === "unreleased" &&
    release.packages.some(({ publication }) => publication === "published")
  ) {
    errors.push("An unreleased manifest cannot claim a published package.");
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
