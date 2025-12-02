# SAB Web Chat Widget

A modern, ChatGPT-style chat widget that connects to your AI agent via webhook.

## Features

- 🎨 Clean blue & white theme
- 💬 User messages on right, AI on left
- 💾 Conversation saved in localStorage
- 🐳 Docker ready for easy deployment
- 🌐 CORS enabled for embedding on any website

## Quick Start with Docker

### 1. Build and Run

```bash
# Build and start with docker-compose
docker-compose up -d --build
```

### 2. Verify it's running

```bash
# Check health endpoint
curl http://localhost:8080/health

# View the chat directly
# Open http://YOUR_VPS_IP:8080 in browser
```

### 3. Embed on Your Website

Add this to your website's HTML:

```html
<!-- Add to <head> -->
<link rel="stylesheet" href="http://YOUR_VPS_IP:8080/chat-widget.css">

<!-- Add CSS to style the container -->
<style>
  #sab-chat-container {
    max-width: 900px;
    height: 600px;
    margin: 0 auto;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  }
</style>

<!-- Add where you want the chat to appear -->
<div 
  id="sab-chat-container"
  data-title="AI Assistant"
  data-welcome-title="How can I help you today?"
  data-welcome-message="Ask me anything!"
></div>

<!-- Add before </body> -->
<script src="http://YOUR_VPS_IP:8080/chat-widget.js"></script>
```

Replace `YOUR_VPS_IP` with your actual VPS IP address or domain.

## Docker Commands

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Rebuild after changes
docker-compose up -d --build

# View logs
docker-compose logs -f

# Restart
docker-compose restart
```

## Run Without Docker

```bash
# Just run with Node.js
node server.js

# Server starts on port 8080
```

## Configuration

### Webhook

The webhook URL is in `chat-widget.js`:
```javascript
webhookUrl: 'https://hook.sellanybiz.ai/hook/38fd1b11-219f-454d-8bad-f4c21e2c26d7'
```

### Payload Format

Sent to webhook:
```json
{
  "users_msg_to_assistant": "User message",
  "userId": "User IP address"
}
```

Expected response:
```json
{
  "output": "AI response"
}
```

### Customization Options

Set these as `data-*` attributes on the container:

| Attribute | Description | Default |
|-----------|-------------|---------|
| `data-title` | Chat title | `AI Assistant` |
| `data-welcome-title` | Welcome heading | `How can I help you today?` |
| `data-welcome-message` | Welcome text | `Ask me anything...` |
| `data-placeholder` | Input placeholder | `Message AI Assistant...` |

## File Structure

```
sab-web-chat/
├── index.html          # Main chat page
├── chat-widget.css     # Styles
├── chat-widget.js      # Chat logic
├── server.js           # Node.js static server
├── package.json        # Node.js config
├── Dockerfile          # Docker image config
├── docker-compose.yml  # Docker compose config
├── embed.html          # Example embed code
└── README.md           # This file
```

## License

MIT License
