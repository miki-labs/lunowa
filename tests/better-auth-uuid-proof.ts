import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createLocalAccountIssuer } from "better-auth";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { createProofAuth } from "../proofs/better-auth-uuid/proof-config";

const root = resolve(import.meta.dirname, "..");
const proofRoot = resolve(root, "proofs/better-auth-uuid");
const generatedSchemaPath = resolve(proofRoot, "auth-schema.ts");
const generatedSqlPath = resolve(
  proofRoot,
  "migrations/0000_regular_screwball.sql",
);
const migrationsPath = resolve(proofRoot, "migrations");
const expectedPostgresVersion = "18.6";

type EvidenceStatus = "PASS" | "FAIL" | "BLOCKED" | "NOT_RUN";
type AcceptanceId = "47" | "48" | "49";

class ProofBlockedError extends Error {}

const acceptance: Record<
  AcceptanceId,
  { status: EvidenceStatus; test: string; evidence?: string }
> = {
  "47": {
    status: "NOT_RUN",
    test: "catalog user primary-key inspection",
  },
  "48": {
    status: "NOT_RUN",
    test: "Better Auth 1.7.2 local sign-up/session + credential-account + domain FK roundtrip",
  },
  "49": {
    status: "NOT_RUN",
    test: "Better Auth CLI-generated Drizzle schema and committed Drizzle SQL",
  },
};

const evidence = {
  kind: "p14-runtime-result-v1",
  issue: 14,
  postgresVersion: null as string | null,
  postgresVersionNum: null as string | null,
  postgresFullVersion: null as string | null,
  toolVersions: {
    "better-auth": "1.7.2",
    "auth-cli": "1.7.2",
    "drizzle-orm": "0.45.2",
    "drizzle-kit": "0.31.10",
    pg: "8.23.0",
    postgresTarget: expectedPostgresVersion,
  },
  configuration: {
    "advanced.database.generateId": "uuid",
    productionAuthActivated: false,
    providerCredentialsUsed: false,
  },
  accountRelationship: null as {
    providerId: string;
    issuer: string;
    issuerMatchesLocalCredentialIssuer: boolean;
    accountId: string;
    userId: string;
    accountIdMatchesUserId: boolean;
    userIdMatchesUserId: boolean;
    mode: string;
  } | null,
  acceptance,
  statement:
    "Runtime evidence only. Trusted exact-head packaging and independent review remain separate.",
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function setStatus(
  id: AcceptanceId,
  status: EvidenceStatus,
  details: string,
): void {
  acceptance[id] = {
    ...acceptance[id],
    status,
    evidence: details,
  };
}

function markRemaining(status: EvidenceStatus, details: string): void {
  for (const id of Object.keys(acceptance) as AcceptanceId[]) {
    if (acceptance[id].status !== "PASS") setStatus(id, status, details);
  }
}

function isDatabaseUnavailable(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: unknown; cause?: unknown };
  const codes = new Set([
    "ECONNREFUSED",
    "ECONNRESET",
    "ETIMEDOUT",
    "ENETUNREACH",
    "ENOTFOUND",
    "57P03",
  ]);
  return (
    (typeof candidate.code === "string" && codes.has(candidate.code)) ||
    (candidate.cause !== error && isDatabaseUnavailable(candidate.cause))
  );
}

function readGeneratedArtifacts(): { schema: string; sql: string } {
  if (!existsSync(generatedSchemaPath) || !existsSync(generatedSqlPath)) {
    throw new ProofBlockedError(
      "Generated schema or SQL is missing; run pnpm proof:auth-uuid:schema first.",
    );
  }

  const schema = readFileSync(generatedSchemaPath, "utf8");
  const sql = readFileSync(generatedSqlPath, "utf8");
  assert(
    schema.includes('export const user = pgTable("user"'),
    "The committed schema is not a Better Auth user table.",
  );
  assert(
    schema.includes('id: uuid("id")'),
    "The generated Better Auth user ID is not represented as Drizzle uuid().",
  );
  assert(
    sql.includes('CREATE TABLE "user"') &&
      sql.includes('"id" uuid PRIMARY KEY'),
    "The committed Drizzle SQL does not create a UUID Better Auth user primary key.",
  );
  assert(
    sql.includes(
      '"p14_proof_responsibility_owner_user_id_user_id_fk" FOREIGN KEY ("owner_user_id")',
    ),
    "The committed SQL does not include the proof-only UUID domain foreign key.",
  );
  return { schema, sql };
}

