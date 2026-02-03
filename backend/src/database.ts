import sqlite3 from 'sqlite3';
import path from 'path';

// For standalone Node.js backend (not Electron)
const dbPath = process.env.DB_PATH || path.join(process.cwd(), 'focusflow.db');

export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
    initializeDatabase();
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

export function initializeDatabase() {
  db.serialize(() => {
    // Todos table
    db.run(`
      CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT 0,
        priority TEXT DEFAULT 'medium',
        dueDate TEXT,
        folderId INTEGER,
        repeatType TEXT DEFAULT 'none',
        repeatInterval INTEGER,
        repeatDays TEXT,
        repeatLimit INTEGER,
        repeatCount INTEGER DEFAULT 0,
        repeatEndDate TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (folderId) REFERENCES folders(id) ON DELETE SET NULL
      )
    `);

    // Add missing columns to todos table if they don't exist (migration)
    // These will silently fail if columns already exist, which is fine
    const columnsToAdd = [
      'ALTER TABLE todos ADD COLUMN repeatType TEXT DEFAULT \'none\'',
      'ALTER TABLE todos ADD COLUMN repeatInterval INTEGER',
      'ALTER TABLE todos ADD COLUMN repeatDays TEXT',
      'ALTER TABLE todos ADD COLUMN repeatLimit INTEGER',
      'ALTER TABLE todos ADD COLUMN repeatCount INTEGER DEFAULT 0',
      'ALTER TABLE todos ADD COLUMN repeatEndDate TEXT'
    ];
    
    columnsToAdd.forEach((sql: string) => {
      db.run(sql, (err: any) => {
        // Ignore errors - columns might already exist
      });
    });

    // Notes table
    db.run(`
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT,
        folderId INTEGER,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (folderId) REFERENCES folders(id) ON DELETE SET NULL
      )
    `);

    // Folders table
    db.run(`
      CREATE TABLE IF NOT EXISTS folders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        color TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // History table (for focus sessions)
    db.run(`
      CREATE TABLE IF NOT EXISTS history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,
        details TEXT,
        duration INTEGER,
        startTime TEXT,
        endTime TEXT,
        date TEXT NOT NULL,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create index for faster queries
    db.run(`CREATE INDEX IF NOT EXISTS idx_history_date ON history(date)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_todos_folderId ON todos(folderId)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_notes_folderId ON notes(folderId)`);

    // Reminders table
    db.run(`
      CREATE TABLE IF NOT EXISTS reminders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        reminderDate TEXT NOT NULL,
        reminderTime TEXT,
        completed BOOLEAN DEFAULT 0,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Sessions table
    db.run(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        startTime TEXT NOT NULL,
        endTime TEXT NOT NULL,
        duration INTEGER NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date)`);

    console.log('Database tables initialized');
  });
}

export function runAsync(sql: string, params: any[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

export function getAsync(sql: string, params: any[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export function allAsync(sql: string, params: any[] = []): Promise<any[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

export function closeDatabase() {
  db.close((err) => {
    if (err) console.error('Error closing database:', err);
    else console.log('Database connection closed');
  });
}
