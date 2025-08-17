
// FIXED Background Script - Handles Gemini API calls to bypass CSP
class FixedBackgroundService {
    constructor() {
        this.apiKey = 'AIzaSyCtrR4AJuv0nzxKG9aUJA5cmouY_TweU6E';
        this.setupEventListeners();
        console.log('🔧 FixedBackgroundService initialized');
    }

    setupEventListeners() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true; // Keep message channel open for async response
        });
    }

    async handleMessage(message, sender, sendResponse) {
        try {
            switch (message.type) {
                case 'GENERATE_RESPONSE':
                    console.log('🎯 Background: Generating AI response for:', message.data.message);
                    const response = await this.generateAIResponse(message.data);
                    sendResponse({ success: true, response });
                    break;

                case 'GET_SETTINGS':
                    const settings = await this.getSettings();
                    sendResponse({ success: true, settings });
                    break;

                default:
                    sendResponse({ success: false, error: 'Unknown message type' });
            }
        } catch (error) {
            console.error('❌ Background service error:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    async generateAIResponse(data) {
        const { message } = data;

        try {
            console.log('📡 Background: Calling Gemini API...');

            const prompt = `You are chatting with someone on WhatsApp. Be friendly, natural, and conversational. Use emojis occasionally. Keep responses short (1-2 sentences max).

Message: "${message}"

Respond naturally and helpfully:`;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.8,
                        topP: 0.9,
                        topK: 40,
                        maxOutputTokens: 150
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API Error: ${errorData.error?.message || response.status}`);
            }

            const responseData = await response.json();

            if (responseData.candidates && responseData.candidates[0] && responseData.candidates[0].content) {
                let aiResponse = responseData.candidates[0].content.parts[0].text.trim();

                // Clean up response
                aiResponse = aiResponse.replace(/^(Bot:|AI:|Assistant:)\s*/i, '');

                // Limit length
                if (aiResponse.length > 200) {
                    aiResponse = aiResponse.substring(0, 197) + '...';
                }

                console.log('✅ Background: Gemini API success:', aiResponse);
                return aiResponse;
            }

            throw new Error('No valid response from Gemini');

        } catch (error) {
            console.error('❌ Background: Gemini API failed:', error);
            throw error;
        }
    }

    async getSettings() {
        const defaultSettings = {
            apiKey: this.apiKey,
            responseDelay: 3000,
            typingDelay: 1500,
            maxResponseLength: 200,
            contextAwareness: true
        };

        try {
            const result = await chrome.storage.sync.get(defaultSettings);
            return result;
        } catch (error) {
            return defaultSettings;
        }
    }
}

// Initialize background service
new FixedBackgroundService();
