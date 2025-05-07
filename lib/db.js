import mysql from "mysql2/promise";

// Determine which environment we're in
const environment = process.env.NODE_ENV || "development";
console.log(`Running in ${environment} mode`);

// Set database config based on environment
const dbConfig = {
  host:
    environment === "production"
      ? process.env.PROD_DB_HOST
      : process.env.DEV_DB_HOST,
  port: parseInt(
    environment === "production"
      ? process.env.PROD_DB_PORT
      : process.env.DEV_DB_PORT || "3306"
  ),
  user:
    environment === "production"
      ? process.env.PROD_DB_USER
      : process.env.DEV_DB_USER,
  password:
    environment === "production"
      ? process.env.PROD_DB_PASSWORD
      : process.env.DEV_DB_PASSWORD,
  database:
    environment === "production"
      ? process.env.PROD_DB_NAME
      : process.env.DEV_DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Add SSL configuration for production (Azure)
if (environment === "production") {
  dbConfig.ssl = {
    rejectUnauthorized: true,
  };
}

// Create a connection pool with the appropriate config
const pool = mysql.createPool(dbConfig);

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
    console.log(`Connected to ${environment} database`);

    // Debug logging - helps identify parameter issues
    console.log("SQL:", sql);
    console.log("Params:", params);

    // Using query() instead of execute() for better parameter handling
    // This is often more forgiving with parameter types
    const [results] = await connection.query(sql, params);
    return results;
  } catch (error) {
    console.error("Database Query Error:", error.message);
    throw new Error(`Failed to execute database query. ${error.message}`);
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release();
    }
  }
}
