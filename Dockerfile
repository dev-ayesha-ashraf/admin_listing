
FROM node:20-alpine AS build



WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Minimal production image using 'serve'
FROM node:20-alpine AS production

# Install 'serve' globally
RUN npm install -g serve

# Copy built static files from build stage
WORKDIR /app
COPY --from=build /app/dist ./dist

EXPOSE 4050
CMD ["serve","-s", "dist", "-l", "4050"]