async function importGeneratedSchema(): Promise<{
  authSchema: typeof import("../proofs/better-auth-uuid/auth-schema");
  domainSchema: typeof import("../proofs/better-auth-uuid/domain-schema");
}> {
  const [authSchema, domainSchema] = await Promise.all([
    import(pathToFileURL(generatedSchemaPath).href),
    import(pathToFileURL(resolve(proofRoot, "domain-schema.ts")).href),
  ]);
  return { authSchema, domainSchema };
}

async function run(): Promise<void> {
  const databaseUrl = process.env.P14_DATABASE_URL;
  if (!databaseUrl) {
    throw new ProofBlockedError(
      "P14_DATABASE_URL is required; the runtime proof will not substitute a mock or local fallback.",
    );
  }

  const generated = readGeneratedArtifacts();
  const { authSchema, domainSchema } = await importGeneratedSchema();
  const pool = new Pool({
    connectionString: databaseUrl,
    max: 4,
    application_name: "lunowa-p14-auth-uuid-proof",
  });

  try {
    const versionResult = await pool.query<{
      server_version: string;
      server_version_num: string;
      full_version: string;
    }>(
      "SELECT current_setting('server_version') AS server_version, current_setting('server_version_num') AS server_version_num, version() AS full_version",
    );
    const version = versionResult.rows[0];
    assert(version, "PostgreSQL did not return server version evidence.");
    evidence.postgresVersion = version.server_version;
    evidence.postgresVersionNum = version.server_version_num;
    evidence.postgresFullVersion = version.full_version;
    assert(
      version.server_version_num === "180006",
      `The proof requires PostgreSQL ${expectedPostgresVersion}; observed server_version=${version.server_version}, server_version_num=${version.server_version_num}.`,
    );

    const schema = { ...authSchema, ...domainSchema };
    const db = drizzle(pool, { schema });
    await migrate(db, { migrationsFolder: migrationsPath });

    const userCatalog = await pool.query<{
      sql_type: string;
      is_primary_key: boolean;
    }>(
      `
        SELECT
          format_type(attribute.atttypid, attribute.atttypmod) AS sql_type,
          EXISTS (
            SELECT 1
            FROM pg_index AS primary_index
            WHERE primary_index.indrelid = table_object.oid
              AND primary_index.indisprimary
              AND attribute.attnum = ANY(primary_index.indkey)
          ) AS is_primary_key
        FROM pg_class AS table_object
        JOIN pg_namespace AS namespace ON namespace.oid = table_object.relnamespace
        JOIN pg_attribute AS attribute ON attribute.attrelid = table_object.oid
        WHERE namespace.nspname = 'public'
          AND table_object.relname = 'user'
          AND attribute.attname = 'id'
          AND attribute.attnum > 0
          AND NOT attribute.attisdropped
      `,
    );
    const userColumn = userCatalog.rows[0];
    assert(userColumn, "The PostgreSQL catalog has no public.user.id column.");
    assert(
      userColumn.sql_type === "uuid" && userColumn.is_primary_key,
      `Better Auth user.id catalog evidence is ${userColumn.sql_type}; expected UUID primary key.`,
    );
    setStatus(
      "47",
      "PASS",
      "pg_attribute/pg_index reports public.user.id as the PostgreSQL uuid primary key.",
    );

    const foreignKeyCatalog = await pool.query<{
      child_type: string;
      parent_type: string;
      constraint_definition: string;
    }>(
      `
        SELECT
          format_type(child_attribute.atttypid, child_attribute.atttypmod) AS child_type,
          format_type(parent_attribute.atttypid, parent_attribute.atttypmod) AS parent_type,
          pg_get_constraintdef(constraint_object.oid) AS constraint_definition
        FROM pg_constraint AS constraint_object
        JOIN pg_class AS child_table ON child_table.oid = constraint_object.conrelid
        JOIN pg_class AS parent_table ON parent_table.oid = constraint_object.confrelid
        JOIN pg_attribute AS child_attribute
          ON child_attribute.attrelid = child_table.oid
         AND child_attribute.attnum = constraint_object.conkey[1]
        JOIN pg_attribute AS parent_attribute
          ON parent_attribute.attrelid = parent_table.oid
         AND parent_attribute.attnum = constraint_object.confkey[1]
        WHERE constraint_object.contype = 'f'
          AND child_table.relname = 'p14_proof_responsibility'
          AND child_attribute.attname = 'owner_user_id'
          AND parent_table.relname = 'user'
          AND parent_attribute.attname = 'id'
      `,
    );
    const foreignKey = foreignKeyCatalog.rows[0];
    assert(foreignKey, "The proof-only domain UUID foreign key is missing.");
    assert(
      foreignKey.child_type === "uuid" && foreignKey.parent_type === "uuid",
      `Domain FK catalog types are ${foreignKey.child_type} -> ${foreignKey.parent_type}; expected uuid -> uuid.`,
    );
    setStatus(
      "49",
      "PASS",
      `CLI-generated Drizzle schema and SQL agree with catalog UUID types; FK is ${foreignKey.constraint_definition}.`,
    );

    const auth = createProofAuth(db, authSchema);
    const socialProviders = (
      auth.options as unknown as {
        socialProviders?: Record<string, unknown>;
      }
    ).socialProviders;
    assert(
      !socialProviders || Object.keys(socialProviders).length === 0,
      "The proof configuration unexpectedly activates a social provider.",
    );

    const email = `p14-${randomUUID()}@example.invalid`;
    const signUp = await auth.api.signUpEmail({
      body: {
        name: "P14 UUID Proof User",
        email,
        password: "P14-proof-password-123!",
      },
      returnHeaders: true,
    });
    const createdUser = signUp.response.user;
    assert(createdUser?.id, "Better Auth did not return a local user ID.");
    assert(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        createdUser.id,
      ),
      "Better Auth did not return a UUID-shaped local user ID.",
    );

    const responseHeaders = signUp.headers as Headers & {
      getSetCookie?: () => string[];
    };
    const cookies =
      typeof responseHeaders.getSetCookie === "function"
        ? responseHeaders.getSetCookie()
        : [responseHeaders.get("set-cookie") ?? ""];
    const cookieHeader = cookies
      .map((cookie) => cookie.split(";", 1)[0])
      .filter(Boolean)
      .join("; ");
    assert(cookieHeader, "Better Auth did not return a session cookie.");

    const session = await auth.api.getSession({
      headers: new Headers({ cookie: cookieHeader }),
    });
    assert(session, "Better Auth could not read the newly-created local session.");
    assert(
      session.user.id === createdUser.id && session.session.userId === createdUser.id,
      "Better Auth session roundtrip did not preserve the UUID user relationship.",
    );

    const accountRows = await pool.query<{
      provider_id: string;
      account_id: string;
      issuer: string;
      user_id: string;
    }>(
      "SELECT provider_id, account_id, issuer, user_id::text AS user_id FROM \"account\" WHERE user_id = $1",
      [createdUser.id],
    );
    const credentialAccount = accountRows.rows.find(
      (account) => account.provider_id === "credential",
    );
    const localCredentialIssuer = createLocalAccountIssuer("credential");
    assert(
      credentialAccount &&
        credentialAccount.account_id === createdUser.id &&
        credentialAccount.issuer === localCredentialIssuer &&
        credentialAccount.user_id === createdUser.id,
      "Better Auth did not persist a local credential account linked to the UUID user.",
    );
    evidence.accountRelationship = {
      providerId: credentialAccount.provider_id,
      issuer: credentialAccount.issuer,
      issuerMatchesLocalCredentialIssuer:
        credentialAccount.issuer === localCredentialIssuer,
      accountId: credentialAccount.account_id,
      userId: credentialAccount.user_id,
      accountIdMatchesUserId: credentialAccount.account_id === createdUser.id,
      userIdMatchesUserId: credentialAccount.user_id === createdUser.id,
      mode: "Better Auth 1.7.2 local email/password credential account; no OAuth link attempted",
    };

    const [domainRow] = await db
      .insert(domainSchema.proofResponsibility)
      .values({
        ownerUserId: createdUser.id,
        label: "local-account-roundtrip",
      })
      .returning({
        id: domainSchema.proofResponsibility.id,
        ownerUserId: domainSchema.proofResponsibility.ownerUserId,
      });
    assert(domainRow, "The proof-only domain UUID FK insert returned no row.");
    assert(
      domainRow.ownerUserId === createdUser.id,
      "The proof-only domain UUID FK roundtrip changed the owner ID.",
    );

    await assertDomainTypeIsEnforced(pool, createdUser.id);
    setStatus(
      "48",
      "PASS",
      "Better Auth 1.7.2 local user/session and credential-account rows roundtripped, and the proof-only domain UUID FK returned the same user ID; no OAuth credentials were used.",
    );

    // Keep generated content in the result only as bounded paths/claims; never
    // expose a database URL, token, password, or mailbox/provider payload.
    assert(generated.schema.length > 0 && generated.sql.length > 0, "Generated proof artifacts are empty.");
  } finally {
    await pool.end();
  }
}

