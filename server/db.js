import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.join(__dirname, 'portfolio.db');

let SQL;
let sqlite;

function persist() {
  const data = sqlite.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
}

function rowsFrom(result) {
  if (!result.length) return [];
  const { columns, values } = result[0];
  return values.map((row) =>
    Object.fromEntries(columns.map((col, i) => [col, row[i]]))
  );
}

function createApi(database) {
  return {
    exec(sql) {
      database.run(sql);
      persist();
    },
    prepare(sql) {
      return {
        get(...params) {
          const stmt = database.prepare(sql);
          stmt.bind(params);
          const row = stmt.step() ? stmt.getAsObject() : undefined;
          stmt.free();
          return row;
        },
        all(...params) {
          const stmt = database.prepare(sql);
          stmt.bind(params);
          const rows = [];
          while (stmt.step()) {
            rows.push(stmt.getAsObject());
          }
          stmt.free();
          return rows;
        },
        run(...params) {
          const stmt = database.prepare(sql);
          stmt.bind(params);
          stmt.step();
          stmt.free();
          const idResult = database.exec('SELECT last_insert_rowid() AS id');
          const lastInsertRowid = idResult[0]?.values?.[0]?.[0] ?? null;
          const changes = database.getRowsModified();
          persist();
          return { lastInsertRowid, changes };
        },
      };
    },
    query(sql) {
      return rowsFrom(database.exec(sql));
    },
  };
}

export async function initDb() {
  SQL = await initSqlJs();

  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    sqlite = new SQL.Database(fileBuffer);
  } else {
    sqlite = new SQL.Database();
  }

  const db = createApi(sqlite);

  db.exec(`
    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      linkedin TEXT,
      github TEXT,
      leetcode TEXT,
      location TEXT
    );

    CREATE TABLE IF NOT EXISTS education (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      degree TEXT NOT NULL,
      institution TEXT NOT NULL,
      cgpa TEXT,
      year TEXT,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS experience (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT NOT NULL,
      company TEXT NOT NULL,
      duration TEXT,
      description TEXT,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      tech_stack TEXT NOT NULL,
      github_url TEXT,
      github_url_secondary TEXT,
      live_url TEXT,
      image_key TEXT,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS certifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      issuer TEXT,
      date TEXT,
      description TEXT,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  return db;
}
