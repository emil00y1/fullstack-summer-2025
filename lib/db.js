import mysql from "mysql2/promise";

// Create a connection pool
// The pool will manage connections automatically, improving performance.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "3306"), // Provide a default port if not set
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true, // Wait for a connection to become available if pool is full
  connectionLimit: 10, // Adjust based on your expected load
  queueLimit: 0, // Unlimited queueing (use with caution)
});

/**
 * Executes a SQL query using a connection from the pool.
 * @param {string} sql - The SQL query string.
 * @param {Array} [params=[]] - Optional parameters for prepared statements.
 * @returns {Promise<Array>} The query results.
 * @throws {Error} If the query fails.
 */
export async function executeQuery(sql, params = []) {
  let connection;
  try {
    // Get a connection from the pool
    connection = await pool.getConnection();
    console.log("Database connection successful"); // Optional: log success

    // Execute the query
    const [results] = await connection.execute(sql, params);
    return results;
  } catch (error) {
    console.error("Database Query Error:", error.message);
    // Log more details if needed, e.g., error.code, error.sqlMessage
    // Consider different error handling based on the error type
    throw new Error(`Failed to execute database query. ${error.message}`);
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
      console.log("Database connection released"); // Optional: log release
    }
  }
}
