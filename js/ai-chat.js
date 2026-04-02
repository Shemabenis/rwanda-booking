/**
 * RwandaBooking AI Chat Assistant
 * Powered by Google Gemini API (with smart simulated fallback)
 *
 * To enable LIVE AI: paste your Gemini API key below.
 * Get a free key at: https://aistudio.google.com/app/apikey
 */

// ─── Gemini API Configuration ──────────────────────────────────────────────────
let GEMINI_API_KEY = localStorage.getItem('rwb_gemini_key') || ''; // Load from localStorage


// ─── System Context ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are "Amira", a friendly and knowledgeable AI travel assistant for RwandaBooking.com — Rwanda's premier travel booking platform.

Your personality: warm, helpful, knowledgeable about Rwanda, and concise (keep answers under 4 sentences unless the user needs more detail).

Current Language: ${localStorage.getItem('rwb_lang') || 'en'}. 
IMPORTANT: Always respond in the language that matches the "Current Language" above (e.g., if rw, speak Kinyarwanda; if fr, speak French; if sw, speak Swahili).

You help users with:
- Finding stays, flights, car rentals, and attractions in Rwanda
- Rwanda destinations: Kigali, Musanze (gorillas), Gisenyi/Rubavu (Lake Kivu), Akagera (safaris), Nyungwe (chimps), Volcanoes National Park
- Booking tips, pricing in RWF, visa info, best travel times
- Local culture, food, and safety in Rwanda
- Navigating RwandaBooking.com features

