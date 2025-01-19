FROM oven/bun:latest AS builder 
WORKDIR /frontend
COPY . /frontend 
RUN bun install
RUN bun run build

FROM caddy:latest AS runner
COPY --from=builder /frontend/dist /var/www/html
COPY Caddyfile /etc/caddy/Caddyfile

EXPOSE 80
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]