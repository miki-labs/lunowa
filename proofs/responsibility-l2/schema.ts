import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  date,
  foreignKey,
  index,
  integer,
  jsonb,
  pgTable,
  smallint,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * The six p13_fixture_* tables are deliberately support-only tables. They
 * provide the current external keys needed to instantiate the L2 candidate;
 * they are not production migration targets or schema ownership claims.
 */
export const fixtureUsers = pgTable("p13_fixture_users", {
  id: uuid("id")
    .default(sql`pg_catalog.gen_random_uuid()`)
    .primaryKey(),
});

export const fixtureConnectedAccounts = pgTable(
  "p13_fixture_connected_accounts",
  {
    id: uuid("id")
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    userId: uuid("user_id").notNull(),
  },
  (table) => [
    unique("p13_fixture_connected_accounts_id_user_uq").on(
      table.id,
      table.userId,
    ),
    foreignKey({
      name: "p13_fixture_connected_accounts_user_fk",
      columns: [table.userId],
      foreignColumns: [fixtureUsers.id],
    }).onDelete("cascade"),
  ],
);

export const fixtureConversations = pgTable(
  "p13_fixture_conversations",
  {
    id: uuid("id")
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    connectedAccountId: uuid("connected_account_id").notNull(),
    semanticEvidenceRevision: bigint("semantic_evidence_revision", {
      mode: "number",
    })
      .notNull()
      .default(0),
    uiReadAt: timestamp("ui_read_at", {
      withTimezone: true,
      precision: 3,
    }),
  },
  (table) => [
    unique("p13_fixture_conversations_id_account_uq").on(
      table.id,
      table.connectedAccountId,
    ),
    foreignKey({
      name: "p13_fixture_conversations_account_fk",
      columns: [table.connectedAccountId],
      foreignColumns: [fixtureConnectedAccounts.id],
    }).onDelete("cascade"),
    check(
      "p13_fixture_conversations_revision_nonnegative",
      sql`${table.semanticEvidenceRevision} >= 0`,
    ),
  ],
);

export const fixtureParticipantIdentities = pgTable(
  "p13_fixture_participant_identities",
  {
    id: uuid("id")
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    userId: uuid("user_id").notNull(),
  },
  (table) => [
    unique("p13_fixture_participants_id_user_uq").on(
      table.id,
      table.userId,
    ),
    foreignKey({
      name: "p13_fixture_participants_user_fk",
      columns: [table.userId],
      foreignColumns: [fixtureUsers.id],
    }).onDelete("cascade"),
  ],
);

export const fixtureMessages = pgTable(
  "p13_fixture_messages",
  {
    id: uuid("id")
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    connectedAccountId: uuid("connected_account_id").notNull(),
    conversationId: uuid("conversation_id").notNull(),
    evidenceRevision: bigint("evidence_revision", { mode: "number" })
      .notNull()
      .default(0),
    contentMarker: text("content_marker").notNull(),
  },
  (table) => [
    unique("p13_fixture_messages_id_account_uq").on(
      table.id,
      table.connectedAccountId,
    ),
    foreignKey({
      name: "p13_fixture_messages_account_fk",
      columns: [table.connectedAccountId],
      foreignColumns: [fixtureConnectedAccounts.id],
    }).onDelete("cascade"),
    foreignKey({
      name: "p13_fixture_messages_conversation_account_fk",
      columns: [table.conversationId, table.connectedAccountId],
      foreignColumns: [
        fixtureConversations.id,
        fixtureConversations.connectedAccountId,
      ],
    }).onDelete("cascade"),
  ],
);

export const fixtureAiInterpretationRuns = pgTable(
  "p13_fixture_ai_interpretation_runs",
  {
    id: uuid("id")
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    userId: uuid("user_id").notNull(),
    basisEvidenceRevision: bigint("basis_evidence_revision", {
      mode: "number",
    }).notNull(),
    contextManifest: jsonb("context_manifest")
      .$type<{ messageIds: string[] }>()
      .notNull()
      .default(sql`'{"messageIds":[]}'::jsonb`),
  },
  (table) => [
    unique("p13_fixture_ai_runs_id_user_uq").on(table.id, table.userId),
    foreignKey({
      name: "p13_fixture_ai_runs_user_fk",
      columns: [table.userId],
      foreignColumns: [fixtureUsers.id],
    }).onDelete("cascade"),
    check(
      "p13_fixture_ai_runs_revision_nonnegative",
      sql`${table.basisEvidenceRevision} >= 0`,
    ),
  ],
);

export type ResponsibilitySemanticDetailsV1 = {
  completionCriteria: Array<{
    id: string;
    code: string;
    summary?: string;
    status: "PENDING" | "SATISFIED" | "WAIVED";
    satisfiedAt?: string;
  }>;
  constraints: Array<{
    id: string;
    code: string;
    summary?: string;
    status: "ACTIVE" | "SATISFIED" | "CANCELLED" | "SUPERSEDED";
    conditionRef?: {
      kind: "EXPECTED_EVENT" | "OTHER";
      id?: string;
      code?: string;
    };
  }>;
  pendingProposals: Array<{
    id: string;
    kind: string;
    value: unknown;
    status: "PENDING" | "REJECTED" | "SUPERSEDED";
  }>;
  agreedFacts: Array<{
    id: string;
    kind: string;
    value: unknown;
    status: "CURRENT" | "SUPERSEDED";
  }>;
  uncertainties: Array<{
    id: string;
    fieldKey: string;
    reasonCode: string;
    material: boolean;
    reviewRequired: boolean;
    candidateRefs?: string[];
  }>;
  assignmentSemantics?: {
    id: string;
    shape: "ANY_OF" | "ALL_OF" | "UNSPECIFIED_GROUP";
    candidateParticipantIds: string[];
    selectedParticipantId?: string;
  };
  riskDetails: Array<{
    id: string;
    targetKind: string;
    targetId?: string;
    riskClass: "LOW" | "NORMAL" | "HIGH" | "CRITICAL";
    reasonCode: string;
  }>;
};

