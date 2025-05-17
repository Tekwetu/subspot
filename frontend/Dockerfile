FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Set build-time environment variables (these will be replaced by ARGs)
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Build the app with the environment variables
RUN npm run build

# Production image with Nginx to serve static files
FROM nginx:alpine

# Install envsubst for environment variable substitution
RUN apk add --no-cache gettext

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Set API URL for nginx config
ARG VITE_API_URL
ENV NGINX_API_URL=${VITE_API_URL}

# Copy nginx template and substitute API URL
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
RUN envsubst '$NGINX_API_URL' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]