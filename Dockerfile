FROM node:20-alpine AS base
WORKDIR /app

# TEMPORARY: Dummy vars voor build fase
ENV NEXT_PUBLIC_SUPABASE_URL="https://dummy.supabase.co"
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkR1bW15IFRva2VuIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
ENV SUPABASE_SERVICE_ROLE_KEY="dummy"
ENV SUPABASE_JWT_SECRET="dummy"

COPY package*.json ./
RUN npm install --production=false
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