const instant = () =>
  timestamp("created_at", { withTimezone: true, precision: 3 })
    .notNull()
    .defaultNow();
const updatedInstant = () =>
  timestamp("updated_at", { withTimezone: true, precision: 3 })
    .notNull()
    .defaultNow();
const revision = (name: string) => bigint(name, { mode: "number" });
const jsonObjectDefault = sql`'{}'::jsonb`;

export const responsibilities = pgTable(
  "responsibilities",
  {
    id: uuid("id")
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    userId: uuid("user_id").notNull(),
    connectedAccountId: uuid("connected_account_id").notNull(),
    conversationId: uuid("conversation_id").notNull(),
    operationalOutcome: text("operational_outcome").notNull(),
    resolutionStatus: text("resolution_status").notNull().default("OPEN"),
    resolutionReason: text("resolution_reason"),
    liveTrackingState: text("live_tracking_state")
      .notNull()
      .default("TRACKING_ACTIVE"),
    attentionMode: text("attention_mode").notNull().default("PRESENT"),
    semanticDetailsVersion: smallint("semantic_details_version")
      .notNull()
      .default(1),
    semanticDetails: jsonb("semantic_details")
      .$type<ResponsibilitySemanticDetailsV1>()
      .notNull()
      .default(jsonObjectDefault),
    acceptedEvidenceRevision: revision("accepted_evidence_revision")
      .notNull(),
    aggregateVersion: revision("aggregate_version").notNull().default(1),
    resolvedAt: timestamp("resolved_at", {
      withTimezone: true,
      precision: 3,
    }),
    createdAt: instant(),
    updatedAt: updatedInstant(),
  },
  (table) => [
    unique("responsibilities_id_user_uq").on(table.id, table.userId),
    unique("responsibilities_id_account_uq").on(
      table.id,
      table.connectedAccountId,
    ),
    foreignKey({
      name: "responsibilities_account_owner_fk",
      columns: [table.connectedAccountId, table.userId],
      foreignColumns: [
        fixtureConnectedAccounts.id,
        fixtureConnectedAccounts.userId,
      ],
    }).onDelete("restrict"),
    foreignKey({
      name: "responsibilities_conversation_account_fk",
      columns: [table.conversationId, table.connectedAccountId],
      foreignColumns: [
        fixtureConversations.id,
        fixtureConversations.connectedAccountId,
      ],
    }).onDelete("restrict"),
    check(
      "responsibilities_operational_outcome_nonempty",
      sql`char_length(btrim(${table.operationalOutcome})) BETWEEN 1 AND 2048`,
    ),
    check(
      "responsibilities_resolution_status_check",
      sql`${table.resolutionStatus} IN ('OPEN', 'RESOLVED')`,
    ),
    check(
      "responsibilities_resolution_reason_check",
      sql`${table.resolutionReason} IS NULL OR ${table.resolutionReason} IN ('SATISFIED', 'DECLINED', 'CANCELLED', 'SUPERSEDED', 'USER_CLOSED', 'INVALIDATED', 'DUPLICATE')`,
    ),
    check(
      "responsibilities_resolution_consistency_check",
      sql`(${table.resolutionStatus} = 'OPEN' AND ${table.resolutionReason} IS NULL AND ${table.resolvedAt} IS NULL) OR (${table.resolutionStatus} = 'RESOLVED' AND ${table.resolutionReason} IS NOT NULL AND ${table.resolvedAt} IS NOT NULL)`,
    ),
    check(
      "responsibilities_live_tracking_state_check",
      sql`${table.liveTrackingState} IN ('TRACKING_ACTIVE', 'HISTORICAL_INACTIVE')`,
    ),
    check(
      "responsibilities_attention_mode_check",
      sql`${table.attentionMode} IN ('PRESENT', 'DEFERRED')`,
    ),
    check(
      "responsibilities_deferred_state_check",
      sql`${table.attentionMode} <> 'DEFERRED' OR (${table.resolutionStatus} = 'OPEN' AND ${table.liveTrackingState} = 'TRACKING_ACTIVE')`,
    ),
    check(
      "responsibilities_historical_attention_check",
      sql`${table.liveTrackingState} <> 'HISTORICAL_INACTIVE' OR ${table.attentionMode} = 'PRESENT'`,
    ),
    check(
      "responsibilities_semantic_details_version_check",
      sql`${table.semanticDetailsVersion} >= 1`,
    ),
    check(
      "responsibilities_semantic_details_object_check",
      sql`jsonb_typeof(${table.semanticDetails}) = 'object'`,
    ),
    check(
      "responsibilities_accepted_evidence_revision_check",
      sql`${table.acceptedEvidenceRevision} >= 0`,
    ),
    check(
      "responsibilities_aggregate_version_check",
      sql`${table.aggregateVersion} >= 1`,
    ),
    index("responsibilities_live_open_user_idx")
      .on(table.userId, table.updatedAt, table.id)
      .where(
        sql`${table.liveTrackingState} = 'TRACKING_ACTIVE' AND ${table.resolutionStatus} = 'OPEN'`,
      ),
    index("responsibilities_live_done_user_idx")
      .on(table.userId, table.resolvedAt, table.id)
      .where(
        sql`${table.liveTrackingState} = 'TRACKING_ACTIVE' AND ${table.resolutionStatus} = 'RESOLVED'`,
      ),
    index("responsibilities_conversation_idx").on(
      table.conversationId,
      table.createdAt,
      table.id,
    ),
    index("responsibilities_account_updated_idx").on(
      table.connectedAccountId,
      table.updatedAt,
      table.id,
    ),
  ],
);

