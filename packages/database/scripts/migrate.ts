import { Client } from "pg";
import { DIRECT_URL } from "@repo/env/server";
import { glob } from "glob";
import fs from "fs";
import path from "path";

/**
 * Find the project root directory by looking for pnpm-workspace.yaml
 */
function findProjectRoot(startDir: string): string {
  let currentDir = startDir;
  while (true) {
    if (fs.existsSync(path.join(currentDir, "pnpm-workspace.yaml"))) {
      return currentDir;
    }
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      throw new Error(
        "Could not find project root (pnpm-workspace.yaml not found)",
      );
    }
    currentDir = parentDir;
  }
}

async function runMigrations() {
  if (!DIRECT_URL) {
    throw new Error("DIRECT_URL is not defined");
  }

  const client = new Client({ connectionString: DIRECT_URL });
  await client.connect();

  try {
    // 1. Initialize migration table
    console.log("Initializing migration system...");
    await client.query(`CREATE SCHEMA IF NOT EXISTS migrate`);
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrate.history (
        id TEXT PRIMARY KEY,
        package TEXT NOT NULL,
        name TEXT NOT NULL,
        run_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // 2. Discover migration files
    // We assume this script is run from packages/database or root, but we need to find packages/*/migrate/*.sql
    // Let's resolve relative to the monorepo root.
    const rootDir = findProjectRoot(process.cwd());
    const pattern = path.join(rootDir, "packages/*/migrate/*.sql");

    console.log(`Searching for migrations in: ${pattern}`);
    const files = await glob(pattern);

    // Sort files by filename (basename) to ensure chronological order.
    // On basename ties, fall back to full path so order is deterministic and
    // package-stable (core/<file> runs before module-*/<file> alphabetically).
    files.sort((a, b) => {
      const nameA = path.basename(a);
      const nameB = path.basename(b);
      const cmp = nameA.localeCompare(nameB);
      return cmp !== 0 ? cmp : a.localeCompare(b);
    });

    console.log(`Found ${files.length} migration files.`);

    // 3. Filter out executed migrations
    const { rows: executedRows } = await client.query(
      "SELECT id FROM migrate.history",
    );
    const executedIds = new Set(executedRows.map((row) => row.id));

    const pendingFiles = files.filter((file) => {
      const packageName = path.basename(path.dirname(path.dirname(file)));
      const filename = path.basename(file);
      const migrationId = `${packageName}-${filename}`;
      return !executedIds.has(migrationId);
    });

    if (pendingFiles.length === 0) {
      console.log("No pending migrations.");
      return;
    }

    console.log(`Found ${pendingFiles.length} pending migrations.`);

    // 4. Execute pending migrations
    for (const file of pendingFiles) {
      const packageName = path.basename(path.dirname(path.dirname(file)));
      const filename = path.basename(file);
      const migrationId = `${packageName}-${filename}`;
      console.log(`Applying migration: ${packageName}/${filename}`);

      const sql = fs.readFileSync(file, "utf-8");

      try {
        await client.query("BEGIN");
        await client.query(sql);
        await client.query(
          "INSERT INTO migrate.history (id, package, name) VALUES ($1, $2, $3)",
          [migrationId, packageName, filename],
        );
        await client.query("COMMIT");
        console.log(`Successfully applied: ${packageName}/${filename}`);
      } catch (err) {
        await client.query("ROLLBACK");
        console.error(`Failed to apply ${packageName}/${filename}:`, err);
        throw err;
      }
    }

    console.log("All migrations applied successfully!");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
