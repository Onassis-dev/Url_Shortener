FROM oven/bun:1.2-alpine

WORKDIR /app

COPY . .

CMD ["bun", "index.js"]