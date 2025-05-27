FROM node:23-slim

WORKDIR /app

COPY package.json ./
RUN npm install
COPY . .

# Add build arguments
ARG NEXTAUTH_URL
ARG NEXTAUTH_SECRET
ARG NODE_ENV=production

# Set them as environment variables for the build
ENV NEXTAUTH_URL=$NEXTAUTH_URL
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET
ENV NODE_ENV=$NODE_ENV

RUN npm run build

CMD ["npm", "start"]