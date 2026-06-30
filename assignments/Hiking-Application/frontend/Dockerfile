FROM node:18-alpine as builder

WORKDIR /app

# Copy frontend files
COPY frontend/ .

# No build step needed for static files, just verify structure
RUN ls -la

# Use Nginx to serve static files
FROM nginx:alpine

# Copy nginx config
COPY frontend/nginx.conf /etc/nginx/nginx.conf

# Copy frontend files
COPY frontend/ /usr/share/nginx/html/

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3001/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