Always be encouraging about visiting Rwanda. If you don't know something specific, redirect to the relevant page on the site.
Current year: 2026. Currency: Rwandan Franc (RWF). 1 USD ≈ 1,300 RWF.`;

// Listener for language changes to update prompt context
document.addEventListener('langChanged', (e) => {
    // We can't easily update a const, but we can update the logic in callGeminiAPI
});

// ─── Simulated AI Responses (fallback when no API key) ─────────────────────────
const SIMULATED_RESPONSES = [
    {
        keywords: ['gorilla', 'gorillas', 'trek', 'trekking', 'volcanoes', 'mountain'],
        response: "🦍 **Gorilla trekking** in Volcanoes National Park is Rwanda's premier experience. Permits are RWF 1,040,000 ($800) for Africans and $1,500 for international tourists. We recommend staying in **Musanze** for the best access. Would you like to see available lodges near the park?"
    },
    {
        keywords: ['kigali', 'capital', 'city', 'convention'],
        response: "🌆 **Kigali** is incredibly safe, clean, and vibrant! Don't miss the Kigali Genocide Memorial, the colorful markets in Kimironko, and the Kigali Convention Centre at night. We have over 200 properties in Kigali ranging from budget guesthouses to 5-star hotels. Shall I show you the top-rated ones?"
    },
    {
        keywords: ['lake kivu', 'gisenyi', 'rubavu', 'kibuye', 'karongi', 'beach'],
        response: "🌊 **Lake Kivu** is the perfect place to relax. Gisenyi (Rubavu) is famous for its beaches and hot springs, while Kibuye (Karongi) offers stunning island views. You can enjoy boat rides, kayaking, and fresh 'Sambaza' fish. Would you like to see lakefront resorts?"
    },
    {
        keywords: ['akagera', 'safari', 'animals', 'wildlife', 'lion', 'elephant', 'big five'],
        response: "🦁 **Akagera National Park** is the only Big Five park in Rwanda! It's home to lions, rhinos, elephants, buffalos, and leopards. It's best reached by a 4x4 vehicle. Most people spend 1-2 nights at Safari lodges inside the park. Interested in booking a safari stay?"
    },
    {
        keywords: ['nyungwe', 'chimp', 'chimpanzee', 'canopy', 'forest', 'nature'],
        response: "🐒 **Nyungwe Forest** is one of the oldest rainforests in Africa. It's famous for the Canopy Walkway (70m high!) and chimpanzee tracking. It's a paradise for hikers and birdwatchers. Would you like to browse hotels near the Nyungwe park entrance?"
    },
    {
        keywords: ['hotel', 'hotels', 'stay', 'stays', 'accommodation', 'lodging', 'apartment', 'vantage'],
        response: "🏨 We offer a wide range of **accommodations** across Rwanda! From luxury hotels like the Kigali Marriott to cozy apartments and eco-lodges in the countryside. You can filter by price, rating, and amenities on our [Properties page](properties.html). Looking for a specific budget?"
    },
    {
        keywords: ['price', 'cost', 'expensive', 'cheap', 'budget', 'rate', 'how much', 'money', 'currency'],
        response: "💰 Prices in Rwanda are usually listed in **Rwandan Francs (RWF)**. Budget rooms start at RWF 15,000, mid-range at RWF 60,000, and luxury from RWF 150,000+. 1 USD is approximately 1,300 RWF. Do you have a specific price range in mind?"
    },
    {
        keywords: ['pay', 'payment', 'mobile money', 'momo', 'airtel', 'card', 'visa', 'mastercard'],
        response: "💳 We prioritize local payment methods! You can pay securely using **MTN Mobile Money (MoMo)**, **Airtel Money**, or International Credit/Debit cards. Mobile Money is the most popular way to pay instantly in Rwanda. Need help with a transaction?"
    },
    {
        keywords: ['visa', 'entry', 'passport', 'arriving', 'arrival'],
        response: "🛂 Rwanda has a very friendly visa policy! Citizens of the EAC and AU get **free visas on arrival**. Most other nationalities can get a 30-day tourist visa on arrival for $50. It's always best to check the official IREMBO portal for the latest rules. When are you planning to arrive?"
    },
    {
        keywords: ['transport', 'car', 'rental', 'taxi', 'driver', 'drive', 'motto', 'moto'],
        response: "🚗 Getting around is easy! In Kigali, 'Moto' taxis are everywhere for quick trips. For national parks, we highly recommend a 4x4 **[Car Rental](car-rentals.html)** with a professional driver-guide. Roads are excellent and very scenic! Need a car for your trip?"
    },
    {
        keywords: ['food', 'eat', 'restaurant', 'drink', 'beer', 'coffee'],
        response: "☕ You must try **Rwandan Coffee**—it's world-class! For food, look for 'Brochettes' (grilled skewers), 'Isombe', and 'Akabenz'. Kigali has amazing restaurants in the Kimihurura and Kiyovu areas. Want some specific restaurant recommendations?"
    },
    {
        keywords: ['weather', 'climate', 'rain', 'dry', 'season', 'best time'],
        response: "🌤️ Rwanda is the 'Land of Eternal Spring'! The **Best Time** to visit is June to September (dry season) for trekking, or December to February. Even in the rainy season (March-May), it usually rains for a few hours followed by sunshine. Planning a trip soon?"
    },
    {
        keywords: ['help', 'support', 'contact', 'customer', 'call', 'email'],
        response: "📞 We're here for you! You can reach our support team via the **[Contact page](contact.html)** or email support@rwandabooking.rw. We also have a 24/7 hotline for active bookings. How can I help you further?"
    },
    {
        keywords: ['who', 'what', 'about', 'company', 'company name'],
        response: "🇷🇼 **RwandaBooking** is the leading local platform for travelers in Rwanda. We are 100% Rwandan-owned and focused on promoting our beautiful country's hospitality to the world. Check out our [About Us](about.html) page to learn more!"
    },
    {
        keywords: ['list', 'host', 'partner', 'owner', 'register property'],
        response: "🏡 Are you a property owner? You can **[List Your Property](host.html)** on our platform for free! Reach thousands of travelers and manage your bookings easily via our portal. Ready to become a host?"
    }
];

// ─── Chat History (for Gemini multi-turn conversation) ─────────────────────────
let chatHistory = [];
let isChatOpen = false;
let isSettingsOpen = false;

// ─── Initialize ────────────────────────────────────────────────────────────────
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectChatWidget);
} else {
    injectChatWidget();
}

function injectChatWidget() {
    const widget = document.createElement('div');
    widget.id = 'ai-chat-widget';
    updateWidgetHTML(widget);
    document.body.appendChild(widget);

    // Initial event listeners
    attachChatListeners();

    // Show unread badge after 3 seconds
    setTimeout(() => {
        const badge = document.getElementById('chatUnreadBadge');
        if (badge && !isChatOpen) badge.style.display = 'flex';
    }, 3000);
}

function updateWidgetHTML(widget) {
    widget.innerHTML = `
    <!-- Chat Toggle Button -->
    <button class="chat-toggle-btn" id="chatToggleBtn" aria-label="Open AI Chat Assistant">
      <span class="chat-btn-icon" id="chatBtnIcon">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
        </svg>
      </span>
      <span class="chat-unread-badge" id="chatUnreadBadge">1</span>
    </button>

    <!-- Chat Panel -->
    <div class="chat-panel" id="chatPanel">
      <!-- Panel Header -->
      <div class="chat-header">
        <div class="chat-agent-info">
          <div class="chat-avatar">🤖</div>
          <div>
            <div class="chat-agent-name" data-i18n="chat_name">Amira</div>
            <div class="chat-agent-status">
              <span class="status-dot"></span> <span data-i18n="chat_agent_status">AI Assistant</span>
              ${GEMINI_API_KEY ? '<span class="ai-badge">Gemini Live</span>' : '<span class="ai-badge sim">Smart Mode</span>'}
            </div>
          </div>
        </div>
        <button class="chat-settings-btn" id="chatSettingsBtn" title="AI Settings">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
          </svg>
        </button>
      </div>

      <!-- Settings View (Hidden by default) -->
      <div id="settingsView" class="chat-settings-view" style="display:none;">
        <h3>AI Integration</h3>
        <p>Enable the real <strong>Gemini 2.0 Flash</strong> for the smartest, most appropriate travel responses.</p>
        
        <div class="api-key-box">
          <label for="geminiKey">Gemini API Key</label>
          <input type="password" id="geminiKey" placeholder="Paste your API key here..." value="${GEMINI_API_KEY}">
          <div class="api-key-links">
            <a href="https://aistudio.google.com/app/apikey" target="_blank">Get a free key &nearrow;</a>
          </div>
        </div>

        <div class="settings-actions">
           <button class="btn-save" onclick="saveGeminiKey()">Activate Gemini</button>
           <button class="btn-cancel" onclick="toggleSettings()">Back to Chat</button>
        </div>
        <p class="api-note">This key is saved locally in your browser only.</p>
      </div>

      <!-- Messages Area -->
      <div class="chat-messages" id="chatMessages">
        <div class="chat-msg bot">
          <div class="msg-bubble" data-i18n="chat_welcome">
            👋 Hi! I'm <strong>Amira</strong>, your RwandaBooking AI assistant — available 24/7!<br><br>
            I can help you find <strong>gorilla trekking</strong>, <strong>lake resorts</strong>, <strong>safaris</strong>, or the best stays in Kigali. What's your dream Rwanda trip? 🌍
          </div>
          <div class="msg-time">${getTime()}</div>
        </div>
        <div class="chat-quick-replies" id="quickReplies">
          <button onclick="sendQuickReply('Gorilla trekking in Volcanoes')" data-i18n="nav_attractions">🦍 Gorilla trekking</button>
          <button onclick="sendQuickReply('Best hotels in Kigali')" data-i18n="nav_stays">🏨 Kigali hotels</button>
          <button onclick="sendQuickReply('Lake Kivu resorts')">🌊 Lake Kivu</button>
          <button onclick="sendQuickReply('Safari in Akagera')">🦁 Akagera safari</button>
        </div>
      </div>

      <!-- Input Area -->
      <div class="chat-input-area" id="inputArea">
        <input type="text" id="chatInput" class="chat-input" placeholder="Ask me about Rwanda travel…" data-i18n="chat_input_placeholder" autocomplete="off">
        <button id="chatSendBtn" class="chat-send-btn" onclick="handleChatSend()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    </div>
  `;
    document.body.appendChild(widget);

    // Event listeners
    document.getElementById('chatToggleBtn').addEventListener('click', toggleChat);
    document.getElementById('chatInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleChatSend();
    });

    // Show unread badge after 3 seconds
    setTimeout(() => {
        const badge = document.getElementById('chatUnreadBadge');
        if (badge && !isChatOpen) badge.style.display = 'flex';
    }, 3000);
}

function toggleChat() {
    isChatOpen = !isChatOpen;
    const panel = document.getElementById('chatPanel');
    const badge = document.getElementById('chatUnreadBadge');

    panel.classList.toggle('open', isChatOpen);

    // Switch between chat icon and close icon based on open state
    const btn = document.getElementById('chatToggleBtn');
    if (isChatOpen) {
        btn.innerHTML = `
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
        `;
        if (badge) badge.style.display = 'none';
        setTimeout(() => document.getElementById('chatInput')?.focus(), 300);
    } else {
        btn.innerHTML = `
            <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
            </svg>
        `;
    }
}

function toggleSettings() {
    isSettingsOpen = !isSettingsOpen;
    const settingsView = document.getElementById('settingsView');
    const messagesArea = document.getElementById('chatMessages');
    const inputArea = document.getElementById('inputArea');

    if (isSettingsOpen) {
        settingsView.style.display = 'block';
        messagesArea.style.display = 'none';
        if (inputArea) inputArea.style.display = 'none';
    } else {
        settingsView.style.display = 'none';
        messagesArea.style.display = 'flex';
        if (inputArea) inputArea.style.display = 'flex';
    }
}

window.saveGeminiKey = function () {
    const key = document.getElementById('geminiKey').value.trim();
    if (!key) {
        alert('Please enter a valid API key.');
        return;
    }
    localStorage.setItem('rwb_gemini_key', key);
    GEMINI_API_KEY = key;

    // Refresh the widget UI to reflect "Live" status
    const widget = document.getElementById('ai-chat-widget');
    updateWidgetHTML(widget);
    attachChatListeners();

    toggleChat(); // Close then open to refresh
    setTimeout(() => toggleChat(), 100);

    alert('Gemini AI Activated! 🎉 You will now receive live, appropriate responses.');
};

window.toggleSettings = toggleSettings;


function sendQuickReply(text) {
    document.getElementById('quickReplies')?.remove();
    document.getElementById('chatInput').value = text;
    handleChatSend();
}

let isFirstUserMessage = true;

async function handleChatSend() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (!message) return;

    input.value = '';
    appendMessage('user', message);
    showTypingIndicator();

    const response = await getAIResponse(message);
    removeTypingIndicator();
    appendMessage('bot', response);

    if (isFirstUserMessage) {
        showApiHint();
        isFirstUserMessage = false;
    }

    scrollToBottom();
}

async function getAIResponse(userMessage) {
    // Try Gemini API first if key is provided
    if (GEMINI_API_KEY) {
        try {
            return await callGeminiAPI(userMessage);
        } catch (err) {
            console.warn('Gemini API error, falling back to simulated:', err);
        }
    }
    // Fallback: smart simulated responses
    return getSimulatedResponse(userMessage);
}

async function callGeminiAPI(userMessage) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    // Build conversation for multi-turn chat
    chatHistory.push({ role: 'user', parts: [{ text: userMessage }] });

    const body = {
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: chatHistory,
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 300
        }
    };

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (!res.ok) throw new Error(`API error: ${res.status}`);

    const data = await res.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response. Please try again!";
    chatHistory.push({ role: 'model', parts: [{ text: reply }] });
    return reply;
}

function getSimulatedResponse(message) {
    const lower = message.toLowerCase();
    let bestMatch = null;
    let maxHits = 0;

    // Check keyword matches to find the BEST match (most keywords hit)
    for (const item of SIMULATED_RESPONSES) {
        const hits = item.keywords.filter(kw => lower.includes(kw)).length;
        if (hits > maxHits) {
            maxHits = hits;
            bestMatch = item;
        }
    }

    if (bestMatch) {
        return new Promise(resolve => {
            setTimeout(() => resolve(bestMatch.response), 600 + Math.random() * 400);
        });
    }

    // Generic intelligent fallback
    const fallbacks = [
        `Great question! To give you the best advice, I'd suggest exploring our **[Properties](properties.html)**, **[Attractions](attractions.html)**, and **[Car Rentals](car-rentals.html)** pages. Is there a specific destination or experience in Rwanda you're interested in?`,
        `Rwanda has so much to offer! 🌿 From gorilla trekking in Volcanoes National Park to lake relaxation in Gisenyi, there's something for every traveler. Could you tell me more about what kind of experience you're looking for?`,
        `I'd love to help you plan your Rwanda adventure! Are you interested in **wildlife** (gorillas & safaris), **relaxation** (lake resorts), **culture** (Kigali city), or all of the above? 😊`,
    ];

    return new Promise(resolve => {
        setTimeout(() => resolve(fallbacks[Math.floor(Math.random() * fallbacks.length)]), 800 + Math.random() * 400);
    });
}