export const responsibilityExpectedEvents = pgTable(
  "responsibility_expected_events",
  {
    id: uuid("id")
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    responsibilityId: uuid("responsibility_id").notNull(),
    userId: uuid("user_id").notNull(),
    actorKind: text("actor_kind").notNull(),
    actorParticipantId: uuid("actor_participant_id"),
    eventCode: text("event_code").notNull(),
    eventSummary: text("event_summary"),
    eventStatus: text("event_status").notNull().default("PENDING"),
    closureReason: text("closure_reason"),
    basisKind: text("basis_kind"),
    expectationStrength: text("expectation_strength"),
    satisfiedAt: timestamp("satisfied_at", {
      withTimezone: true,
      precision: 3,
    }),
    closedAt: timestamp("closed_at", { withTimezone: true, precision: 3 }),
    createdAt: instant(),
    updatedAt: updatedInstant(),
  },
  (table) => [
    unique("responsibility_expected_events_id_parent_uq").on(
      table.id,
      table.responsibilityId,
    ),
    foreignKey({
      name: "responsibility_expected_events_parent_user_fk",
      columns: [table.responsibilityId, table.userId],
      foreignColumns: [responsibilities.id, responsibilities.userId],
    }).onDelete("cascade"),
    foreignKey({
      name: "responsibility_expected_events_participant_user_fk",
      columns: [table.actorParticipantId, table.userId],
      foreignColumns: [
        fixtureParticipantIdentities.id,
        fixtureParticipantIdentities.userId,
      ],
    }).onDelete("restrict"),
    check(
      "responsibility_expected_events_actor_kind_check",
      sql`${table.actorKind} IN ('PARTICIPANT', 'EXTERNAL')`,
    ),
    check(
      "responsibility_expected_events_actor_reference_check",
      sql`(${table.actorKind} = 'PARTICIPANT' AND ${table.actorParticipantId} IS NOT NULL) OR (${table.actorKind} = 'EXTERNAL' AND ${table.actorParticipantId} IS NULL)`,
    ),
    check(
      "responsibility_expected_events_status_check",
      sql`${table.eventStatus} IN ('PENDING', 'CLOSED')`,
    ),
    check(
      "responsibility_expected_events_closure_check",
      sql`(${table.eventStatus} = 'PENDING' AND ${table.closureReason} IS NULL AND ${table.satisfiedAt} IS NULL AND ${table.closedAt} IS NULL) OR (${table.eventStatus} = 'CLOSED' AND ${table.closureReason} IS NOT NULL AND ${table.closedAt} IS NOT NULL AND (${table.satisfiedAt} IS NULL OR ${table.closureReason} = 'SATISFIED'))`,
    ),
    check(
      "responsibility_expected_events_event_code_nonempty",
      sql`char_length(btrim(${table.eventCode})) BETWEEN 1 AND 128`,
    ),
    check(
      "responsibility_expected_events_summary_length",
      sql`${table.eventSummary} IS NULL OR char_length(${table.eventSummary}) <= 1024`,
    ),
    index("responsibility_expected_events_pending_idx")
      .on(table.responsibilityId, table.actorKind, table.id)
      .where(sql`${table.eventStatus} = 'PENDING'`),
    index("responsibility_expected_events_actor_idx")
      .on(table.actorParticipantId, table.responsibilityId)
      .where(sql`${table.actorParticipantId} IS NOT NULL`),
  ],
);

