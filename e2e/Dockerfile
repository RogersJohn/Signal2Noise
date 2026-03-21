FROM node:20-slim

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Copy source code
COPY public/ public/
COPY src/ src/
COPY tsconfig.json ./
COPY data/ data/

# Build the React app
RUN npm run build

# Serve with a lightweight static server
RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]
