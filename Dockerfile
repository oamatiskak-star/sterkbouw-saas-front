FROM node:18-alpine AS base
WORKDIR /app

# 1. Kopieer package.json eerst (voor betere caching)
COPY package*.json ./

# 2. Installeer dependencies
RUN npm install --production=false

# 3. Kopieer ALLE andere bestanden
COPY . .

# 4. Bouw de Next.js app
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