export const responsibilityObligationLegs = pgTable(
  "responsibility_obligation_legs",
  {
    id: uuid("id")
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    responsibilityId: uuid("responsibility_id").notNull(),
    userId: uuid("user_id").notNull(),
    bearerKind: text("bearer_kind").notNull(),
    bearerParticipantId: uuid("bearer_participant_id"),
    actionCode: text("action_code").notNull(),
    actionSummary: text("action_summary"),
    objectSummary: text("object_summary"),
    legStatus: text("leg_status").notNull().default("OPEN"),
    closureReason: text("closure_reason"),
    actionability: text("actionability").notNull().default("ACTIONABLE"),
    basisKind: text("basis_kind").notNull(),
    authorityStatus: text("authority_status"),
    activationEventId: uuid("activation_event_id"),
    closedAt: timestamp("closed_at", { withTimezone: true, precision: 3 }),
    createdAt: instant(),
    updatedAt: updatedInstant(),
  },
  (table) => [
    unique("responsibility_obligation_legs_id_parent_uq").on(
      table.id,
      table.responsibilityId,
    ),
    foreignKey({
      name: "responsibility_obligation_legs_parent_user_fk",
      columns: [table.responsibilityId, table.userId],
      foreignColumns: [responsibilities.id, responsibilities.userId],
    }).onDelete("cascade"),
    foreignKey({
      name: "responsibility_obligation_legs_participant_user_fk",
      columns: [table.bearerParticipantId, table.userId],
      foreignColumns: [
        fixtureParticipantIdentities.id,
        fixtureParticipantIdentities.userId,
      ],
    }).onDelete("restrict"),
    foreignKey({
      name: "responsibility_obligation_legs_activation_event_parent_fk",
      columns: [table.activationEventId, table.responsibilityId],
      foreignColumns: [
        responsibilityExpectedEvents.id,
        responsibilityExpectedEvents.responsibilityId,
      ],
    }).onDelete("no action"),
    check(
      "responsibility_obligation_legs_bearer_kind_check",
      sql`${table.bearerKind} IN ('USER', 'PARTICIPANT')`,
    ),
    check(
      "responsibility_obligation_legs_bearer_reference_check",
      sql`(${table.bearerKind} = 'USER' AND ${table.bearerParticipantId} IS NULL) OR (${table.bearerKind} = 'PARTICIPANT' AND ${table.bearerParticipantId} IS NOT NULL)`,
    ),
    check(
      "responsibility_obligation_legs_status_check",
      sql`${table.legStatus} IN ('OPEN', 'CLOSED')`,
    ),
    check(
      "responsibility_obligation_legs_closure_check",
      sql`(${table.legStatus} = 'OPEN' AND ${table.closureReason} IS NULL AND ${table.closedAt} IS NULL) OR (${table.legStatus} = 'CLOSED' AND ${table.closureReason} IS NOT NULL AND ${table.closedAt} IS NOT NULL)`,
    ),
    check(
      "responsibility_obligation_legs_actionability_check",
      sql`${table.actionability} IN ('ACTIONABLE', 'BLOCKED')`,
    ),
    check(
      "responsibility_obligation_legs_action_code_nonempty",
      sql`char_length(btrim(${table.actionCode})) BETWEEN 1 AND 128`,
    ),
    check(
      "responsibility_obligation_legs_basis_kind_nonempty",
      sql`char_length(btrim(${table.basisKind})) BETWEEN 1 AND 128`,
    ),
    check(
      "responsibility_obligation_legs_summary_length",
      sql`${table.actionSummary} IS NULL OR char_length(${table.actionSummary}) <= 1024`,
    ),
    check(
      "responsibility_obligation_legs_object_length",
      sql`${table.objectSummary} IS NULL OR char_length(${table.objectSummary}) <= 1024`,
    ),
    index("responsibility_obligation_legs_open_projection_idx")
      .on(
        table.responsibilityId,
        table.bearerKind,
        table.actionability,
        table.id,
      )
      .where(sql`${table.legStatus} = 'OPEN'`),
    index("responsibility_obligation_legs_activation_event_idx")
      .on(table.activationEventId, table.responsibilityId)
      .where(sql`${table.activationEventId} IS NOT NULL`),
    index("responsibility_obligation_legs_participant_idx")
      .on(table.bearerParticipantId, table.responsibilityId)
      .where(sql`${table.bearerParticipantId} IS NOT NULL`),
  ],
);

