/**
 * Jest replacement for @op-engineering/op-sqlite (a native module) that runs
 * the SQL for real on Node's built-in SQLite, with in-memory databases.
 * Only the parts used by the app are implemented: open, execute, close.
 */
const { DatabaseSync } = require('node:sqlite');

function open() {
  const database = new DatabaseSync(':memory:');
  return {
    async execute(query, params = []) {
      const statement = database.prepare(query);
      if (/^\s*select/i.test(query)) {
        return { rowsAffected: 0, rows: statement.all(...params) };
      }
      const result = statement.run(...params);
      return {
        rowsAffected: Number(result.changes),
        insertId: Number(result.lastInsertRowid),
        rows: [],
      };
    },
    close() {
      database.close();
    },
  };
}

module.exports = { open };
