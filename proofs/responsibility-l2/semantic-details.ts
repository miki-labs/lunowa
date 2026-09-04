import type {
  ResponsibilitySemanticDetailsV1,
} from "./schema";

const topLevelKeys = new Set([
  "completionCriteria",
  "constraints",
  "pendingProposals",
  "agreedFacts",
  "uncertainties",
  "assignmentSemantics",
  "riskDetails",
]);

const statuses = {
  criterion: new Set(["PENDING", "SATISFIED", "WAIVED"]),
  constraint: new Set(["ACTIVE", "SATISFIED", "CANCELLED", "SUPERSEDED"]),
  proposal: new Set(["PENDING", "REJECTED", "SUPERSEDED"]),
  fact: new Set(["CURRENT", "SUPERSEDED"]),
  risk: new Set(["LOW", "NORMAL", "HIGH", "CRITICAL"]),
  assignment: new Set(["ANY_OF", "ALL_OF", "UNSPECIFIED_GROUP"]),
};

export const emptySemanticDetails = (): ResponsibilitySemanticDetailsV1 => ({
  completionCriteria: [],
  constraints: [],
  pendingProposals: [],
  agreedFacts: [],
  uncertainties: [],
  riskDetails: [],
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertKeys(
  value: Record<string, unknown>,
  allowed: readonly string[],
  path: string,
): void {
  const allowedSet = new Set(allowed);
  for (const key of Object.keys(value)) {
    if (!allowedSet.has(key)) throw new Error(`${path}.${key} is unknown`);
  }
}

function assertString(value: unknown, path: string): asserts value is string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${path} must be a non-empty string`);
  }
}

function assertBoolean(value: unknown, path: string): asserts value is boolean {
  if (typeof value !== "boolean") throw new Error(`${path} must be boolean`);
}

function assertArray(value: unknown, path: string): asserts value is unknown[] {
  if (!Array.isArray(value)) throw new Error(`${path} must be an array`);
}

function assertStatus(
  value: unknown,
  allowed: Set<string>,
  path: string,
): void {
  assertString(value, path);
  if (!allowed.has(value)) throw new Error(`${path} has an unknown status`);
}

function assertOptionalString(value: unknown, path: string): void {
  if (value !== undefined) assertString(value, path);
}

function assertValue(value: unknown, path: string): void {
  if (isRecord(value)) {
    for (const [key, nested] of Object.entries(value)) {
      if (key === "password" || key === "accessToken" || key === "refreshToken") {
        throw new Error(`${path} contains credential material`);
      }
      assertValue(nested, `${path}.${key}`);
    }
  } else if (Array.isArray(value)) {
    value.forEach((nested, index) => assertValue(nested, `${path}[${index}]`));
  }
}

/**
 * Narrow proof validator for the candidate's typed JSON boundary. This is a
 * proof-harness choice, not a production validation-library decision.
 */
export function assertSemanticDetails(
  value: unknown,
  version: number,
): asserts value is ResponsibilitySemanticDetailsV1 {
  if (version !== 1) throw new Error(`unsupported semantic details version ${version}`);
  if (!isRecord(value)) throw new Error("semantic details must be an object");
  assertKeys(value, [...topLevelKeys], "semanticDetails");

  const arrays = [
    "completionCriteria",
    "constraints",
    "pendingProposals",
    "agreedFacts",
    "uncertainties",
    "riskDetails",
  ] as const;
  for (const key of arrays) assertArray(value[key], `semanticDetails.${key}`);

  const details = value as unknown as ResponsibilitySemanticDetailsV1;

  const ids = new Set<string>();
  const registerId = (raw: unknown, path: string): string => {
    assertString(raw, path);
    if (ids.has(raw)) throw new Error(`${path} duplicates local id ${raw}`);
    ids.add(raw);
    return raw;
  };

  details.completionCriteria.forEach((raw, index) => {
    const path = `completionCriteria[${index}]`;
    if (!isRecord(raw)) throw new Error(`${path} must be an object`);
    assertKeys(raw, ["id", "code", "summary", "status", "satisfiedAt"], path);
    registerId(raw.id, `${path}.id`);
    assertString(raw.code, `${path}.code`);
    assertOptionalString(raw.summary, `${path}.summary`);
    assertStatus(raw.status, statuses.criterion, `${path}.status`);
    assertOptionalString(raw.satisfiedAt, `${path}.satisfiedAt`);
    if (raw.status === "SATISFIED" && raw.satisfiedAt === undefined) {
      throw new Error(`${path}.satisfiedAt is required for SATISFIED`);
    }
  });

  details.constraints.forEach((raw, index) => {
    const path = `constraints[${index}]`;
    if (!isRecord(raw)) throw new Error(`${path} must be an object`);
    assertKeys(raw, ["id", "code", "summary", "status", "conditionRef"], path);
    registerId(raw.id, `${path}.id`);
    assertString(raw.code, `${path}.code`);
    assertOptionalString(raw.summary, `${path}.summary`);
    assertStatus(raw.status, statuses.constraint, `${path}.status`);
    if (raw.conditionRef !== undefined) {
      if (!isRecord(raw.conditionRef)) throw new Error(`${path}.conditionRef must be an object`);
      assertKeys(raw.conditionRef, ["kind", "id", "code"], `${path}.conditionRef`);
      assertStatus(raw.conditionRef.kind, new Set(["EXPECTED_EVENT", "OTHER"]), `${path}.conditionRef.kind`);
      assertOptionalString(raw.conditionRef.id, `${path}.conditionRef.id`);
      assertOptionalString(raw.conditionRef.code, `${path}.conditionRef.code`);
    }
  });

  details.pendingProposals.forEach((raw, index) => {
    const path = `pendingProposals[${index}]`;
    if (!isRecord(raw)) throw new Error(`${path} must be an object`);
    assertKeys(raw, ["id", "kind", "value", "status"], path);
    registerId(raw.id, `${path}.id`);
    assertString(raw.kind, `${path}.kind`);
    assertValue(raw.value, `${path}.value`);
    assertStatus(raw.status, statuses.proposal, `${path}.status`);
  });

  details.agreedFacts.forEach((raw, index) => {
    const path = `agreedFacts[${index}]`;
    if (!isRecord(raw)) throw new Error(`${path} must be an object`);
    assertKeys(raw, ["id", "kind", "value", "status"], path);
    registerId(raw.id, `${path}.id`);
    assertString(raw.kind, `${path}.kind`);
    assertValue(raw.value, `${path}.value`);
    assertStatus(raw.status, statuses.fact, `${path}.status`);
  });

  details.uncertainties.forEach((raw, index) => {
    const path = `uncertainties[${index}]`;
    if (!isRecord(raw)) throw new Error(`${path} must be an object`);
    assertKeys(raw, ["id", "fieldKey", "reasonCode", "material", "reviewRequired", "candidateRefs"], path);
    registerId(raw.id, `${path}.id`);
    assertString(raw.fieldKey, `${path}.fieldKey`);
    assertString(raw.reasonCode, `${path}.reasonCode`);
    assertBoolean(raw.material, `${path}.material`);
    assertBoolean(raw.reviewRequired, `${path}.reviewRequired`);
    if (raw.candidateRefs !== undefined) {
      assertArray(raw.candidateRefs, `${path}.candidateRefs`);
      raw.candidateRefs.forEach((candidate, candidateIndex) =>
        assertString(candidate, `${path}.candidateRefs[${candidateIndex}]`),
      );
    }
  });

  if (details.assignmentSemantics !== undefined) {
    const path = "assignmentSemantics";
    if (!isRecord(details.assignmentSemantics)) throw new Error(`${path} must be an object`);
    assertKeys(details.assignmentSemantics, ["id", "shape", "candidateParticipantIds", "selectedParticipantId"], path);
    registerId(details.assignmentSemantics.id, `${path}.id`);
    assertStatus(details.assignmentSemantics.shape, statuses.assignment, `${path}.shape`);
    assertArray(details.assignmentSemantics.candidateParticipantIds, `${path}.candidateParticipantIds`);
    details.assignmentSemantics.candidateParticipantIds.forEach((candidate, index) =>
      assertString(candidate, `${path}.candidateParticipantIds[${index}]`),
    );
    assertOptionalString(details.assignmentSemantics.selectedParticipantId, `${path}.selectedParticipantId`);
    if (
      details.assignmentSemantics.shape === "ANY_OF" &&
      details.assignmentSemantics.selectedParticipantId !== undefined &&
      !details.assignmentSemantics.candidateParticipantIds.includes(
        details.assignmentSemantics.selectedParticipantId,
      )
    ) {
      throw new Error(`${path}.selectedParticipantId is not a candidate`);
    }
  }

  details.riskDetails.forEach((raw, index) => {
    const path = `riskDetails[${index}]`;
    if (!isRecord(raw)) throw new Error(`${path} must be an object`);
    assertKeys(raw, ["id", "targetKind", "targetId", "riskClass", "reasonCode"], path);
    registerId(raw.id, `${path}.id`);
    assertString(raw.targetKind, `${path}.targetKind`);
    assertOptionalString(raw.targetId, `${path}.targetId`);
    assertStatus(raw.riskClass, statuses.risk, `${path}.riskClass`);
    assertString(raw.reasonCode, `${path}.reasonCode`);
  });
}

export function requiredLegsForDetails(
  details: ResponsibilitySemanticDetailsV1,
): string[] {
  assertSemanticDetails(details, 1);
  if (
    details.assignmentSemantics?.shape === "ANY_OF" &&
    details.assignmentSemantics.selectedParticipantId === undefined
  ) {
    return [];
  }
  return details.completionCriteria
    .filter((criterion) => criterion.status === "PENDING")
    .map((criterion) => criterion.id);
}

export function promoteProposal(
  details: ResponsibilitySemanticDetailsV1,
  proposalId: string,
  evidence: { reducerEffect: boolean; evidenceRef?: string },
): ResponsibilitySemanticDetailsV1 {
  assertSemanticDetails(details, 1);
  if (!evidence.reducerEffect || !evidence.evidenceRef) return details;
  const proposal = details.pendingProposals.find(({ id }) => id === proposalId);
  if (!proposal) throw new Error(`unknown proposal ${proposalId}`);
  return {
    ...details,
    pendingProposals: details.pendingProposals.map((item) =>
      item.id === proposalId ? { ...item, status: "SUPERSEDED" as const } : item,
    ),
    agreedFacts: [
      ...details.agreedFacts,
      {
        id: `fact:${proposalId}`,
        kind: proposal.kind,
        value: proposal.value,
        status: "CURRENT" as const,
      },
    ],
  };
}