export const responsibilityTemporalFacts = pgTable(
  "responsibility_temporal_facts",
  {
    id: uuid("id")
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    responsibilityId: uuid("responsibility_id")
      .notNull()
      .references(() => responsibilities.id, { onDelete: "cascade" }),
    temporalKind: text("temporal_kind").notNull(),
    obligationLegId: uuid("obligation_leg_id"),
    expectedEventId: uuid("expected_event_id"),
    originalExpression: text("original_expression"),
    valueKind: text("value_kind").notNull(),
    resolvedDate: date("resolved_date", { mode: "string" }),
    resolvedAt: timestamp("resolved_at", { withTimezone: true, precision: 3 }),
    precisionCode: text("precision_code").notNull(),
    referenceTimezone: text("reference_timezone"),
    anchorKind: text("anchor_kind"),
    anchorReference: text("anchor_reference"),
    anchorOffsetSeconds: integer("anchor_offset_seconds"),
    currentnessStatus: text("currentness_status")
      .notNull()
      .default("ACCEPTED_CURRENT"),
    authorityStatus: text("authority_status"),
    supersededAt: timestamp("superseded_at", {
      withTimezone: true,
      precision: 3,
    }),
    createdAt: instant(),
    updatedAt: updatedInstant(),
  },
  (table) => [
    foreignKey({
      name: "responsibility_temporal_facts_leg_parent_fk",
      columns: [table.obligationLegId, table.responsibilityId],
      foreignColumns: [
        responsibilityObligationLegs.id,
        responsibilityObligationLegs.responsibilityId,
      ],
    }).onDelete("no action"),
    foreignKey({
      name: "responsibility_temporal_facts_event_parent_fk",
      columns: [table.expectedEventId, table.responsibilityId],
      foreignColumns: [
        responsibilityExpectedEvents.id,
        responsibilityExpectedEvents.responsibilityId,
      ],
    }).onDelete("no action"),
    check(
      "responsibility_temporal_facts_kind_check",
      sql`${table.temporalKind} IN ('SOURCE_DUE', 'EXPECTED_EVENT_TIME', 'USER_TARGET')`,
    ),
    check(
      "responsibility_temporal_facts_single_target_check",
      sql`NOT (${table.obligationLegId} IS NOT NULL AND ${table.expectedEventId} IS NOT NULL)`,
    ),
    check(
      "responsibility_temporal_facts_value_kind_check",
      sql`${table.valueKind} IN ('DATE', 'INSTANT', 'UNRESOLVED')`,
    ),
    check(
      "responsibility_temporal_facts_value_shape_check",
      sql`(${table.valueKind} = 'DATE' AND ${table.resolvedDate} IS NOT NULL AND ${table.resolvedAt} IS NULL) OR (${table.valueKind} = 'INSTANT' AND ${table.resolvedDate} IS NULL AND ${table.resolvedAt} IS NOT NULL) OR (${table.valueKind} = 'UNRESOLVED' AND ${table.resolvedDate} IS NULL AND ${table.resolvedAt} IS NULL)`,
    ),
    check(
      "responsibility_temporal_facts_original_expression_length",
      sql`${table.originalExpression} IS NULL OR char_length(${table.originalExpression}) <= 512`,
    ),
    check(
      "responsibility_temporal_facts_precision_nonempty",
      sql`char_length(btrim(${table.precisionCode})) BETWEEN 1 AND 64`,
    ),
    check(
      "responsibility_temporal_facts_currentness_check",
      sql`${table.currentnessStatus} IN ('ACCEPTED_CURRENT', 'CONFLICT_CANDIDATE', 'SUPERSEDED', 'HISTORICAL')`,
    ),
    check(
      "responsibility_temporal_facts_superseded_time_check",
      sql`(${table.currentnessStatus} = 'SUPERSEDED' AND ${table.supersededAt} IS NOT NULL) OR (${table.currentnessStatus} <> 'SUPERSEDED' AND ${table.supersededAt} IS NULL)`,
    ),
    check(
      "responsibility_temporal_facts_anchor_shape_check",
      sql`(${table.anchorKind} IS NULL AND ${table.anchorReference} IS NULL AND ${table.anchorOffsetSeconds} IS NULL) OR (${table.anchorKind} IS NOT NULL AND ${table.anchorReference} IS NOT NULL)`,
    ),
    uniqueIndex("responsibility_temporal_current_parent_uq")
      .on(table.responsibilityId, table.temporalKind)
      .where(
        sql`${table.currentnessStatus} = 'ACCEPTED_CURRENT' AND ${table.obligationLegId} IS NULL AND ${table.expectedEventId} IS NULL`,
      ),
    uniqueIndex("responsibility_temporal_current_leg_uq")
      .on(table.responsibilityId, table.temporalKind, table.obligationLegId)
      .where(
        sql`${table.currentnessStatus} = 'ACCEPTED_CURRENT' AND ${table.obligationLegId} IS NOT NULL AND ${table.expectedEventId} IS NULL`,
      ),
    uniqueIndex("responsibility_temporal_current_event_uq")
      .on(table.responsibilityId, table.temporalKind, table.expectedEventId)
      .where(
        sql`${table.currentnessStatus} = 'ACCEPTED_CURRENT' AND ${table.expectedEventId} IS NOT NULL AND ${table.obligationLegId} IS NULL`,
      ),
    index("responsibility_temporal_current_date_idx")
      .on(table.temporalKind, table.resolvedDate, table.responsibilityId)
      .where(
        sql`${table.currentnessStatus} = 'ACCEPTED_CURRENT' AND ${table.valueKind} = 'DATE'`,
      ),
    index("responsibility_temporal_current_instant_idx")
      .on(table.temporalKind, table.resolvedAt, table.responsibilityId)
      .where(
        sql`${table.currentnessStatus} = 'ACCEPTED_CURRENT' AND ${table.valueKind} = 'INSTANT'`,
      ),
    index("responsibility_temporal_conflict_idx")
      .on(table.responsibilityId, table.temporalKind, table.id)
      .where(sql`${table.currentnessStatus} = 'CONFLICT_CANDIDATE'`),
  ],
);

export const responsibilityFieldDecisions = pgTable(
  "responsibility_field_decisions",
  {
    id: uuid("id")
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    responsibilityId: uuid("responsibility_id")
      .notNull()
      .references(() => responsibilities.id, { onDelete: "cascade" }),
    fieldKey: text("field_key").notNull(),
    valueSchemaVersion: smallint("value_schema_version").notNull().default(1),
    valueJsonb: jsonb("value_jsonb").notNull(),
    authorityKind: text("authority_kind").notNull(),
    basisEvidenceRevision: revision("basis_evidence_revision").notNull(),
    decisionStatus: text("decision_status").notNull().default("ACTIVE"),
    supersededAt: timestamp("superseded_at", {
      withTimezone: true,
      precision: 3,
    }),
    createdAt: instant(),
  },
  (table) => [
    check(
      "responsibility_field_decisions_field_key_nonempty",
      sql`char_length(btrim(${table.fieldKey})) BETWEEN 1 AND 128`,
    ),
    check(
      "responsibility_field_decisions_value_version_check",
      sql`${table.valueSchemaVersion} >= 1`,
    ),
    check(
      "responsibility_field_decisions_basis_revision_check",
      sql`${table.basisEvidenceRevision} >= 0`,
    ),
    check(
      "responsibility_field_decisions_status_check",
      sql`${table.decisionStatus} IN ('ACTIVE', 'SUPERSEDED')`,
    ),
    check(
      "responsibility_field_decisions_superseded_check",
      sql`(${table.decisionStatus} = 'ACTIVE' AND ${table.supersededAt} IS NULL) OR (${table.decisionStatus} = 'SUPERSEDED' AND ${table.supersededAt} IS NOT NULL)`,
    ),
    uniqueIndex("responsibility_field_decisions_active_uq")
      .on(table.responsibilityId, table.fieldKey)
      .where(sql`${table.decisionStatus} = 'ACTIVE'`),
  ],
);

