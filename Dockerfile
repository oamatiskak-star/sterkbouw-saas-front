FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./

# Eerst: genereer package-lock.json als die er niet is
RUN if [ ! -f package-lock.json ]; then npm install; fi

# Daarna: voer de build uit (dit installeert ook dev dependencies)
RUN npm run build

# Voor productie: installeer alleen productie dependencies
RUN npm ci --only=production --ignore-scripts

COPY . .

EXPOSE 3000
CMD ["npm", "start"]
