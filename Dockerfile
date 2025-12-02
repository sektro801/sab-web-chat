FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json ./

# Copy application files
COPY server.js ./
COPY index.html ./
COPY chat-widget.css ./
COPY chat-widget.js ./

# Expose port
EXPOSE 6750

# Start server
CMD ["node", "server.js"]
