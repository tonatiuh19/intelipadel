import mysql from "mysql2/promise";

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "intelipadel",
  port: parseInt(process.env.DB_PORT || "3306"),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
};

// Create connection pool
let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

export async function query<T = any>(
  sql: string,
  params?: any[],
): Promise<T[]> {
  const connection = await getPool().getConnection();
  try {
    const [rows] = await connection.query(sql, params);
    return rows as T[];
  } finally {
    connection.release();
  }
}

export async function queryOne<T = any>(
  sql: string,
  params?: any[],
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

export async function execute(sql: string, params?: any[]): Promise<any> {
  const connection = await getPool().getConnection();
  try {
    const [result] = await connection.execute(sql, params);
    return result;
  } finally {
    connection.release();
  }
}

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await getPool().getConnection();
    await connection.ping();
    connection.release();
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}
