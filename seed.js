const mysql = require("mysql2/promise");

async function seed() {
  console.log("Starting database seeding...");

  // Create connection to MySQL
  // Note: We're using the port 3300 that you mapped in docker-compose
  const connection = await mysql.createConnection({
    host: "localhost",
    port: 3300,
    user: "root",
    password: "password",
    database: "exam_summer_2025",
  });

  console.log("Connected to MySQL database");

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
