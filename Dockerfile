FROM node:18-bullseye-slim

# Install ffmpeg
RUN apt-get update && \
    apt-get install -y --no-install-recommends ffmpeg && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY tsconfig.json .
COPY src ./src

# Build TypeScript
RUN npm run build || npx tsc -p .

# For production, we would use node dist/app.js directly,
# but the start script in package.json is: "npx tsc -p . && node dist/app.js"
# We can just copy the required structure
CMD ["npm", "start"]
