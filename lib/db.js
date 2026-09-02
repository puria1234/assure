import { Pool } from 'pg';
import { attachDatabasePool } from '@vercel/functions';

// The pool is created on first query, not at import time. Next collects page
// data at build time, when DATABASE_URL is usually absent, and a module-scope
// connection would fail the build rather than the request.
//
// One pool per warm instance: Fluid Compute reuses instances across requests,
// so a pool per request would exhaust connections. attachDatabasePool lets
// Vercel drain it during graceful shutdown.
const globalForDb = globalThis;

function getPool() {
  if (globalForDb.__assurePool) return globalForDb.__assurePool;

  if (!process.env.DATABASE_URL) {
    throw new Error('Missing DATABASE_URL. Point it at your Neon pooled connection string.');
  }
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
  attachDatabasePool(pool);
  globalForDb.__assurePool = pool;
  return pool;
}

/** Run a parameterised query. Never interpolate values into SQL strings. */
export async function query(text, params) {
  const res = await getPool().query(text, params);
  return res.rows;
}

/** Single-row query. Returns undefined rather than throwing when empty. */
export async function queryOne(text, params) {
  const rows = await query(text, params);
  return rows[0];
}

/** Run several statements atomically on one connection. */
export async function transaction(fn) {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
