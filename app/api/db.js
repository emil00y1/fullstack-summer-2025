// utils/db.js
import mysql from "mysql2/promise";

/**
 * Creates a connection to the database
 * @returns {Promise<Connection>} A MySQL connection object
 */
export async function getConnection() {
  try {
    return await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
  } catch (error) {
    console.error("Database connection error:", error);
    throw new Error("Failed to connect to database");
  }
}

/**
 * Executes a query with optional parameters
 * @param {string} query - SQL query to execute
 * @param {Array} params - Parameters for the query
 * @returns {Promise<Array>} Result of the query
 */
export async function executeQuery(query, params = []) {
  let connection;

  try {
    connection = await getConnection();
    const [results] = await connection.execute(query, params);
    return results;
  } catch (error) {
    console.error("Query execution error:", error);
    throw new Error("Failed to execute database query");
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
