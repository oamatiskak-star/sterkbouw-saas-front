FROM node:18-alpine AS base

# Stel de submap in waar je Next.js project staat
ARG PROJECT_DIR=frontend
WORKDIR /app
COPY ${PROJECT_DIR}/package*.json ./

# Installeer dependencies
RUN npm install --production=false

# Kopieer de rest van je project
COPY ${PROJECT_DIR} ./

# Bouw de Next.js app
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
