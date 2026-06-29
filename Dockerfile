# Stage 1: Build frontend React app
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production Express backend and static server
FROM node:20-alpine
WORKDIR /app

# Install ffmpeg for video wallpaper transcoding
RUN apk add --no-cache ffmpeg

COPY package*.json ./
# Install production dependencies only
RUN npm ci --only=production

# Copy express backend and static assets
COPY server.js ./
COPY --from=builder /app/dist ./dist

# Define volume for persistent database and uploads
VOLUME /app/data

# Port configuration
EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

CMD ["node", "server.js"]
