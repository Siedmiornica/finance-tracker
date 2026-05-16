/**
 * Database initialization script.
 * Run with: npx tsx scripts/init-db.ts
 *
 * Creates the SQLite database with the required schema and seeds
 * the owner account. Uses environment variables for credentials:
 *   OWNER_USERNAME (default: "admin")
 *   OWNER_PASSWORD (default: "admin123")
 */

import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { hashSync } from "bcrypt";

const DB_PATH = path.join(process.cwd(), "data", "finance.db");

// Ensure data directory exists
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

console.log(`Initializing database at: ${DB_PATH}`);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS folders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE COLLATE NOCASE CHECK(length(name) BETWEEN 1 AND 50),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT NOT NULL CHECK(length(description) BETWEEN 1 AND 500),
    purchase_price INTEGER NOT NULL CHECK(purchase_price BETWEEN 1 AND 999999999),
    purchase_date TEXT NOT NULL,
    sale_price INTEGER CHECK(sale_price IS NULL OR sale_price >= 1),
    sale_date TEXT,
    folder_id INTEGER REFERENCES folders(id) ON DELETE SET NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS owner (
    id INTEGER PRIMARY KEY CHECK(id = 1),
    username TEXT NOT NULL,
    password_hash TEXT NOT NULL
  );
`);

console.log("Tables created successfully.");

// Seed owner account
const ownerExists = db.prepare("SELECT id FROM owner WHERE id = 1").get();

if (!ownerExists) {
  const username = process.env.OWNER_USERNAME || "admin";
  const password = process.env.OWNER_PASSWORD || "admin123";
  const passwordHash = hashSync(password, 10);

  db.prepare(
    "INSERT INTO owner (id, username, password_hash) VALUES (1, ?, ?)"
  ).run(username, passwordHash);

  console.log(`Owner account seeded (username: "${username}").`);
} else {
  console.log("Owner account already exists, skipping seed.");
}

db.close();
console.log("Database initialization complete.");
