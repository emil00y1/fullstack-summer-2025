const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
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
    await connection.execute("DROP TABLE IF EXISTS post_hashtags");
    await connection.execute("DROP TABLE IF EXISTS hashtags");
    await connection.execute("DROP TABLE IF EXISTS comment_likes");
    await connection.execute("DROP TABLE IF EXISTS comments");
    await connection.execute("DROP TABLE IF EXISTS likes");
    await connection.execute("DROP TABLE IF EXISTS follows");
    await connection.execute("DROP TABLE IF EXISTS reposts");
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
        deleted_at TIMESTAMP NULL,
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

    console.log("Creating hashtags table...");
    await connection.execute(`
      CREATE TABLE hashtags (
        id CHAR(36) NOT NULL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_hashtag_name (name)
      )
    `);

    console.log("Creating post_hashtags junction table...");
    await connection.execute(`
      CREATE TABLE post_hashtags (
        post_id CHAR(36) NOT NULL,
        hashtag_id CHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (post_id, hashtag_id),
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY (hashtag_id) REFERENCES hashtags(id) ON DELETE CASCADE
      )
    `);

    console.log("Creating reposts table...");
    await connection.execute(`
      CREATE TABLE reposts (
        id CHAR(36) NOT NULL PRIMARY KEY,
        user_id CHAR(36) NOT NULL,
        post_id CHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (post_id) REFERENCES posts(id),
        UNIQUE (user_id, post_id)
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
      "CREATE INDEX idx_posts_user_id ON posts(user_id)"
    );
    await connection.execute(
      "CREATE INDEX idx_likes_post_id ON likes(post_id)"
    );
    await connection.execute(
      "CREATE INDEX idx_comments_post_id ON comments(post_id)"
    );
    await connection.execute(
      "CREATE INDEX idx_post_hashtags_hashtag_id ON post_hashtags(hashtag_id)"
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
    for (const user of users) {
      await connection.execute(
        "INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)",
        [user.id, userRoleId]
      );
    }

    await connection.execute(
      "INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)",
      [adminId, adminRoleId]
    );

    console.log("Creating sample hashtags...");
    const sampleHashtags = [
      "javascript",
      "react",
      "nextjs",
      "webdev",
      "coding",
      "programming",
      "tech",
      "ai",
      "machinelearning",
      "typescript",
      "nodejs",
      "frontend",
      "backend",
      "fullstack",
      "design",
      "ui",
      "ux",
      "css",
      "html",
      "productivity",
      "motivation",
      "learning",
      "tutorial",
      "tips",
      "career",
      "startup",
      "entrepreneur",
      "business",
      "innovation",
    ];

    const hashtagIds = {};
    for (const tagName of sampleHashtags) {
      const hashtagId = uuidv4();
      await connection.execute(
        "INSERT INTO hashtags (id, name) VALUES (?, ?)",
        [hashtagId, tagName]
      );
      hashtagIds[tagName] = hashtagId;
    }

    console.log("Inserting sample posts with hashtags...");
    const sampleContents = [
      "Just finished building an amazing #react component with #typescript! #webdev",
      "Working on a new #nextjs project today. The developer experience is incredible! #javascript",
      "Can't wait for the weekend to work on my #programming side project!",
      "Learning #machinelearning fundamentals. The math is challenging but rewarding!",
      "Just deployed my first #fullstack application using #nodejs and #react.",
      "Amazing #ui design inspiration from Dribbble today. Time to implement!",
      "Reading about #typescript best practices. Types make everything better!",
      "Coffee ☕ + #coding = perfect morning.",
      "New tutorial on CSS grid layouts is live! Check it out.",
      "Excited about the new #react features in the latest release!",
      "Building a startup is hard but rewarding. #entrepreneur",
      "Great productivity tips for developers: use the Pomodoro technique! #career",
      "Just discovered this amazing #nodejs library.",
      "Working late on this #webdev project but making great progress!",
      "The future of #ai is here. Excited to see what we build next!",
      "No code today, just relaxing with a good book.",
      "Finally figured out how to optimize lazy loading in #nextjs.",
      "Love the developer community on Twitter!",
      "Experimenting with #threejs for the first time. It's wild!",
      "Finished setting up my new #dev environment. Clean and fast!",
      "First PR accepted in an open-source repo! Feeling proud. #opensource",
      "Weekend hackathon starts now! #build",
      "Reading about clean architecture in software design. Fascinating stuff.",
      "Trying out #svelte — the syntax feels super refreshing.",
      "Today I realized how powerful #regex can be. Mind blown.",
      "Built a CLI tool in #golang to automate my dev workflows.",
      "Anyone else obsessed with #darkmode?",
      "UI polishing takes longer than expected, but it's worth it.",
      "Mobile responsiveness is no joke. 😅",
      "Took a deep dive into #docker networking. Not as scary as I thought.",
      "Experimenting with #tailwindcss — loving the flexibility.",
      "First time setting up #firebase auth. Surprisingly smooth.",
      "Finally nailed down my #portfolio design.",
      "Happy with my app’s new loading spinner. Details matter!",
      "Stumbled upon an old project today. Growth is real.",
      "Coding with lo-fi beats hits different.",
      "What are your favorite #coding playlists?",
      "Learned more today failing than I did succeeding.",
      "Refactored 500 lines down to 150. #cleancode",
      "Just submitted my app to the store. Fingers crossed!",
      "Debugged a production issue in under 5 minutes. Rare win. 😂",
      "Pair programming sessions are always productive. #teamwork",
      "Tech interviews should be more humane. #tech",
      "Built a chat app with #socketio and #express. Real-time magic.",
      "Tried #astrojs today. Definitely an interesting take on modern frontend.",
      "Upgrading legacy codebases is like archaeology.",
      "My keyboard is starting to show wear from all the typing!",
      "Running performance audits — every millisecond counts.",
      "Been obsessed with optimizing bundle sizes lately. #performance",
      "Finally grasped closures in #javascript.",
      "Hacky prototype is now an actual MVP. #progress",
      "Adding dark mode support today. 🌑 #ui",
      "That moment when you fix a bug just by taking a break.",
      "Never underestimate a good commit message.",
      "Writing tech documentation today. It matters more than you think. #writing #dev",
      "Code reviews are underrated. So much to learn! #collaboration #learning",
    ];

    // Store post IDs separately to avoid confusion
    const allPostIds = [];
    const postData = [];

    for (let i = 0; i < 100; i++) {
      const postId = uuidv4();
      const userIndex = Math.floor(Math.random() * users.length);
      const userId = users[userIndex].id;
      const contentIndex = i % sampleContents.length;
      const isPublic = Math.random() > 0.1 ? 1 : 0;
      let content = sampleContents[contentIndex];

      // Add some random variation
      if (Math.random() > 0.7) {
        content += ` #${
          sampleHashtags[Math.floor(Math.random() * sampleHashtags.length)]
        }`;
      }

      await connection.execute(
        "INSERT INTO posts (id, user_id, content, is_public) VALUES (?, ?, ?, ?)",
        [postId, userId, content, isPublic]
      );

      // Store just the IDs for likes/comments
      allPostIds.push(postId);
      // Store full data for hashtag processing
      postData.push({ id: postId, content });
    }

    console.log("Linking posts with hashtags...");
    for (const post of postData) {
      // Extract hashtags from content
      const hashtagMatches = post.content.match(/#\w+/g) || [];

      for (const hashtagMatch of hashtagMatches) {
        const tagName = hashtagMatch.substring(1).toLowerCase();
        if (hashtagIds[tagName]) {
          try {
            await connection.execute(
              "INSERT INTO post_hashtags (post_id, hashtag_id) VALUES (?, ?)",
              [post.id, hashtagIds[tagName]]
            );
          } catch (error) {
            // Ignore duplicate key errors
            if (!error.message.includes("Duplicate entry")) {
              console.error("Error inserting post hashtag:", error);
            }
          }
        }
      }
    }

    console.log("Inserting sample likes...");
    const addedLikes = new Set();
    for (let i = 0; i < 500; i++) {
      const postId = allPostIds[Math.floor(Math.random() * allPostIds.length)];
      const userIndex = Math.floor(Math.random() * users.length);
      const userId = users[userIndex].id;
      const likeKey = `${postId}-${userId}`;

      if (!addedLikes.has(likeKey)) {
        addedLikes.add(likeKey);

        // Debug: Verify the length of IDs before insertion
        if (postId.length !== 36 || userId.length !== 36) {
          console.error(
            `Invalid ID length - postId: ${postId.length}, userId: ${userId.length}`
          );
          continue;
        }

        try {
          await connection.execute(
            "INSERT INTO likes (id, post_id, user_id) VALUES (?, ?, ?)",
            [uuidv4(), postId, userId]
          );
        } catch (error) {
          console.error(
            `Error inserting like for postId: ${postId} (length: ${postId.length}), userId: ${userId} (length: ${userId.length})`
          );
          console.error(error.message);
        }
      }
    }

    console.log("Inserting sample comments...");
    const sampleComments = [
      "Great post! #coding",
      "I totally agree with you.",
      "Interesting perspective on #webdev.",
      "Thanks for sharing! #learning",
      "This made my day. #motivation",
      "I've been thinking the same thing about #react.",
      "Have you considered trying #typescript for this?",
      "Keep up the good work! #programming",
      "Can you explain more about this #ai concept?",
      "Looking forward to more posts like this. #tech",
      "Love this insight!",
      "I learned something new today, thanks.",
      "Do you have a link to the resource you mentioned?",
      "Absolutely brilliant.",
      "Really helpful explanation.",
      "Bookmarking this for later.",
      "I ran into the same issue yesterday!",
      "Nice breakdown of the topic.",
      "This should be shared more widely.",
      "Thanks! Just what I needed.",
      "Clear and concise. Appreciate it!",
      "This is gold. #frontend",
      "Not sure I agree, but interesting take.",
      "You nailed it. #javascript",
      "Going to try this out today!",
      "I wish I saw this earlier.",
      "Mind if I share this? #devtips",
      "Helpful for beginners too. #learning #webdev",
      "Thanks for the write-up!",
      "Great job explaining the concept.",
      "This solved my problem. 🙌",
      "This is underrated content.",
      "Can you do a follow-up post on this?",
      "Nice use of visuals!",
      "Makes total sense now.",
      "Short and to the point. I like it.",
      "The example really helped. #clarity",
      "This is the kind of content I love. #tech",
      "Will this work with #vue too?",
      "Your posts keep getting better!",
    ];

    for (let i = 0; i < 200; i++) {
      const postId = allPostIds[Math.floor(Math.random() * allPostIds.length)];
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

    console.log("Inserting sample reposts...");
    const addedReposts = new Set();
    for (let i = 0; i < 30; i++) {
      const userIndex = Math.floor(Math.random() * users.length);
      const postIndex = Math.floor(Math.random() * allPostIds.length);

      const userId = users[userIndex].id;
      const postId = allPostIds[postIndex];

      // Get the original post author to prevent self-reposts
      const postAuthor = await connection.execute(
        "SELECT user_id FROM posts WHERE id = ?",
        [postId]
      );

      // Don't allow users to repost their own posts
      if (postAuthor[0] && postAuthor[0][0].user_id !== userId) {
        const repostKey = `${userId}-${postId}`;
        if (!addedReposts.has(repostKey)) {
          addedReposts.add(repostKey);
          await connection.execute(
            "INSERT INTO reposts (id, user_id, post_id) VALUES (?, ?, ?)",
            [uuidv4(), userId, postId]
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
