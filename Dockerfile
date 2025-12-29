FROM node:18-alpine AS base
WORKDIR /app

# 1. Kopieer package.json en package-lock.json
COPY package*.json ./

# 2. Installeer dependencies (inclusief dev dependencies voor build)
RUN npm install --production=false

# 3. Kopieer ALLES behalve wat in .dockerignore staat
COPY . .

# 4. Bouw de Next.js app
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
