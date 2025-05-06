// Convert to ES modules syntax or keep require syntax as needed
const mysql = require("mysql2/promise");
require("dotenv").config();

async function seed() {
  console.log("Starting database seeding...");

  // Determine which environment we're in
  const environment = process.env.NODE_ENV || "development";
  console.log(`Running in ${environment} mode`);

  // Set connection config based on environment
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
  };

  // Add SSL configuration for production (Azure)
  if (environment === "production") {
    dbConfig.ssl = {
      rejectUnauthorized: true,
    };
  }

  // Create connection to MySQL with the appropriate config
  const connection = await mysql.createConnection(dbConfig);
  console.log(`Connected to ${environment} MySQL database`);

  try {
    // Drop table if it exists to start fresh
    console.log("Dropping existing users table if it exists...");
    await connection.execute("DROP TABLE IF EXISTS users");

    // Create users table
    console.log("Creating users table...");
    await connection.execute(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        email VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert sample users
    console.log("Inserting sample users...");
    await connection.execute(`
      INSERT INTO users (username, email) VALUES
      ('john_doe', 'john@example.com'),
      ('jane_smith', 'jane@example.com'),
      ('bob_johnson', 'bob@example.com')
    `);

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error during seeding:", error);
  } finally {
    // Close the database connection
    await connection.end();
    console.log("Database connection closed");
  }
}

// Run the seed function
seed();
