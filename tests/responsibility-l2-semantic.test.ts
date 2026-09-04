import { describe, expect, it } from "vitest";
import {
  assertSemanticDetails,
  emptySemanticDetails,
  promoteProposal,
  requiredLegsForDetails,
} from "../proofs/responsibility-l2/semantic-details";

describe("Responsibility L2 semantic-details proof validator", () => {
  it("rejects unknown versions and malformed objects", () => {
    expect(() => assertSemanticDetails(emptySemanticDetails(), 2)).toThrow();
    expect(() => assertSemanticDetails({ completionCriteria: [] }, 1)).toThrow();
  });

  it("rejects duplicate local IDs", () => {
    expect(() =>
      assertSemanticDetails(
        {
          ...emptySemanticDetails(),
          completionCriteria: [{ id: "same", code: "a", status: "PENDING" }],
          agreedFacts: [{ id: "same", kind: "b", value: "value", status: "CURRENT" }],
        },
        1,
      ),
    ).toThrow();
  });

  it("does not fabricate a leg for unresolved ANY_OF", () => {
    const details = {
      ...emptySemanticDetails(),
      completionCriteria: [{ id: "criterion", code: "reply", status: "PENDING" as const }],
      assignmentSemantics: {
        id: "assignment",
        shape: "ANY_OF" as const,
        candidateParticipantIds: ["p1", "p2"],
      },
    };
    expect(requiredLegsForDetails(details)).toEqual([]);
  });

  it("keeps a proposal pending without reducer evidence", () => {
    const details = {
      ...emptySemanticDetails(),
      pendingProposals: [{ id: "proposal", kind: "due-date", value: "tomorrow", status: "PENDING" as const }],
    };
    const result = promoteProposal(details, "proposal", { reducerEffect: false });
    expect(result.pendingProposals[0]?.status).toBe("PENDING");
    expect(result.agreedFacts).toEqual([]);
  });
});
