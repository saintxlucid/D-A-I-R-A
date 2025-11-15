FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install -g pnpm && pnpm install --frozen-lockfile
EXPOSE 4000
CMD ["pnpm", "start"]