/**
 * Shows a helpful message about enabling real AI if no key is set
 */
function showApiHint() {
    if (GEMINI_API_KEY) return;
    const messages = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = 'chat-msg bot-hint';
    div.innerHTML = `
    <div class="msg-bubble hint-bubble">
      💡 <strong>Pro Tip:</strong> I'm currently in "Simulated Mode". To make me 10x smarter and handle any question, paste a free <strong>Gemini API Key</strong> in <code>js/ai-chat.js</code>!
    </div>
  `;
    messages.appendChild(div);
}


function appendMessage(role, text) {
    const messages = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = `chat-msg ${role}`;

    // Convert basic markdown to HTML
    const html = String(text)
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:var(--brand-primary)">$1</a>')
        .replace(/\n/g, '<br>');

    div.innerHTML = `
    <div class="msg-bubble">${html}</div>
    <div class="msg-time">${getTime()}</div>
  `;
    messages.appendChild(div);
    scrollToBottom();
}

function showTypingIndicator() {
    const messages = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = 'chat-msg bot';
    div.id = 'typingIndicator';
    div.innerHTML = `
    <div class="msg-bubble typing-bubble">
      <span class="dot"></span><span class="dot"></span><span class="dot"></span>
    </div>
  `;
    messages.appendChild(div);
    scrollToBottom();
}

function removeTypingIndicator() {
    document.getElementById('typingIndicator')?.remove();
}

function scrollToBottom() {
    const messages = document.getElementById('chatMessages');
    if (messages) messages.scrollTop = messages.scrollHeight;
}

function getTime() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