export const responsibilityAdmissionReviews = pgTable(
  "responsibility_admission_reviews",
  {
    id: uuid("id")
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    userId: uuid("user_id").notNull(),
    connectedAccountId: uuid("connected_account_id").notNull(),
    conversationId: uuid("conversation_id").notNull(),
    reviewStatus: text("review_status").notNull().default("OPEN"),
    resolution: text("resolution"),
    reasonCodes: text("reason_codes").array().notNull(),
    candidateSchemaVersion: smallint("candidate_schema_version")
      .notNull()
      .default(1),
    candidateSummary: jsonb("candidate_summary")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(jsonObjectDefault),
    basisEvidenceRevision: revision("basis_evidence_revision").notNull(),
    aggregateVersion: revision("aggregate_version").notNull().default(1),
    sourceEventKey: text("source_event_key").notNull(),
    candidateKey: text("candidate_key").notNull(),
    interpretationRunId: uuid("interpretation_run_id"),
    admittedResponsibilityId: uuid("admitted_responsibility_id"),
    resolvedByActorKind: text("resolved_by_actor_kind"),
    resolvedAt: timestamp("resolved_at", { withTimezone: true, precision: 3 }),
    createdAt: instant(),
    updatedAt: updatedInstant(),
  },
  (table) => [
    unique("responsibility_admission_reviews_id_account_uq").on(
      table.id,
      table.connectedAccountId,
    ),
    unique("responsibility_admission_reviews_id_user_uq").on(
      table.id,
      table.userId,
    ),
    unique("responsibility_admission_reviews_same_revision_uq").on(
      table.connectedAccountId,
      table.sourceEventKey,
      table.candidateKey,
      table.basisEvidenceRevision,
    ),
    uniqueIndex("responsibility_admission_reviews_open_source_candidate_uq")
      .on(table.connectedAccountId, table.sourceEventKey, table.candidateKey)
      .where(sql`${table.reviewStatus} = 'OPEN'`),
    foreignKey({
      name: "responsibility_admission_reviews_account_owner_fk",
      columns: [table.connectedAccountId, table.userId],
      foreignColumns: [
        fixtureConnectedAccounts.id,
        fixtureConnectedAccounts.userId,
      ],
    }).onDelete("restrict"),
    foreignKey({
      name: "responsibility_admission_reviews_conversation_account_fk",
      columns: [table.conversationId, table.connectedAccountId],
      foreignColumns: [
        fixtureConversations.id,
        fixtureConversations.connectedAccountId,
      ],
    }).onDelete("restrict"),
    foreignKey({
      name: "responsibility_admission_reviews_admitted_account_fk",
      columns: [table.admittedResponsibilityId, table.connectedAccountId],
      foreignColumns: [
        responsibilities.id,
        responsibilities.connectedAccountId,
      ],
    }).onDelete("restrict"),
    // Drizzle 0.45.2 exposes action-level SET NULL only. The design's
    // column-list SET NULL is therefore represented by NO ACTION; the proof
    // runner exercises explicit retention cleanup and preserves user_id.
    foreignKey({
      name: "responsibility_admission_reviews_interpretation_run_user_fk",
      columns: [table.interpretationRunId, table.userId],
      foreignColumns: [
        fixtureAiInterpretationRuns.id,
        fixtureAiInterpretationRuns.userId,
      ],
    }).onDelete("no action"),
    check(
      "responsibility_admission_reviews_status_check",
      sql`${table.reviewStatus} IN ('OPEN', 'RESOLVED')`,
    ),
    check(
      "responsibility_admission_reviews_resolution_check",
      sql`${table.resolution} IS NULL OR ${table.resolution} IN ('TRACK', 'DO_NOT_TRACK')`,
    ),
    check(
      "responsibility_admission_reviews_reason_codes_check",
      sql`cardinality(${table.reasonCodes}) >= 1`,
    ),
    check(
      "responsibility_admission_reviews_resolution_shape_check",
      sql`(${table.reviewStatus} = 'OPEN' AND ${table.resolution} IS NULL AND ${table.admittedResponsibilityId} IS NULL AND ${table.resolvedByActorKind} IS NULL AND ${table.resolvedAt} IS NULL) OR (${table.reviewStatus} = 'RESOLVED' AND ${table.resolution} = 'DO_NOT_TRACK' AND ${table.admittedResponsibilityId} IS NULL AND ${table.resolvedByActorKind} IS NOT NULL AND ${table.resolvedAt} IS NOT NULL) OR (${table.reviewStatus} = 'RESOLVED' AND ${table.resolution} = 'TRACK' AND ${table.admittedResponsibilityId} IS NOT NULL AND ${table.resolvedByActorKind} IS NOT NULL AND ${table.resolvedAt} IS NOT NULL)`,
    ),
    check(
      "responsibility_admission_reviews_candidate_object_check",
      sql`jsonb_typeof(${table.candidateSummary}) = 'object'`,
    ),
    check(
      "responsibility_admission_reviews_candidate_version_check",
      sql`${table.candidateSchemaVersion} >= 1`,
    ),
    check(
      "responsibility_admission_reviews_basis_revision_check",
      sql`${table.basisEvidenceRevision} >= 0`,
    ),
    check(
      "responsibility_admission_reviews_aggregate_version_check",
      sql`${table.aggregateVersion} >= 1`,
    ),
    check(
      "responsibility_admission_reviews_source_event_key_check",
      sql`char_length(btrim(${table.sourceEventKey})) BETWEEN 1 AND 256`,
    ),
    check(
      "responsibility_admission_reviews_candidate_key_check",
      sql`char_length(btrim(${table.candidateKey})) BETWEEN 1 AND 128`,
    ),
    index("responsibility_admission_reviews_open_user_idx")
      .on(table.userId, table.createdAt, table.id)
      .where(sql`${table.reviewStatus} = 'OPEN'`),
    index("responsibility_admission_reviews_conversation_idx").on(
      table.conversationId,
      table.createdAt,
      table.id,
    ),
  ],
);

