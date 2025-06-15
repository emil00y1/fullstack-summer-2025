FROM node:23-slim

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm ci --include=optional

COPY . .

# Build arguments
ARG NEXTAUTH_URL
ARG NODE_ENV=development

ENV NEXTAUTH_URL=$NEXTAUTH_URL
ENV NODE_ENV=$NODE_ENV

CMD ["npm", "run", "dev"]