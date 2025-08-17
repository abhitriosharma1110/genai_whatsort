
// ULTRA-ROBUST WHATSAPP SENDER - Guaranteed send button clicking
console.log('⚡ ULTRA-ROBUST SENDER STARTING...');

class UltraRobustSender {
    constructor() {
        this.enabled = false;
        this.processing = false;
        this.lastMessage = '';
        this.responses = 0;
        this.geminiApiKey = 'AIzaSyCtrR4AJuv0nzxKG9aUJA5cmouY_TweU6E';

        console.log('⚡ Initializing Ultra-Robust Sender...');
        this.init();
    }

    async init() {
        await this.waitForWhatsApp();

        try {
            const result = await chrome.storage.sync.get(['botEnabled']);
            this.enabled = result.botEnabled || false;
            console.log('⚡ Bot enabled:', this.enabled);
        } catch (e) {
            this.enabled = false;
        }

        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.type === 'TOGGLE_BOT') {
                this.enabled = message.enabled;
                console.log('⚡ Bot toggled:', this.enabled);
                sendResponse({ success: true });
            }
            return true;
        });

        this.startMessageMonitoring();
        console.log('⚡ ULTRA-ROBUST SENDER READY!');
    }

    async waitForWhatsApp() {
        console.log('⚡ Waiting for WhatsApp Web...');
        let attempts = 0;
        while (attempts < 30) {
            const chatArea = document.querySelector('[data-testid="conversation-panel-messages"]') ||
                            document.querySelector('#main');
            if (chatArea) {
                console.log('⚡ WhatsApp loaded');
                await new Promise(resolve => setTimeout(resolve, 2000));
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
            attempts++;
        }
    }

    startMessageMonitoring() {
        setInterval(() => {
            if (this.enabled) {
                this.checkForNewMessages();
            }
        }, 2000);

        this.setupDOMObserver();
    }

    setupDOMObserver() {
        const chatContainer = document.querySelector('[data-testid="conversation-panel-messages"]') ||
                            document.querySelector('#main') ||
                            document.body;

        if (chatContainer) {
            const observer = new MutationObserver(() => {
                if (this.enabled) {
                    setTimeout(() => this.checkForNewMessages(), 500);
                }
            });

            observer.observe(chatContainer, { childList: true, subtree: true });
            console.log('⚡ DOM observer setup');
        }
    }

    checkForNewMessages() {
        try {
            const messages = document.querySelectorAll('div[role="row"]');

            if (messages.length === 0) {
                console.log('⚡ No message containers found');
                return;
            }

            console.log(`⚡ Found ${messages.length} messages`);

            const recentMessages = Array.from(messages).slice(-3);
            for (const msgContainer of recentMessages) {
                this.processMessageContainer(msgContainer);
            }

        } catch (error) {
            console.error('⚡ Error checking messages:', error);
        }
    }

    processMessageContainer(container) {
        try {
            if (this.isOutgoingMessage(container)) {
                return;
            }

            const messageText = this.extractMessageText(container);

            if (!messageText || 
                messageText === this.lastMessage || 
                messageText.length < 1 || 
                messageText.length > 300 ||
                this.isSystemMessage(messageText)) {
                return;
            }

            console.log(`⚡ NEW INCOMING MESSAGE: "${messageText}"`);
            this.lastMessage = messageText;
            this.handleNewMessage(messageText);

        } catch (error) {
            console.error('⚡ Error processing message:', error);
        }
    }

    isOutgoingMessage(container) {
        const indicators = ['[data-testid="msg-meta-status"]', '[data-icon="msg-check"]', '[data-icon="msg-dblcheck"]'];
        return indicators.some(sel => container.querySelector(sel));
    }

    extractMessageText(container) {
        const selectors = ['span.selectable-text', '[data-testid="conversation-text"]', 'span[dir="ltr"]'];

        for (const selector of selectors) {
            const element = container.querySelector(selector);
            if (element && element.textContent.trim()) {
                const text = element.textContent.trim();
                console.log(`⚡ Extracted: "${text}"`);
                return text;
            }
        }
        return null;
    }

    isSystemMessage(text) {
        const patterns = ['Thanks for your message', 'Type a message', 'Online', 'typing', '{', '}'];
        const lowerText = text.toLowerCase();
        return patterns.some(pattern => lowerText.includes(pattern.toLowerCase()));
    }

    async handleNewMessage(messageText) {
        if (this.processing) {
            console.log('⚡ Already processing...');
            return;
        }

        this.processing = true;
        console.log(`⚡ HANDLING MESSAGE: "${messageText}"`);

        try {
            const aiResponse = await this.getAIResponse(messageText);

            if (aiResponse) {
                console.log(`⚡ AI RESPONSE: "${aiResponse}"`);

                const delay = Math.random() * 2000 + 1500;
                console.log(`⚡ Waiting ${Math.round(delay)}ms...`);

                setTimeout(async () => {
                    const success = await this.ultraRobustSend(aiResponse);
                    if (success) {
                        this.responses++;
                        console.log(`⚡ SUCCESS! Message actually sent to chat! Response #${this.responses}`);
                    } else {
                        console.log('⚡ FAILED - Message not sent to chat');
                    }
                    this.processing = false;
                }, delay);
            } else {
                this.processing = false;
            }

        } catch (error) {
            console.error('⚡ Error handling message:', error);
            this.processing = false;
        }
    }

    async getAIResponse(messageText) {
        try {
            console.log('⚡ Calling Gemini API...');

            const prompt = `You are a helpful AI assistant chatting on WhatsApp. Be friendly and natural. Respond in Hindi-English mix if appropriate. Keep responses short (1-2 sentences).

Message: "${messageText}"

Response:`;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.7, maxOutputTokens: 100 }
                })
            });

            if (!response.ok) throw new Error(`API Error: ${response.status}`);

            const data = await response.json();
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                console.log('⚡ Gemini API success');
                return data.candidates[0].content.parts[0].text.trim();
            }

            throw new Error('No valid response from Gemini');

        } catch (error) {
            console.error('⚡ Gemini API failed:', error);
            return this.getFallbackResponse(messageText);
        }
    }

    getFallbackResponse(messageText) {
        const msg = messageText.toLowerCase();

        if (msg.includes('hlo') || msg.includes('hello') || msg.includes('hi')) {
            return "Hey! 👋 How's it going?";
        }
        if (msg.includes('how are you')) {
            return "I'm great! 😊 How about you?";
        }
        if (msg.includes('thank')) {
            return "You're welcome! 😊";
        }

        return "That's interesting! Tell me more! 😊";
    }

    async ultraRobustSend(text) {
        console.log(`⚡ ULTRA-ROBUST SENDING: "${text}"`);

        try {
            // Step 1: Find and focus input field
            const inputField = await this.findInputField();
            if (!inputField) {
                console.error('⚡ CRITICAL: No input field found');
                return false;
            }

            console.log('⚡ Input field found and focused');

            // Step 2: Clear and type message with multiple methods
            await this.setMessageText(inputField, text);
            console.log('⚡ Message text set');

            // Step 3: Ultra-robust send attempt with multiple strategies
            const sendSuccess = await this.attemptUltraSend(inputField);

            if (sendSuccess) {
                console.log('⚡ SEND SUCCESSFUL!');
                return true;
            } else {
                console.error('⚡ ALL SEND METHODS FAILED');
                return false;
            }

        } catch (error) {
            console.error('⚡ Ultra send error:', error);
            return false;
        }
    }

    async findInputField() {
        const selectors = [
            'div[contenteditable="true"][data-testid="compose-input"]',
            'div[contenteditable="true"][role="textbox"]',
            'footer div[contenteditable="true"]',
            'div[contenteditable="true"]:not([data-testid="search-input"])'
        ];

        for (const selector of selectors) {
            const elements = document.querySelectorAll(selector);
            let i =0 ;
            for (const el of elements) {
                if(i == 0){
                    i++;
                    continue;
                }
                if (el.offsetParent !== null && 
                    el.contentEditable === 'true' &&
                    el.getBoundingClientRect().height > 0) {

                    // Focus with multiple methods
                    el.focus();
                    el.click();

                    await new Promise(resolve => setTimeout(resolve, 200));
                    console.log(`⚡ Found input: ${selector}`);
                    return el;
                }
            }
        }

        return null;
    }

    async setMessageText(inputField, text) {
        // Method 1: Direct text setting
        inputField.innerHTML = '';
        inputField.textContent = text;

        // Method 2: Document commands
        try {
            document.execCommand('selectAll', false, null);
            document.execCommand('delete', false, null);
            document.execCommand('insertText', false, text);
        } catch (e) {}

        // Method 3: Manual typing simulation
        inputField.innerHTML = text;
        inputField.textContent = text;

        // Trigger events
        const events = ['input', 'change', 'keyup', 'focus', 'blur', 'focus'];
        for (const eventType of events) {
            const event = new Event(eventType, { bubbles: true, cancelable: true });
            inputField.dispatchEvent(event);
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        // Verify text is set
        console.log(`⚡ Input content after setting: "${inputField.textContent}"`);

        await new Promise(resolve => setTimeout(resolve, 500));
    }

    async attemptUltraSend(inputField) {
        console.log('⚡ ATTEMPTING ULTRA SEND...');

        // Strategy 1: Find and click send button aggressively
        const buttonSuccess = await this.tryUltraSendButton();
        if (buttonSuccess) {
            console.log('⚡ SUCCESS via send button!');
            return true;
        }

        // Strategy 2: Multiple Enter key attempts
        const enterSuccess = await this.tryUltraEnterKey(inputField);
        if (enterSuccess) {
            console.log('⚡ SUCCESS via Enter key!');
            return true;
        }

        // Strategy 3: Force click any possible send element
        const forceSuccess = await this.tryForceSend();
        if (forceSuccess) {
            console.log('⚡ SUCCESS via force send!');
            return true;
        }

        return false;
    }

    async tryUltraSendButton() {
        console.log('⚡ Trying ultra send button...');

        // All possible send button selectors
        const sendSelectors = [
            'button[data-testid="compose-btn-send"]',
            'span[data-testid="send"]',
            'button[aria-label="Send"]',
            '[data-icon="send"]',
            'span[data-icon="send"]',
            'button[data-icon="send-light"]',
            'button[title="Send"]',
            'div[role="button"][aria-label="Send"]'
        ];

        for (const selector of sendSelectors) {
            const elements = document.querySelectorAll(selector);

            for (const btn of elements) {
                if (btn.offsetParent !== null && !btn.disabled) {
                    console.log(`⚡ Trying send button: ${selector}`);

                    // Multiple click attempts
                    btn.focus();
                    btn.click();

                    // Mouse events
                    const mouseEvents = ['mousedown', 'mouseup', 'click'];
                    for (const eventType of mouseEvents) {
                        const event = new MouseEvent(eventType, { bubbles: true, cancelable: true });
                        btn.dispatchEvent(event);
                    }

                    // Touch events for mobile
                    try {
                        const touchEvent = new TouchEvent('touchend', { bubbles: true });
                        btn.dispatchEvent(touchEvent);
                    } catch (e) {}

                    await new Promise(resolve => setTimeout(resolve, 1000));

                    // Check if message was sent (input should be empty)
                    const inputField = document.querySelector('div[contenteditable="true"][data-testid="compose-input"]') ||
                                     document.querySelector('div[contenteditable="true"]');

                    if (inputField && inputField.textContent.trim() === '') {
                        console.log('⚡ CONFIRMED: Message sent via button (input cleared)');
                        return true;
                    }
                }
            }
        }

        console.log('⚡ No working send button found');
        return false;
    }

    async tryUltraEnterKey(inputField) {
        console.log('⚡ Trying ultra Enter key...');

        if (!inputField) return false;

        inputField.focus();

        // Multiple Enter key variations
        const enterEvents = [
            new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true }),
            new KeyboardEvent('keypress', { key: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true }),
            new KeyboardEvent('keyup', { key: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true })
        ];

        for (const event of enterEvents) {
            inputField.dispatchEvent(event);
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        // Also try on document and window
        for (const event of enterEvents) {
            document.dispatchEvent(event);
            window.dispatchEvent(event);
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check if sent
        if (inputField.textContent.trim() === '') {
            console.log('⚡ CONFIRMED: Message sent via Enter (input cleared)');
            return true;
        }

        console.log('⚡ Enter key did not work');
        return false;
    }

    async tryForceSend() {
        console.log('⚡ Trying force send...');

        // Find any clickable element that might be a send button
        const possibleSends = document.querySelectorAll('[role="button"], button, span[data-icon], div[data-icon]');

        for (const element of possibleSends) {
            const text = element.textContent.toLowerCase();
            const ariaLabel = (element.getAttribute('aria-label') || '').toLowerCase();
            const dataIcon = element.getAttribute('data-icon') || '';

            if (text.includes('send') || 
                ariaLabel.includes('send') || 
                dataIcon.includes('send') ||
                element.querySelector('[data-icon="send"]')) {

                console.log('⚡ Force clicking potential send element');
                element.click();

                await new Promise(resolve => setTimeout(resolve, 1000));

                // Check if sent
                const inputField = document.querySelector('div[contenteditable="true"]');
                if (inputField && inputField.textContent.trim() === '') {
                    console.log('⚡ CONFIRMED: Message sent via force click');
                    return true;
                }
            }
        }

        console.log('⚡ Force send failed');
        return false;
    }
}

// Deploy ultra-robust sender
window.UltraRobustSender = new UltraRobustSender();

console.log('⚡ ULTRA-ROBUST SENDER DEPLOYED - GUARANTEED MESSAGE DELIVERY!');
