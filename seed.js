const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
require("dotenv").config();

async function seed() {
  console.log("Starting database seeding...");

  const environment = process.env.NODE_ENV || "development";
  console.log(`Running in ${environment} mode`);

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

  if (environment === "production") {
    dbConfig.ssl = {
      rejectUnauthorized: true,
    };
  }

  const connection = await mysql.createConnection(dbConfig);
  console.log(`Connected to ${environment} MySQL database`);

  try {
    console.log("Dropping existing tables if they exist...");
    await connection.execute("DROP TABLE IF EXISTS follows");
    await connection.execute("DROP TABLE IF EXISTS comments");
    await connection.execute("DROP TABLE IF EXISTS likes");
    await connection.execute("DROP TABLE IF EXISTS posts");
    await connection.execute("DROP TABLE IF EXISTS users");

    console.log("Creating users table...");
    await connection.execute(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        email VARCHAR(100) NOT NULL,
        password VARCHAR(255) NOT NULL,
        avatar VARCHAR(255),
        bio text,
        cover VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

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
    await connection.execute(
      "CREATE INDEX idx_follows_follower ON follows(follower_id)"
    );

    console.log("Inserting sample users...");
    const hashedPassword = await bcrypt.hash("password", 10);
    await connection.execute(`
          INSERT INTO users (username, email, password, avatar, bio, cover) VALUES
          ('john_doe', 'john@example.com', '${hashedPassword}', 'https://api.dicebear.com/6.x/avataaars/svg?seed=john_doe', "Software developer with a passion for open-source projects and hiking.", 'https://picsum.photos/seed/john_doe/1200/400'),
          ('jane_smith', 'jane@example.com', '${hashedPassword}', 'https://api.dicebear.com/6.x/avataaars/svg?seed=jane_smith', "Graphic designer who loves creating vibrant visuals and exploring new cuisines.", 'https://picsum.photos/seed/jane_smith/1200/400'),
          ('bob_johnson', 'bob@example.com', '${hashedPassword}', 'https://api.dicebear.com/6.x/avataaars/svg?seed=bob_johnson', "Data analyst by day, avid gamer by night.", 'https://picsum.photos/seed/bob_johnson/1200/400'),
          ('alice_green', 'alice@example.com', '${hashedPassword}', 'https://api.dicebear.com/6.x/avataaars/svg?seed=alice_green', "Environmental enthusiast and blogger focused on sustainable living.", 'https://picsum.photos/seed/alice_green/1200/400'),
          ('mike_brown', 'mike@example.com', '${hashedPassword}', 'https://api.dicebear.com/6.x/avataaars/svg?seed=mike_brown', "Fitness coach dedicated to helping others achieve their health goals.", 'https://picsum.photos/seed/mike_brown/1200/400'),
          ('sara_wilson', 'sara@example.com', '${hashedPassword}', 'https://api.dicebear.com/6.x/avataaars/svg?seed=sara_wilson', "Bookworm and aspiring author with a love for historical fiction.", 'https://picsum.photos/seed/sara_wilson/1200/400'),
          ('tom_davis', 'tom@example.com', '${hashedPassword}', 'https://api.dicebear.com/6.x/avataaars/svg?seed=tom_davis', "Photographer capturing the beauty of everyday moments.", 'https://picsum.photos/seed/tom_davis/1200/400'),
          ('emily_jones', 'emily@example.com', '${hashedPassword}', 'https://api.dicebear.com/6.x/avataaars/svg?seed=emily_jones', "Marketing specialist who enjoys traveling and learning new languages.", 'https://picsum.photos/seed/emily_jones/1200/400'),
          ('dave_miller', 'dave@example.com', '${hashedPassword}', 'https://api.dicebear.com/6.x/avataaars/svg?seed=dave_miller', "Musician and producer with a knack for blending genres.", 'https://picsum.photos/seed/dave_miller/1200/400'),
          ('lisa_taylor', 'lisa@example.com', '${hashedPassword}', 'https://api.dicebear.com/6.x/avataaars/svg?seed=lisa_taylor', "Animal lover and volunteer at local shelters.", 'https://picsum.photos/seed/lisa_taylor/1200/400')
    `);

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
}

seed();
