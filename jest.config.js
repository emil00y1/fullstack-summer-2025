const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",

  // Module name mapping for your path aliases
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },

  // Coverage collection
  collectCoverageFrom: [
    "components/**/*.{js,jsx}",
    "utils/**/*.{js,jsx}",
    "lib/**/*.{js,jsx}",
    "app/**/*.{js,jsx}",
    "!app/**/layout.{js,jsx}",
    "!app/**/loading.{js,jsx}",
    "!app/**/not-found.{js,jsx}",
    "!app/**/page.{js,jsx}",
    "!**/node_modules/**",
    "!**/.next/**",
  ],

  // Test file patterns
  testMatch: ["**/__tests__/**/*.(js|jsx)", "**/*.(test|spec).(js|jsx)"],

  // Ignore patterns
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],

  // Transform ignore patterns (for ES modules in node_modules)
  transformIgnorePatterns: ["/node_modules/(?!(.*\\.mjs$|lucide-react))"],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config
module.exports = createJestConfig(customJestConfig);