export const responsibilityDomainEvents = pgTable(
  "responsibility_domain_events",
  {
    id: uuid("id")
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    responsibilityId: uuid("responsibility_id").notNull(),
    userId: uuid("user_id").notNull(),
    operation: text("operation").notNull(),
    actorKind: text("actor_kind").notNull(),
    reasonCodes: text("reason_codes").array().notNull(),
    basisEvidenceRevision: revision("basis_evidence_revision").notNull(),
    aggregateVersionBefore: revision("aggregate_version_before").notNull(),
    aggregateVersionAfter: revision("aggregate_version_after").notNull(),
    mutatesState: boolean("mutates_state").notNull(),
    sourceEventKey: text("source_event_key").notNull(),
    applicationKey: text("application_key").notNull(),
    effectKey: text("effect_key").notNull(),
    correlationId: uuid("correlation_id").notNull(),
    reducerVersion: text("reducer_version").notNull(),
    interpretationRunId: uuid("interpretation_run_id"),
    changeSummary: jsonb("change_summary")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(jsonObjectDefault),
    occurredAt: timestamp("occurred_at", {
      withTimezone: true,
      precision: 3,
    }).notNull().defaultNow(),
  },
  (table) => [
    unique("responsibility_domain_events_id_parent_uq").on(
      table.id,
      table.responsibilityId,
    ),
    uniqueIndex("responsibility_domain_events_application_effect_uq").on(
      table.applicationKey,
      table.effectKey,
    ),
    uniqueIndex("responsibility_domain_events_mutation_version_uq")
      .on(table.responsibilityId, table.aggregateVersionAfter)
      .where(sql`${table.mutatesState}`),
    foreignKey({
      name: "responsibility_domain_events_parent_user_fk",
      columns: [table.responsibilityId, table.userId],
      foreignColumns: [responsibilities.id, responsibilities.userId],
    }).onDelete("cascade"),
    foreignKey({
      name: "responsibility_domain_events_interpretation_run_user_fk",
      columns: [table.interpretationRunId, table.userId],
      foreignColumns: [
        fixtureAiInterpretationRuns.id,
        fixtureAiInterpretationRuns.userId,
      ],
    }).onDelete("no action"),
    check(
      "responsibility_domain_events_operation_check",
      sql`${table.operation} IN ('CREATE', 'UPDATE', 'RESOLVE', 'REOPEN', 'SUPERSEDE', 'INVALIDATE', 'NO_OP')`,
    ),
    check(
      "responsibility_domain_events_noop_shape_check",
      sql`(${table.mutatesState} AND ${table.operation} <> 'NO_OP') OR (NOT ${table.mutatesState} AND ${table.operation} = 'NO_OP')`,
    ),
    check(
      "responsibility_domain_events_reason_codes_check",
      sql`cardinality(${table.reasonCodes}) >= 1`,
    ),
    check(
      "responsibility_domain_events_revision_check",
      sql`${table.basisEvidenceRevision} >= 0`,
    ),
    check(
      "responsibility_domain_events_version_check",
      sql`${table.aggregateVersionBefore} >= 0 AND ${table.aggregateVersionAfter} >= 1 AND ((${table.mutatesState} AND ${table.aggregateVersionAfter} = ${table.aggregateVersionBefore} + 1) OR (NOT ${table.mutatesState} AND ${table.aggregateVersionAfter} = ${table.aggregateVersionBefore}))`,
    ),
    check(
      "responsibility_domain_events_actor_kind_check",
      sql`char_length(btrim(${table.actorKind})) BETWEEN 1 AND 64`,
    ),
    check(
      "responsibility_domain_events_source_key_check",
      sql`char_length(btrim(${table.sourceEventKey})) BETWEEN 1 AND 256`,
    ),
    check(
      "responsibility_domain_events_application_key_check",
      sql`char_length(btrim(${table.applicationKey})) BETWEEN 1 AND 128`,
    ),
    check(
      "responsibility_domain_events_effect_key_check",
      sql`char_length(btrim(${table.effectKey})) BETWEEN 1 AND 128`,
    ),
    check(
      "responsibility_domain_events_reducer_version_check",
      sql`char_length(btrim(${table.reducerVersion})) BETWEEN 1 AND 128`,
    ),
    check(
      "responsibility_domain_events_change_summary_object_check",
      sql`jsonb_typeof(${table.changeSummary}) = 'object'`,
    ),
    index("responsibility_domain_events_history_idx").on(
      table.responsibilityId,
      table.occurredAt,
      table.id,
    ),
    index("responsibility_domain_events_correlation_idx").on(
      table.correlationId,
      table.id,
    ),
    index("responsibility_domain_events_source_idx").on(
      table.sourceEventKey,
      table.occurredAt,
      table.id,
    ),
  ],
);

