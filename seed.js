const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid"); // Added for UUID4 generation
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
    await connection.execute("DROP TABLE IF EXISTS comment_likes");
    await connection.execute("DROP TABLE IF EXISTS comments");
    await connection.execute("DROP TABLE IF EXISTS likes");
    await connection.execute("DROP TABLE IF EXISTS follows");
    await connection.execute("DROP TABLE IF EXISTS comments");
    await connection.execute("DROP TABLE IF EXISTS posts");
    await connection.execute("DROP TABLE IF EXISTS user_roles");
    await connection.execute("DROP TABLE IF EXISTS roles");
    await connection.execute("DROP TABLE IF EXISTS users");

    console.log("Creating users table...");
    await connection.execute(`
      CREATE TABLE users (
        id CHAR(36) NOT NULL PRIMARY KEY,
        username VARCHAR(25) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        avatar VARCHAR(255),
        bio TEXT,
        cover VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,  -- Add this line
        is_verified BOOLEAN DEFAULT FALSE,
        verification_code VARCHAR(6) NULL,
        verification_code_expires_at TIMESTAMP NULL
      );
    `);

    console.log("Creating posts table...");
    await connection.execute(`
      CREATE TABLE posts (
        id CHAR(36) NOT NULL PRIMARY KEY,
        user_id CHAR(36) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_public BOOLEAN DEFAULT TRUE,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    console.log("Creating likes table...");
    await connection.execute(`
      CREATE TABLE likes (
        id CHAR(36) NOT NULL PRIMARY KEY,
        post_id CHAR(36) NOT NULL,
        user_id CHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES posts(id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE (post_id, user_id)
      )
    `);

    console.log("Creating comments table...");
    await connection.execute(`
      CREATE TABLE comments (
        id CHAR(36) NOT NULL PRIMARY KEY,
        post_id CHAR(36) NOT NULL,
        user_id CHAR(36) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES posts(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    console.log("Creating comment_likes table...");
    await connection.execute(`
  CREATE TABLE comment_likes (
    id CHAR(36) NOT NULL PRIMARY KEY,
    comment_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (comment_id) REFERENCES comments(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE (comment_id, user_id)
  )
`);

    console.log("Creating follows table...");
    await connection.execute(`
      CREATE TABLE follows (
        id CHAR(36) NOT NULL PRIMARY KEY,
        follower_id CHAR(36) NOT NULL,
        following_id CHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (follower_id) REFERENCES users(id),
        FOREIGN KEY (following_id) REFERENCES users(id),
        UNIQUE (follower_id, following_id)
      )
    `);

    console.log("Creating roles table...");
    await connection.execute(`
      CREATE TABLE roles (
        id CHAR(36) NOT NULL PRIMARY KEY,
        name VARCHAR(25) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("Creating user_roles table...");
    await connection.execute(`
      CREATE TABLE user_roles (
        user_id CHAR(36) NOT NULL PRIMARY KEY,
        role_id CHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (role_id) REFERENCES roles(id)
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
    await connection.execute(
      "CREATE INDEX idx_comment_likes_comment_id ON comment_likes(comment_id)"
    );
    console.log("Creating indexes for roles tables...");
    await connection.execute(
      "CREATE INDEX idx_user_roles_user_id ON user_roles(user_id)"
    );
    await connection.execute(
      "CREATE INDEX idx_user_roles_role_id ON user_roles(role_id)"
    );

    console.log("Inserting default roles...");
    const userRoleId = uuidv4();
    const adminRoleId = uuidv4();

    await connection.execute("INSERT INTO roles (id, name) VALUES (?, ?)", [
      userRoleId,
      "user",
    ]);

    await connection.execute("INSERT INTO roles (id, name) VALUES (?, ?)", [
      adminRoleId,
      "admin",
    ]);

    console.log("Inserting sample users...");
    const hashedPassword = await bcrypt.hash("password", 10);
    const users = [
      {
        id: uuidv4(),
        username: "john_doe",
        email: "john@example.com",
        avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=john_doe",
        bio: "Software developer with a passion for open-source projects and hiking.",
        cover: "https://picsum.photos/seed/john_doe/1200/400",
      },
      {
        id: uuidv4(),
        username: "jane_smith",
        email: "jane@example.com",
        avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=jane_smith",
        bio: "Graphic designer who loves creating vibrant visuals and exploring new cuisines.",
        cover: "https://picsum.photos/seed/jane_smith/1200/400",
      },
      {
        id: uuidv4(),
        username: "bob_johnson",
        email: "bob@example.com",
        avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=bob_johnson",
        bio: "Data analyst by day, avid gamer by night.",
        cover: "https://picsum.photos/seed/bob_johnson/1200/400",
      },
      {
        id: uuidv4(),
        username: "alice_green",
        email: "alice@example.com",
        avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=alice_green",
        bio: "Environmental enthusiast and blogger focused on sustainable living.",
        cover: "https://picsum.photos/seed/alice_green/1200/400",
      },
      {
        id: uuidv4(),
        username: "mike_brown",
        email: "mike@example.com",
        avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=mike_brown",
        bio: "Fitness coach dedicated to helping others achieve their health goals.",
        cover: "https://picsum.photos/seed/mike_brown/1200/400",
      },
      {
        id: uuidv4(),
        username: "sara_wilson",
        email: "sara@example.com",
        avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=sara_wilson",
        bio: "Bookworm and aspiring author with a love for historical fiction.",
        cover: "https://picsum.photos/seed/sara_wilson/1200/400",
      },
      {
        id: uuidv4(),
        username: "tom_davis",
        email: "tom@example.com",
        avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=tom_davis",
        bio: "Photographer capturing the beauty of everyday moments.",
        cover: "https://picsum.photos/seed/tom_davis/1200/400",
      },
      {
        id: uuidv4(),
        username: "emily_jones",
        email: "emily@example.com",
        avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=emily_jones",
        bio: "Marketing specialist who enjoys traveling and learning new languages.",
        cover: "https://picsum.photos/seed/emily_jones/1200/400",
      },
      {
        id: uuidv4(),
        username: "dave_miller",
        email: "dave@example.com",
        avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=dave_miller",
        bio: "Musician and producer with a knack for blending genres.",
        cover: "https://picsum.photos/seed/dave_miller/1200/400",
      },
      {
        id: uuidv4(),
        username: "lisa_taylor",
        email: "lisa@example.com",
        avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=lisa_taylor",
        bio: "Animal lover and volunteer at local shelters.",
        cover: "https://picsum.photos/seed/lisa_taylor/1200/400",
      },
    ];

    for (const user of users) {
      await connection.execute(
        `
        INSERT INTO users (id, username, email, password, avatar, bio, cover, is_verified)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          user.id,
          user.username,
          user.email,
          hashedPassword,
          user.avatar,
          user.bio,
          user.cover,
          true,
        ]
      );
    }

    console.log("Creating admin user...");
    const adminId = uuidv4();
    const adminHashedPassword = await bcrypt.hash("Admin321!", 10);

    await connection.execute(
      `
      INSERT INTO users (id, username, email, password, avatar, bio, cover, is_verified)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        adminId,
        "admin",
        "admin@y.com",
        adminHashedPassword,
        "https://api.dicebear.com/6.x/avataaars/svg?seed=admin",
        "System administrator",
        "https://picsum.photos/seed/admin/1200/400",
        true,
      ]
    );

    console.log("Assigning roles to users...");
    // Assign user role to all users (including admin)
    for (const user of users) {
      await connection.execute(
        "INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)",
        [user.id, userRoleId]
      );
    }

    // Assign admin role to admin user only
    await connection.execute(
      "INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)",
      [adminId, adminRoleId]
    );

    console.log("Inserting sample posts...");
    const sampleContents = [
      "Just had an amazing cup of coffee!",
      "Working on a new project today.",
      "Can't wait for the weekend!",
      "Thinking about learning a new programming language.",
      "Just finished an interesting book about web development.",
      "Having a great day at the beach.",
      "Trying out a new recipe for dinner tonight.",
      "Missing the good old days of simple web development.",
      "Just adopted a new puppy!",
      "Excited about the upcoming tech conference.",
    ];

    const postIds = [];
    for (let i = 0; i < 100; i++) {
      const postId = uuidv4();
      const userIndex = Math.floor(Math.random() * users.length);
      const userId = users[userIndex].id;
      const contentIndex = i % sampleContents.length;
      const isPublic = Math.random() > 0.1 ? 1 : 0;
      const content = sampleContents[contentIndex];
      await connection.execute(
        "INSERT INTO posts (id, user_id, content, is_public) VALUES (?, ?, ?, ?)",
        [postId, userId, content, isPublic]
      );
      postIds.push(postId);
    }

    console.log("Inserting sample likes...");
    const addedLikes = new Set();
    for (let i = 0; i < 500; i++) {
      const postId = postIds[Math.floor(Math.random() * postIds.length)];
      const userIndex = Math.floor(Math.random() * users.length);
      const userId = users[userIndex].id;
      const likeKey = `${postId}-${userId}`;
      if (!addedLikes.has(likeKey)) {
        addedLikes.add(likeKey);
        await connection.execute(
          "INSERT INTO likes (id, post_id, user_id) VALUES (?, ?, ?)",
          [uuidv4(), postId, userId]
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
      "I've been thinking the same thing.",
      "Have you considered trying this approach?",
      "Keep up the good work!",
      "Can you explain more about this?",
      "Looking forward to more posts like this.",
    ];

    for (let i = 0; i < 200; i++) {
      const postId = postIds[Math.floor(Math.random() * postIds.length)];
      const userIndex = Math.floor(Math.random() * users.length);
      const userId = users[userIndex].id;
      const commentIndex = i % sampleComments.length;
      const content = sampleComments[commentIndex];
      await connection.execute(
        "INSERT INTO comments (id, post_id, user_id, content) VALUES (?, ?, ?, ?)",
        [uuidv4(), postId, userId, content]
      );
    }

    console.log("Inserting sample follows...");
    const addedFollows = new Set();
    for (let i = 0; i < 50; i++) {
      const followerIndex = Math.floor(Math.random() * users.length);
      const followingIndex = Math.floor(Math.random() * users.length);
      if (followerIndex !== followingIndex) {
        const followerId = users[followerIndex].id;
        const followingId = users[followingIndex].id;
        const followKey = `${followerId}-${followingId}`;
        if (!addedFollows.has(followKey)) {
          addedFollows.add(followKey);
          await connection.execute(
            "INSERT INTO follows (id, follower_id, following_id) VALUES (?, ?, ?)",
            [uuidv4(), followerId, followingId]
          );
        }
      }
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
