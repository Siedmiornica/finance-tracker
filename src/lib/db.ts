import Database from "better-sqlite3";
import path from "path";
import { hashSync } from "bcrypt";

const DB_PATH = path.join(process.cwd(), "data", "finance.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    // Ensure data directory exists
    const fs = require("fs");
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");

    initializeSchema(db);
  }
  return db;
}

function initializeSchema(db: Database.Database): void {
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

  // Seed owner account if not exists
  const ownerExists = db
    .prepare("SELECT id FROM owner WHERE id = 1")
    .get();

  if (!ownerExists) {
    const defaultUsername = process.env.OWNER_USERNAME || "admin";
    const defaultPassword = process.env.OWNER_PASSWORD || "admin123";
    const passwordHash = hashSync(defaultPassword, 10);

    db.prepare(
      "INSERT INTO owner (id, username, password_hash) VALUES (1, ?, ?)"
    ).run(defaultUsername, passwordHash);
  }
}

export default getDb;