export const responsibilityProvenanceRefs = pgTable(
  "responsibility_provenance_refs",
  {
    id: uuid("id")
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    userId: uuid("user_id").notNull(),
    connectedAccountId: uuid("connected_account_id").notNull(),
    responsibilityId: uuid("responsibility_id"),
    admissionReviewId: uuid("admission_review_id"),
    targetKind: text("target_kind").notNull(),
    targetId: uuid("target_id"),
    fieldKey: text("field_key"),
    supportRole: text("support_role"),
    evidenceKind: text("evidence_kind").notNull(),
    messageId: uuid("message_id"),
    providerObservationKey: text("provider_observation_key"),
    interpretationRunId: uuid("interpretation_run_id"),
    domainEventId: uuid("domain_event_id"),
    sourceLocator: jsonb("source_locator")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(jsonObjectDefault),
    sourceExcerptShort: text("source_excerpt_short"),
    createdAt: instant(),
  },
  (table) => [
    foreignKey({
      name: "responsibility_provenance_refs_responsibility_user_fk",
      columns: [table.responsibilityId, table.userId],
      foreignColumns: [responsibilities.id, responsibilities.userId],
    }).onDelete("cascade"),
    foreignKey({
      name: "responsibility_provenance_refs_responsibility_account_fk",
      columns: [table.responsibilityId, table.connectedAccountId],
      foreignColumns: [
        responsibilities.id,
        responsibilities.connectedAccountId,
      ],
    }).onDelete("cascade"),
    foreignKey({
      name: "responsibility_provenance_refs_review_user_fk",
      columns: [table.admissionReviewId, table.userId],
      foreignColumns: [
        responsibilityAdmissionReviews.id,
        responsibilityAdmissionReviews.userId,
      ],
    }).onDelete("cascade"),
    foreignKey({
      name: "responsibility_provenance_refs_review_account_fk",
      columns: [table.admissionReviewId, table.connectedAccountId],
      foreignColumns: [
        responsibilityAdmissionReviews.id,
        responsibilityAdmissionReviews.connectedAccountId,
      ],
    }).onDelete("cascade"),
    foreignKey({
      name: "responsibility_provenance_refs_message_account_fk",
      columns: [table.messageId, table.connectedAccountId],
      foreignColumns: [
        fixtureMessages.id,
        fixtureMessages.connectedAccountId,
      ],
    }).onDelete("restrict"),
    foreignKey({
      name: "responsibility_provenance_refs_interpretation_run_user_fk",
      columns: [table.interpretationRunId, table.userId],
      foreignColumns: [
        fixtureAiInterpretationRuns.id,
        fixtureAiInterpretationRuns.userId,
      ],
    }).onDelete("no action"),
    foreignKey({
      name: "responsibility_provenance_refs_domain_event_parent_fk",
      columns: [table.domainEventId, table.responsibilityId],
      foreignColumns: [
        responsibilityDomainEvents.id,
        responsibilityDomainEvents.responsibilityId,
      ],
    }).onDelete("no action"),
    check(
      "responsibility_provenance_refs_owner_check",
      sql`(${table.responsibilityId} IS NOT NULL AND ${table.admissionReviewId} IS NULL) OR (${table.responsibilityId} IS NULL AND ${table.admissionReviewId} IS NOT NULL)`,
    ),
    check(
      "responsibility_provenance_refs_domain_event_owner_check",
      sql`${table.domainEventId} IS NULL OR ${table.responsibilityId} IS NOT NULL`,
    ),
    check(
      "responsibility_provenance_refs_target_kind_nonempty",
      sql`char_length(btrim(${table.targetKind})) BETWEEN 1 AND 128`,
    ),
    check(
      "responsibility_provenance_refs_evidence_kind_nonempty",
      sql`char_length(btrim(${table.evidenceKind})) BETWEEN 1 AND 128`,
    ),
    check(
      "responsibility_provenance_refs_evidence_present_check",
      sql`${table.messageId} IS NOT NULL OR ${table.providerObservationKey} IS NOT NULL OR ${table.interpretationRunId} IS NOT NULL OR ${table.domainEventId} IS NOT NULL`,
    ),
    check(
      "responsibility_provenance_refs_locator_object_check",
      sql`jsonb_typeof(${table.sourceLocator}) = 'object'`,
    ),
    check(
      "responsibility_provenance_refs_excerpt_length",
      sql`${table.sourceExcerptShort} IS NULL OR char_length(${table.sourceExcerptShort}) <= 512`,
    ),
    index("responsibility_provenance_refs_responsibility_idx")
      .on(table.responsibilityId, table.targetKind, table.targetId, table.id)
      .where(sql`${table.responsibilityId} IS NOT NULL`),
    index("responsibility_provenance_refs_review_idx")
      .on(table.admissionReviewId, table.id)
      .where(sql`${table.admissionReviewId} IS NOT NULL`),
    index("responsibility_provenance_refs_message_idx")
      .on(table.messageId, table.id)
      .where(sql`${table.messageId} IS NOT NULL`),
  ],
);

export const proofSchema = {
  fixtureUsers,
  fixtureConnectedAccounts,
  fixtureConversations,
  fixtureParticipantIdentities,
  fixtureMessages,
  fixtureAiInterpretationRuns,
  responsibilities,
  responsibilityExpectedEvents,
  responsibilityObligationLegs,
  responsibilityTemporalFacts,
  responsibilityFieldDecisions,
  responsibilityAdmissionReviews,
  responsibilityDomainEvents,
  responsibilityProvenanceRefs,
};

export const proofTableNames = [
  "responsibility_provenance_refs",
  "responsibility_domain_events",
  "responsibility_admission_reviews",
  "responsibility_field_decisions",
  "responsibility_temporal_facts",
  "responsibility_obligation_legs",
  "responsibility_expected_events",
  "responsibilities",
  "p13_fixture_ai_interpretation_runs",
  "p13_fixture_messages",
  "p13_fixture_participant_identities",
  "p13_fixture_conversations",
  "p13_fixture_connected_accounts",
  "p13_fixture_users",
] as const;

export const expectedResponsibilityTables = [
  "responsibilities",
  "responsibility_expected_events",
  "responsibility_obligation_legs",
  "responsibility_temporal_facts",
  "responsibility_field_decisions",
  "responsibility_admission_reviews",
  "responsibility_domain_events",
  "responsibility_provenance_refs",
] as const;