async function assertDomainTypeIsEnforced(
  pool: Pool,
  userId: string,
): Promise<void> {
  try {
    await pool.query(
      "INSERT INTO p14_proof_responsibility (owner_user_id, label) VALUES ($1, $2)",
      ["not-a-uuid", "invalid-type-must-fail"],
    );
    throw new Error("PostgreSQL accepted a non-UUID domain owner value.");
  } catch (error) {
    assert(
      (error as { code?: string }).code === "22P02",
      "A malformed domain owner value did not fail with PostgreSQL invalid-text-representation SQLSTATE 22P02.",
    );
  }

  try {
    await pool.query(
      "INSERT INTO p14_proof_responsibility (owner_user_id, label) VALUES ($1, $2)",
      [randomUUID(), "unknown-owner-must-fail"],
    );
    throw new Error("PostgreSQL accepted a domain owner absent from auth user.");
  } catch (error) {
    assert(
      (error as { code?: string }).code === "23503",
      "An unknown UUID owner did not fail with PostgreSQL foreign-key SQLSTATE 23503.",
    );
  }

  const roundtrip = await pool.query<{ owner_user_id: string }>(
    "SELECT owner_user_id::text AS owner_user_id FROM p14_proof_responsibility WHERE owner_user_id = $1 LIMIT 1",
    [userId],
  );
  assert(
    roundtrip.rows[0]?.owner_user_id === userId,
    "PostgreSQL did not return the persisted domain UUID owner.",
  );
}

async function main(): Promise<void> {
  let failure: unknown;
  try {
    await run();
  } catch (error) {
    failure = error;
    if (error instanceof ProofBlockedError || isDatabaseUnavailable(error)) {
      markRemaining("BLOCKED", error instanceof Error ? error.message : String(error));
    } else {
      markRemaining("FAIL", error instanceof Error ? error.message : String(error));
    }
    console.error(
      `P14 runtime proof ${error instanceof ProofBlockedError ? "BLOCKED" : "FAILED"}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }

  console.log(JSON.stringify(evidence, null, 2));
  if (failure || Object.values(acceptance).some(({ status }) => status !== "PASS")) {
    process.exitCode = 1;
  }
}

await main();
