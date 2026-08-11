import { integrationValidationErrors } from "./integrations";
import { articleValidationErrors } from "./articles";
import { demoValidationErrors } from "./demo";
import { getStartedValidationErrors } from "./get-started";
import { openClawReferenceValidationErrors } from "./openclaw-reference";
import {
  policyArtifacts,
  type PolicyArtifact,
  policyValidationErrors,
} from "./policies";
import { releaseValidationErrors } from "./release";
import { schematicValidationErrors } from "./schematics";
import {
  openClawScenario,
  type ScenarioContract,
  scenarioValidationErrors,
} from "./scenario";

function authoredClauseIds(
  policy: PolicyArtifact,
  artifacts: readonly PolicyArtifact[],
  visited = new Set<string>(),
): ReadonlySet<string> {
  if (visited.has(policy.id)) return new Set();
  visited.add(policy.id);

  const clauses = new Set<string>();
  for (const match of policy.source.body.matchAll(/\b(?:deny|escalate)\s+([a-z][a-z0-9_]*)\b/g)) {
    const clause = match[1];
    if (clause) clauses.add(clause);
  }
  if (/\ballow\s+otherwise\s*;/g.test(policy.source.body)) {
    clauses.add("otherwise");
  }

  if (policy.source.form === "diff") {
    const { baseArtifactId } = policy.source;
    const base = artifacts.find(({ id }) => id === baseArtifactId);
    if (base) {
      for (const clause of authoredClauseIds(base, artifacts, visited)) {
        clauses.add(clause);
      }
    }
  }

  return clauses;
}

export function validateScenarioPolicyReferences(
  scenario: ScenarioContract = openClawScenario,
  artifacts: readonly PolicyArtifact[] = policyArtifacts,
): readonly string[] {
  const knownPolicyIds = new Set(artifacts.map(({ id }) => id));
  const errors: string[] = [];

  for (const stage of openClawScenario.stages) {
    for (const policyId of stage.policyArtifactIds) {
      if (!knownPolicyIds.has(policyId)) {
        errors.push(
          `Scenario stage ${stage.id} references missing policy artifact: ${policyId}`,
        );
      }
    }
  }

  for (const event of scenario.events) {
    const context = event.policyContext;
    if (!context) continue;

    const policy = artifacts.find(({ id }) => id === context.artifactId);
    if (!policy) {
      errors.push(
        `Scenario event ${event.id} references missing policy artifact: ${context.artifactId}`,
      );
      continue;
    }

    const dependencyIds = new Set(
      policy.dependencies.map(({ referenceView }) => referenceView),
    );
    for (const stateRead of context.stateReads) {
      if (!dependencyIds.has(stateRead)) {
        errors.push(
          `Scenario event ${event.id} reads ${stateRead}, which is not declared by ${policy.id}.`,
        );
      }
    }

    if (
      context.activeClause &&
      !authoredClauseIds(policy, artifacts).has(context.activeClause)
    ) {
      errors.push(
        `Scenario event ${event.id} names unknown clause ${context.activeClause} in ${policy.id}.`,
      );
    }
  }

  const declaredViews = new Set(
    artifacts.flatMap((policy) =>
      policy.dependencies.map(({ referenceView }) => referenceView),
    ),
  );
  for (const route of scenario.routes) {
    for (const stateView of route.provider.stateViews) {
      if (!declaredViews.has(stateView)) {
        errors.push(
          `Scenario route ${route.id} exposes provider view ${stateView} without a policy dependency.`,
        );
      }
    }
  }

  return errors;
}

export const contentValidationErrors = [
  ...articleValidationErrors,
  ...scenarioValidationErrors,
  ...policyValidationErrors,
  ...demoValidationErrors,
  ...getStartedValidationErrors,
  ...openClawReferenceValidationErrors,
  ...releaseValidationErrors,
  ...integrationValidationErrors,
  ...schematicValidationErrors,
  ...validateScenarioPolicyReferences(),
] as const;

export function assertContentContracts(): void {
  if (contentValidationErrors.length === 0) {
    return;
  }

  throw new Error(
    `Invalid MasuGate content contracts:\n${contentValidationErrors
      .map((error) => `- ${error}`)
      .join("\n")}`,
  );
}
