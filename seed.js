const mysql = require("mysql2/promise");
const bcrypt = require('bcrypt');
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
    // Drop tables if they exist to start fresh
    console.log("Dropping existing tables if they exist...");
    await connection.execute("DROP TABLE IF EXISTS comments");
    await connection.execute("DROP TABLE IF EXISTS likes");
    await connection.execute("DROP TABLE IF EXISTS posts");
    await connection.execute("DROP TABLE IF EXISTS users");

    // Create users table with avatar column
    console.log("Creating users table...");
    await connection.execute(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        email VARCHAR(100) NOT NULL,
        password VARCHAR(255) NOT NULL,
        avatar VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create posts table
    console.log("Creating posts table...");
    await connection.execute(`
      CREATE TABLE posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_public BOOLEAN DEFAULT TRUE,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Create likes table
    console.log("Creating likes table...");
    await connection.execute(`
      CREATE TABLE likes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        post_id INT NOT NULL,
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES posts(id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE (post_id, user_id)
      )
    `);

    // Create comments table
    console.log("Creating comments table...");
    await connection.execute(`
      CREATE TABLE comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        post_id INT NOT NULL,
        user_id INT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES posts(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Add indexes for better query performance
    console.log("Creating indexes for improved performance...");
    await connection.execute(
      "CREATE INDEX idx_posts_created_at ON posts(created_at)"
    );
    await connection.execute(
      "CREATE INDEX idx_posts_is_public ON posts(is_public)"
    );
    await connection.execute(
      "CREATE INDEX idx_posts_user_id ON posts(user_id)"
    );
    await connection.execute(
      "CREATE INDEX idx_likes_post_id ON likes(post_id)"
    );
    await connection.execute(
      "CREATE INDEX idx_comments_post_id ON comments(post_id)"
    );

    // Insert sample users (10 users) with avatar URLs
    console.log("Inserting sample users...");
    const hashedPassword = await bcrypt.hash('password', 10);
    await connection.execute(`
      INSERT INTO users (username, email, password, avatar) VALUES
      ('john_doe', 'john@example.com', '${hashedPassword}', 'https://api.dicebear.com/6.x/avataaars/svg?seed=john_doe'),
      ('jane_smith', 'jane@example.com', '${hashedPassword}', 'https://api.dicebear.com/6.x/avataaars/svg?seed=jane_smith'),
      ('bob_johnson', 'bob@example.com', '${hashedPassword}', 'https://api.dicebear.com/6.x/avataaars/svg?seed=bob_johnson'),
      ('alice_green', 'alice@example.com', '${hashedPassword}', 'https://api.dicebear.com/6.x/avataaars/svg?seed=alice_green'),
      ('mike_brown', 'mike@example.com', '${hashedPassword}', 'https://api.dicebear.com/6.x/avataaars/svg?seed=mike_brown'),
      ('sara_wilson', 'sara@example.com', '${hashedPassword}', 'https://api.dicebear.com/6.x/avataaars/svg?seed=sara_wilson'),
      ('tom_davis', 'tom@example.com', '${hashedPassword}', 'https://api.dicebear.com/6.x/avataaars/svg?seed=tom_davis'),
      ('emily_jones', 'emily@example.com', '${hashedPassword}', 'https://api.dicebear.com/6.x/avataaars/svg?seed=emily_jones'),
      ('dave_miller', 'dave@example.com', '${hashedPassword}', 'https://api.dicebear.com/6.x/avataaars/svg?seed=dave_miller'),
      ('lisa_taylor', 'lisa@example.com', '${hashedPassword}', 'https://api.dicebear.com/6.x/avataaars/svg?seed=lisa_taylor')
    `);

    // Generate sample posts (100 posts)
    console.log("Inserting sample posts...");
    const sampleContents = [
      "Just had an amazing cup of coffee!",
      "Working on a new project today.",
      "Can\\'t wait for the weekend!",
      "Thinking about learning a new programming language.",
      "Just finished an interesting book about web development.",
      "Having a great day at the beach.",
      "Trying out a new recipe for dinner tonight.",
      "Missing the good old days of simple web development.",
      "Just adopted a new puppy!",
      "Excited about the upcoming tech conference.",
    ];

    for (let i = 0; i < 100; i++) {
      const userId = Math.floor(Math.random() * 10) + 1;
      const contentIndex = i % sampleContents.length;
      const isPublic = Math.random() > 0.1 ? 1 : 0;
      const content = sampleContents[contentIndex];
      await connection.execute(
        "INSERT INTO posts (user_id, content, is_public) VALUES (?, ?, ?)",
        [userId, content, isPublic]
      );
    }

    // Generate sample likes (approximately 500 likes)
    console.log("Inserting sample likes...");
    const addedLikes = new Set();
    for (let i = 0; i < 500; i++) {
      const postId = Math.floor(Math.random() * 100) + 1;
      const userId = Math.floor(Math.random() * 10) + 1;
      const likeKey = `${postId}-${userId}`;
      if (!addedLikes.has(likeKey)) {
        addedLikes.add(likeKey);
        await connection.execute(
          "INSERT INTO likes (post_id, user_id) VALUES (?, ?)",
          [postId, userId]
        );
      }
    }

    // Generate sample comments (approximately 200 comments)
    console.log("Inserting sample comments...");
    const sampleComments = [
      "Great post!",
      "I totally agree with you.",
      "Interesting perspective.",
      "Thanks for sharing!",
      "This made my day.",
      "I\\'ve been thinking the same thing.",
      "Have you considered trying this approach?",
      "Keep up the good work!",
      "Can you explain more about this?",
      "Looking forward to more posts like this.",
    ];

    for (let i = 0; i < 200; i++) {
      const postId = Math.floor(Math.random() * 100) + 1;
      const userId = Math.floor(Math.random() * 10) + 1;
      const commentIndex = i % sampleComments.length;
      const content = sampleComments[commentIndex];
      await connection.execute(
        "INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)",
        [postId, userId, content]
      );
    }

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error during seeding:", error);
  } finally {
    await connection.end();
    console.log("Database connection closed");
  }

  // After creating the comments table in your seed.js file
console.log("Creating follows table...");
await connection.execute(`
  CREATE TABLE follows (
    id INT AUTO_INCREMENT PRIMARY KEY,
    follower_id INT NOT NULL,
    following_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (follower_id) REFERENCES users(id),
    FOREIGN KEY (following_id) REFERENCES users(id),
    UNIQUE (follower_id, following_id)
  )
`);

// Add an index for better query performance
console.log("Creating follows index for improved performance...");
await connection.execute("CREATE INDEX idx_follows_follower ON follows(follower_id)");
}

// Run the seed function
seed();