// Focus Flow Backend - SQLite Edition
// Pure Node.js - no TypeScript compilation needed

const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

let server;

// Initialize SQLite Database
const dbPath = path.join(__dirname, 'focusflow.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('✗ Database error:', err.message);
    process.exit(1);
  }
  console.log('✓ SQLite Database connected:', dbPath);

  // Create tables if they don't exist
  const initSQL = `
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      priority TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT,
      folderId INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS folders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT,
      data TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      duration INTEGER,
      date TEXT,
      focusTime INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      dueDate DATETIME,
      completed INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  db.exec(initSQL, (err) => {
    if (err) {
      console.error('✗ Error initializing tables:', err);
      startServer();
      return;
    }

    console.log('✓ Database tables initialized');

    // Perform lightweight migrations: add missing columns if present tables are older schema
    function ensureColumn(table, columnDef, columnName, cb) {
      db.all(`PRAGMA table_info(${table})`, (err, rows) => {
        if (err) return cb(err);
        const has = rows && rows.some(r => r.name === columnName);
        if (has) return cb(null, false);
        const alterSQL = `ALTER TABLE ${table} ADD COLUMN ${columnDef}`;
        db.run(alterSQL, (err) => cb(err, true));
      });
    }

    // Ensure history.createdAt (can't add column with non-constant default in SQLite)
    ensureColumn('history', 'createdAt DATETIME', 'createdAt', (err, added) => {
      if (err) console.warn('⚠ Could not ensure history.createdAt:', err.message);
      else if (added) {
        console.log('✓ Added missing column history.createdAt');
        // backfill existing rows with current timestamp
        db.run("UPDATE history SET createdAt = CURRENT_TIMESTAMP WHERE createdAt IS NULL", (uerr) => {
          if (uerr) console.warn('⚠ Could not backfill history.createdAt:', uerr.message);
        });
      }

      // Ensure reminders.dueDate
      ensureColumn('reminders', 'dueDate DATETIME', 'dueDate', (err2, added2) => {
        if (err2) console.warn('⚠ Could not ensure reminders.dueDate:', err2.message);
        else if (added2) console.log('✓ Added missing column reminders.dueDate');

        // All migrations done — start server
        startServer();
      });
    });
  });
});

// API Routes

// Todos
app.get('/api/todos', (req, res) => {
  db.all('SELECT * FROM todos ORDER BY createdAt DESC', (err, rows) => {
    if (err) {
      console.error('Error fetching todos:', err);
      return res.status(500).json({ error: 'Failed to fetch todos' });
    }
    res.json(rows || []);
  });
});

app.post('/api/todos', (req, res) => {
  const { title, completed, priority } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }
  db.run(
    'INSERT INTO todos (title, completed, priority) VALUES (?, ?, ?)',
    [title.trim(), completed ? 1 : 0, priority || 'medium'],
    function(err) {
      if (err) {
        console.error('Error creating todo:', err);
        return res.status(500).json({ error: 'Failed to create todo' });
      }
      res.status(201).json({ id: this.lastID, title, completed, priority });
    }
  );
});

app.put('/api/todos/:id', (req, res) => {
  const { title, completed, priority } = req.body;
  const updates = [];
  const values = [];
  
  if (title !== undefined) { updates.push('title = ?'); values.push(title); }
  if (completed !== undefined) { updates.push('completed = ?'); values.push(completed ? 1 : 0); }
  if (priority !== undefined) { updates.push('priority = ?'); values.push(priority); }
  
  if (updates.length === 0) return res.json({ error: 'No fields to update' });
  
  updates.push('updatedAt = CURRENT_TIMESTAMP');
  values.push(req.params.id);
  
  db.get(`UPDATE todos SET ${updates.join(', ')} WHERE id = ? RETURNING *`, values, (err, row) => {
    if (err) {
      console.error('Error updating todo:', err);
      return res.status(500).json({ error: 'Failed to update todo' });
    }
    res.json(row);
  });
});

app.delete('/api/todos/:id', (req, res) => {
  db.run('DELETE FROM todos WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      console.error('Error deleting todo:', err);
      return res.status(500).json({ error: 'Failed to delete todo' });
    }
    res.json({ success: true });
  });
});

// Notes
app.get('/api/notes', (req, res) => {
  db.all('SELECT * FROM notes ORDER BY createdAt DESC', (err, rows) => {
    if (err) {
      console.error('Error fetching notes:', err);
      return res.status(500).json({ error: 'Failed to fetch notes' });
    }
    res.json(rows || []);
  });
});

// Get notes by folder
app.get('/api/notes/folder/:folderId', (req, res) => {
  const folderId = req.params.folderId;
  db.all('SELECT * FROM notes WHERE folderId = ? ORDER BY createdAt DESC', [folderId], (err, rows) => {
    if (err) {
      console.error('Error fetching notes by folder:', err);
      return res.status(500).json({ error: 'Failed to fetch notes' });
    }
    res.json(rows || []);
  });
});

// Get single note
app.get('/api/notes/:id', (req, res) => {
  db.get('SELECT * FROM notes WHERE id = ? OR _id = ?', [req.params.id, req.params.id], (err, row) => {
    if (err) {
      console.error('Error fetching note:', err);
      return res.status(500).json({ error: 'Failed to fetch note' });
    }
    if (!row) return res.status(404).json({ error: 'Note not found' });
    res.json(row);
  });
});

// Update note
app.put('/api/notes/:id', (req, res) => {
  const { title, content, folderId } = req.body;
  const updates = [];
  const values = [];
  if (title !== undefined) { updates.push('title = ?'); values.push(title); }
  if (content !== undefined) { updates.push('content = ?'); values.push(content); }
  if (folderId !== undefined) { updates.push('folderId = ?'); values.push(folderId); }
  if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });
  updates.push('updatedAt = CURRENT_TIMESTAMP');
  values.push(req.params.id);

  const sql = `UPDATE notes SET ${updates.join(', ')} WHERE id = ?`;
  db.run(sql, values, function(err) {
    if (err) {
      console.error('Error updating note:', err);
      return res.status(500).json({ error: 'Failed to update note' });
    }
    // return updated row
    db.get('SELECT * FROM notes WHERE id = ?', [req.params.id], (err2, row) => {
      if (err2) {
        console.error('Error fetching updated note:', err2);
        return res.status(500).json({ error: 'Failed to fetch updated note' });
      }
      res.json(row);
    });
  });
});

// Delete note
app.delete('/api/notes/:id', (req, res) => {
  db.run('DELETE FROM notes WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      console.error('Error deleting note:', err);
      return res.status(500).json({ error: 'Failed to delete note' });
    }
    res.json({ success: true });
  });
});

app.post('/api/notes', (req, res) => {
  const { title, content, folderId } = req.body;
  db.run(
    'INSERT INTO notes (title, content, folderId) VALUES (?, ?, ?)',
    [title, content, folderId || null],
    function(err) {
      if (err) {
        console.error('Error creating note:', err);
        return res.status(500).json({ error: 'Failed to create note' });
      }
      res.status(201).json({ id: this.lastID, title, content, folderId });
    }
  );
});

// Folders
app.get('/api/folders', (req, res) => {
  db.all('SELECT * FROM folders ORDER BY createdAt DESC', (err, rows) => {
    if (err) {
      console.error('Error fetching folders:', err);
      return res.status(500).json({ error: 'Failed to fetch folders' });
    }
    res.json(rows || []);
  });
});

app.post('/api/folders', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  db.run(
    'INSERT INTO folders (name) VALUES (?)',
    [name],
    function(err) {
      if (err) {
        console.error('Error creating folder:', err);
        return res.status(500).json({ error: 'Failed to create folder' });
      }
      res.status(201).json({ id: this.lastID, name });
    }
  );
});

// History
app.get('/api/history', (req, res) => {
  db.all('SELECT * FROM history ORDER BY createdAt DESC LIMIT 100', (err, rows) => {
    if (err) {
      console.error('Error fetching history:', err);
      return res.status(500).json({ error: 'Failed to fetch history' });
    }
    res.json(rows || []);
  });
});

// Sessions
app.get('/api/sessions', (req, res) => {
  db.all('SELECT * FROM sessions ORDER BY createdAt DESC LIMIT 100', (err, rows) => {
    if (err) {
      console.error('Error fetching sessions:', err);
      return res.status(500).json({ error: 'Failed to fetch sessions' });
    }
    res.json(rows || []);
  });
});

app.post('/api/sessions', (req, res) => {
  const { duration, date, focusTime } = req.body;
  db.run(
    'INSERT INTO sessions (duration, date, focusTime) VALUES (?, ?, ?)',
    [duration, date, focusTime],
    function(err) {
      if (err) {
        console.error('Error creating session:', err);
        return res.status(500).json({ error: 'Failed to create session' });
      }
      res.status(201).json({ id: this.lastID, duration, date, focusTime });
    }
  );
});

// Reminders
app.get('/api/reminders', (req, res) => {
  db.all('SELECT * FROM reminders ORDER BY dueDate ASC', (err, rows) => {
    if (err) {
      console.error('Error fetching reminders:', err);
      return res.status(500).json({ error: 'Failed to fetch reminders' });
    }
    res.json(rows || []);
  });
});

app.post('/api/reminders', (req, res) => {
  const { title, description, dueDate } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  db.run(
    'INSERT INTO reminders (title, description, dueDate) VALUES (?, ?, ?)',
    [title, description, dueDate],
    function(err) {
      if (err) {
        console.error('Error creating reminder:', err);
        return res.status(500).json({ error: 'Failed to create reminder' });
      }
      res.status(201).json({ id: this.lastID, title, description, dueDate });
    }
  );
});

const PORT = process.env.PORT || 5000;
function startServer() {
  server = app.listen(PORT, () => {
    console.log(`✓ Server running on http://localhost:${PORT}`);
  });
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n✓ Shutting down gracefully...');
  db.close();
  server.close();
  process.exit(0);
});
