# Step 1: Start with the official Node.js image
FROM node:16-alpine

# Step 2: Set the working directory
WORKDIR /app

# Step 3: Install dependencies
COPY package.json package-lock.json /app/
RUN npm install

# Step 4: Copy the rest of the application code
COPY . /app/

# Step 5: Expose port for the app (default 3000 for Node apps)
EXPOSE 3000

# Step 6: Set the entry point for the container (run the Node app)
CMD ["node", "page.jsx"]