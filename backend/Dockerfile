FROM node:20-slim
# Update OS packages to apply security fixes before installing app dependencies
RUN apt-get update && apt-get upgrade -y && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json package-lock*.json ./
# Use npm ci for reproducible installs and skip dev dependencies
RUN npm ci --omit=dev --no-fund

COPY . .
ENV NODE_ENV=production
CMD ["node", "server.js"]