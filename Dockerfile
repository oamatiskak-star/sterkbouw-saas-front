FROM node:20-alpine AS base  # ← Verander van 18 naar 20
WORKDIR /app

COPY package*.json ./
RUN npm install --production=false
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
