import { open, type DB } from '@op-engineering/op-sqlite';
import * as Sentry from '@sentry/react-native';
import { useEffect, useSyncExternalStore } from 'react';
import { createLogger } from '../../../observability/logger';
import type { NewTodo, Todo, TodoStore } from '../types';

const log = createLogger('TodoSqlite');

/**
 * SQLite version (op-sqlite). The todos live in a real SQLite database
 * file on the device, in a `todos` table, so they survive closing the app.
 *
 * The database is the source of truth: every action runs a SQL statement
 * (INSERT / UPDATE / DELETE) and then reloads the list with a SELECT.
 * Components subscribe to that list with useSyncExternalStore, like the
 * AsyncStorage version.
 */

export const DATABASE_NAME = 'todos.sqlite';

/** How a row looks in the table: SQLite has no boolean or date types. */
type TodoRow = {
  id: number;
  text: string;
  /** ISO string */
  date: string;
  /** 0 or 1 */
  completed: number;
};

let db: DB | null = null;
let todos: Todo[] = [];
let initRequest: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach(listener => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return todos;
}

function toTodo(row: TodoRow): Todo {
  return {
    id: String(row.id),
    text: row.text,
    date: new Date(row.date),
    completed: row.completed === 1,
  };
}

async function reload() {
  if (!db) {
    return;
  }
  const { rows } = await db.execute(
    'SELECT id, text, date, completed FROM todos ORDER BY id',
  );
  todos = (rows as unknown as TodoRow[]).map(toTodo);
  emit();
}

/** Opens the database, creates the table if needed and loads the todos. */
export function initTodoDatabase() {
  if (!initRequest) {
    initRequest = (async () => {
      db = open({ name: DATABASE_NAME });
      await db.execute(
        `CREATE TABLE IF NOT EXISTS todos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          text TEXT NOT NULL,
          date TEXT NOT NULL,
          completed INTEGER NOT NULL DEFAULT 0
        )`,
      );
      await reload();
      log.info('Database opened', { name: DATABASE_NAME, rows: todos.length });
    })().catch(error => {
      initRequest = null; // allow retrying
      log.error('Could not open the todos database', error);
    });
  }
  return initRequest;
}

/** Runs a write statement (with ? placeholders) and refreshes the list. */
async function write(sql: string, params: (string | number)[]) {
  await initTodoDatabase();
  const database = db;
  if (!database) {
    return;
  }
  // Each statement is a span: its duration shows up in Sentry traces.
  // Only the SQL is logged, not the params (they hold the user's text).
  const done = log.time(`SQL ${sql.split(' ')[0]}`, { sql });
  try {
    await Sentry.startSpan({ name: sql, op: 'db.sql.execute' }, async () => {
      await database.execute(sql, params);
      await reload();
    });
    done({ rows: todos.length });
  } catch (error) {
    log.error('SQLite error', error, { sql });
  }
}

const actions = {
  addTodo: (todo: NewTodo) =>
    write('INSERT INTO todos (text, date, completed) VALUES (?, ?, ?)', [
      todo.text,
      todo.date.toISOString(),
      todo.completed ? 1 : 0,
    ]),
  updateTodo: (id: string, changes: Partial<NewTodo>) => {
    // Build "SET text = ?, date = ?" only with the fields that changed.
    const columns: string[] = [];
    const params: (string | number)[] = [];
    if (changes.text !== undefined) {
      columns.push('text = ?');
      params.push(changes.text);
    }
    if (changes.date !== undefined) {
      columns.push('date = ?');
      params.push(changes.date.toISOString());
    }
    if (changes.completed !== undefined) {
      columns.push('completed = ?');
      params.push(changes.completed ? 1 : 0);
    }
    if (columns.length === 0) {
      return;
    }
    return write(`UPDATE todos SET ${columns.join(', ')} WHERE id = ?`, [
      ...params,
      Number(id),
    ]);
  },
  toggleTodo: (id: string) =>
    write('UPDATE todos SET completed = 1 - completed WHERE id = ?', [
      Number(id),
    ]),
  removeTodo: (id: string) =>
    write('DELETE FROM todos WHERE id = ?', [Number(id)]),
};

/** Same shape as the other todo stores, backed by SQLite. */
export function useSqliteTodos(): TodoStore {
  const current = useSyncExternalStore(subscribe, getSnapshot);

  useEffect(() => {
    initTodoDatabase();
  }, []);

  return { todos: current, ...actions };
}

/** Test helper: close the database and forget the in-memory state. */
export function resetTodoSqliteStoreForTests() {
  db?.close();
  db = null;
  todos = [];
  initRequest = null;
  listeners.clear();
}
