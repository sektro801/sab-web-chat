/**
 * SAB Web Chat Widget
 * ChatGPT-style chat interface with localStorage persistence
 */

class SABChatWidget {
  constructor(config = {}) {
    this.config = {
      webhookUrl: 'https://hook.sellanybiz.ai/hook/38fd1b11-219f-454d-8bad-f4c21e2c26d7',
      containerId: config.containerId || 'sab-chat-container',
      title: config.title || 'AI Assistant',
      welcomeTitle: config.welcomeTitle || 'How can I help you today?',
      welcomeMessage: config.welcomeMessage || 'Ask me anything and I\'ll do my best to help!',
      placeholder: config.placeholder || 'Message AI Assistant...',
      storageKey: 'sab_chat_history',
      ...config
    };

    this.messages = [];
    this.userIP = null;
    this.isTyping = false;
    
    this.init();
  }

  async init() {
    await this.getUserIP();
    this.loadFromStorage();
    this.render();
    this.attachEventListeners();
    this.renderStoredMessages();
  }

  async getUserIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      this.userIP = data.ip;
    } catch (error) {
      console.warn('Could not fetch user IP:', error);
      this.userIP = 'unknown';
    }
  }

  // LocalStorage methods
  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (stored) {
        this.messages = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Could not load chat history:', error);
      this.messages = [];
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem(this.config.storageKey, JSON.stringify(this.messages));
    } catch (error) {
      console.warn('Could not save chat history:', error);
    }
  }

  getWelcomeHTML() {
    return `
      <div class="sab-welcome-message">
        <div class="sab-welcome-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 8V4H8"/>
            <rect width="16" height="12" x="4" y="8" rx="2"/>
            <path d="M2 14h2"/>
            <path d="M20 14h2"/>
            <path d="M15 13v2"/>
            <path d="M9 13v2"/>
          </svg>
        </div>
        <h1 class="sab-welcome-title">${this.config.welcomeTitle}</h1>
        <p class="sab-welcome-text">${this.config.welcomeMessage}</p>
      </div>
    `;
  }

  render() {
    const container = document.getElementById(this.config.containerId);
    if (!container) {
      console.error(`Container #${this.config.containerId} not found`);
      return;
    }

    container.innerHTML = `
      <div class="sab-chat-widget">
        <!-- Messages Area -->
        <div class="sab-chat-messages" id="sab-messages">
          ${this.getWelcomeHTML()}
        </div>

        <!-- Typing Indicator -->
        <div class="sab-typing-indicator" id="sab-typing">
          <div class="sab-typing-wrapper">
            <div class="sab-typing-content">
              <div class="sab-typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="sab-chat-input-container">
          <div class="sab-chat-input-wrapper">
            <textarea 
              class="sab-chat-input" 
              id="sab-input" 
              placeholder="${this.config.placeholder}"
              rows="1"
            ></textarea>
            <button class="sab-chat-send-btn" id="sab-send-btn" disabled>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z"/>
              </svg>
            </button>
          </div>
          <p class="sab-chat-disclaimer">AI can make mistakes. Please verify important information.</p>
        </div>
      </div>
    `;

    this.messagesContainer = document.getElementById('sab-messages');
    this.inputField = document.getElementById('sab-input');
    this.sendButton = document.getElementById('sab-send-btn');
    this.typingIndicator = document.getElementById('sab-typing');
  }

  renderStoredMessages() {
    if (this.messages.length > 0) {
      // Remove welcome message
      const welcomeMsg = this.messagesContainer.querySelector('.sab-welcome-message');
      if (welcomeMsg) {
        welcomeMsg.remove();
      }

      // Render all stored messages
      this.messages.forEach(msg => {
        this.renderMessage(msg.text, msg.type, msg.timestamp, false);
      });

      this.scrollToBottom();
    }
  }

  attachEventListeners() {
    // Send button click
    this.sendButton.addEventListener('click', () => this.sendMessage());

    // Enter key to send (Shift+Enter for new line)
    this.inputField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Enable/disable send button based on input
    this.inputField.addEventListener('input', () => {
      const hasText = this.inputField.value.trim().length > 0;
      this.sendButton.disabled = !hasText;
      this.autoResizeTextarea();
    });
  }

  autoResizeTextarea() {
    this.inputField.style.height = 'auto';
    this.inputField.style.height = Math.min(this.inputField.scrollHeight, 150) + 'px';
  }

  formatTime(date) {
    if (typeof date === 'string') {
      date = new Date(date);
    }
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  renderMessage(text, type, timestamp, animate = true) {
    const messageEl = document.createElement('div');
    messageEl.className = `sab-message ${type}`;
    if (!animate) {
      messageEl.style.animation = 'none';
    }

    const time = timestamp ? this.formatTime(timestamp) : this.formatTime(new Date());

    messageEl.innerHTML = `
      <div class="sab-message-wrapper">
        <div class="sab-message-content">
          <div class="sab-message-bubble">${this.escapeHtml(text)}</div>
          <span class="sab-message-time">${time}</span>
        </div>
      </div>
    `;

    this.messagesContainer.appendChild(messageEl);
  }

  addMessage(text, type = 'user') {
    // Remove welcome message on first message
    const welcomeMsg = this.messagesContainer.querySelector('.sab-welcome-message');
    if (welcomeMsg) {
      welcomeMsg.remove();
    }

    const timestamp = new Date().toISOString();
    
    // Render the message
    this.renderMessage(text, type, timestamp, true);
    this.scrollToBottom();

    // Store the message
    this.messages.push({
      text,
      type,
      timestamp
    });

    // Save to localStorage
    this.saveToStorage();
  }

  addErrorMessage(text) {
    const messageEl = document.createElement('div');
    messageEl.className = 'sab-message agent error';
    
    messageEl.innerHTML = `
      <div class="sab-message-wrapper">
        <div class="sab-message-content">
          <div class="sab-message-bubble">${this.escapeHtml(text)}</div>
          <span class="sab-message-time">${this.formatTime(new Date())}</span>
        </div>
      </div>
    `;

    this.messagesContainer.appendChild(messageEl);
    this.scrollToBottom();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  showTypingIndicator() {
    this.isTyping = true;
    this.typingIndicator.classList.add('active');
    this.scrollToBottom();
  }

  hideTypingIndicator() {
    this.isTyping = false;
    this.typingIndicator.classList.remove('active');
  }

  scrollToBottom() {
    setTimeout(() => {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }, 100);
  }

  async sendMessage() {
    const text = this.inputField.value.trim();
    if (!text || this.isTyping) return;

    // Clear input
    this.inputField.value = '';
    this.sendButton.disabled = true;
    this.autoResizeTextarea();

    // Add user message to UI
    this.addMessage(text, 'user');

    // Show typing indicator
    this.showTypingIndicator();

    try {
      // Send to webhook
      const response = await this.sendToWebhook(text);
      
      // Hide typing indicator
      this.hideTypingIndicator();

      // Add agent response
      if (response && response.output) {
        this.addMessage(response.output, 'agent');
      } else {
        this.addMessage('Thanks for your message!', 'agent');
      }
    } catch (error) {
      this.hideTypingIndicator();
      this.addErrorMessage('Sorry, something went wrong. Please try again.');
      console.error('Chat error:', error);
    }
  }

  async sendToWebhook(message) {
    const payload = {
      users_msg_to_assistant: message,
      userId: this.userIP
    };

    const response = await fetch(this.config.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Webhook error: ${response.status}`);
    }

    return await response.json();
  }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('sab-chat-container');
  if (container) {
    window.sabChat = new SABChatWidget({
      title: container.dataset.title || 'AI Assistant',
      welcomeTitle: container.dataset.welcomeTitle || 'How can I help you today?',
      welcomeMessage: container.dataset.welcomeMessage || 'Ask me anything and I\'ll do my best to help!',
      placeholder: container.dataset.placeholder || 'Message AI Assistant...'
    });
  }
});
