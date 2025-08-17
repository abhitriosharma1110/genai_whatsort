
class OptionsManager {
    constructor() {
        this.defaultSettings = {
            apiKey: '',
            responseDelay: 3000,
            typingDelay: 1500,
            maxResponseLength: 500,
            contextAwareness: true,
            personalizedResponses: true,
            respectMute: true,
            ignoreKeywords: '',
            responseKeywords: '',
            logMessages: false,
            rateLimitPerHour: 30
        };

        this.init();
    }

    async init() {
        await this.loadSettings();
        this.setupEventListeners();
    }

    async loadSettings() {
        try {
            const result = await chrome.storage.sync.get(this.defaultSettings);

            // Populate form fields
            document.getElementById('apiKey').value = result.apiKey || '';
            document.getElementById('responseDelay').value = result.responseDelay;
            document.getElementById('typingDelay').value = result.typingDelay;
            document.getElementById('maxResponseLength').value = result.maxResponseLength;
            document.getElementById('contextAwareness').checked = result.contextAwareness;
            document.getElementById('personalizedResponses').checked = result.personalizedResponses;
            document.getElementById('respectMute').checked = result.respectMute;
            document.getElementById('ignoreKeywords').value = result.ignoreKeywords || '';
            document.getElementById('responseKeywords').value = result.responseKeywords || '';
            document.getElementById('logMessages').checked = result.logMessages;
            document.getElementById('rateLimitPerHour').value = result.rateLimitPerHour;

        } catch (error) {
            console.error('Error loading settings:', error);
            this.showStatus('Error loading settings', 'error');
        }
    }

    setupEventListeners() {
        // Save settings button
        document.getElementById('saveSettings').addEventListener('click', () => {
            this.saveSettings();
        });

        // Reset settings button
        document.getElementById('resetSettings').addEventListener('click', () => {
            this.resetSettings();
        });

        // Test connection button
        document.getElementById('testConnection').addEventListener('click', () => {
            this.testApiConnection();
        });
    }

    async saveSettings() {
        try {
            const settings = {
                apiKey: document.getElementById('apiKey').value.trim(),
                responseDelay: parseInt(document.getElementById('responseDelay').value),
                typingDelay: parseInt(document.getElementById('typingDelay').value),
                maxResponseLength: parseInt(document.getElementById('maxResponseLength').value),
                contextAwareness: document.getElementById('contextAwareness').checked,
                personalizedResponses: document.getElementById('personalizedResponses').checked,
                respectMute: document.getElementById('respectMute').checked,
                ignoreKeywords: document.getElementById('ignoreKeywords').value.trim(),
                responseKeywords: document.getElementById('responseKeywords').value.trim(),
                logMessages: document.getElementById('logMessages').checked,
                rateLimitPerHour: parseInt(document.getElementById('rateLimitPerHour').value)
            };

            // Validation
            if (!settings.apiKey) {
                this.showStatus('Please enter your Gemini API key', 'error');
                return;
            }

            if (settings.responseDelay < 500 || settings.responseDelay > 10000) {
                this.showStatus('Response delay must be between 500 and 10000ms', 'error');
                return;
            }

            if (settings.typingDelay < 100 || settings.typingDelay > 5000) {
                this.showStatus('Typing delay must be between 100 and 5000ms', 'error');
                return;
            }

            if (settings.maxResponseLength < 50 || settings.maxResponseLength > 1000) {
                this.showStatus('Max response length must be between 50 and 1000 characters', 'error');
                return;
            }

            if (settings.rateLimitPerHour < 1 || settings.rateLimitPerHour > 100) {
                this.showStatus('Rate limit must be between 1 and 100 messages per hour', 'error');
                return;
            }

            await chrome.storage.sync.set(settings);
            this.showStatus('Settings saved successfully!', 'success');

        } catch (error) {
            console.error('Error saving settings:', error);
            this.showStatus('Error saving settings', 'error');
        }
    }

    async resetSettings() {
        if (confirm('Are you sure you want to reset all settings to defaults?')) {
            try {
                await chrome.storage.sync.clear();
                await this.loadSettings();
                this.showStatus('Settings reset to defaults', 'info');
            } catch (error) {
                console.error('Error resetting settings:', error);
                this.showStatus('Error resetting settings', 'error');
            }
        }
    }

    async testApiConnection() {
        const apiKey = document.getElementById('apiKey').value.trim();

        if (!apiKey) {
            this.showStatus('Please enter API key first', 'error');
            return;
        }

        const testBtn = document.getElementById('testConnection');
        testBtn.textContent = 'Testing...';
        testBtn.disabled = true;

        try {
            // FIXED: Use correct model and API endpoint
            const model = 'gemini-1.5-flash';
            const apiUrl = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: 'Test connection - respond with "Connection successful"'
                        }]
                    }],
                    generationConfig: {
                        maxOutputTokens: 50,
                        temperature: 0.1
                    }
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                    const responseText = data.candidates[0].content.parts[0].text;
                    this.showStatus(`✅ API connection successful! Response: ${responseText}`, 'success');
                } else {
                    this.showStatus('❌ API responded but no content received', 'error');
                }
            } else {
                const errorData = await response.json().catch(() => ({}));
                this.showStatus(`❌ API Error: ${errorData.error?.message || 'Invalid API key or request failed'}`, 'error');
            }

        } catch (error) {
            console.error('Connection test error:', error);
            this.showStatus('❌ Connection failed: ' + error.message, 'error');
        } finally {
            testBtn.textContent = 'Test Connection';
            testBtn.disabled = false;
        }
    }

    showStatus(message, type = 'info') {
        const statusEl = document.getElementById('statusMessage');
        statusEl.textContent = message;
        statusEl.className = `status-message ${type} show`;

        // Hide after 5 seconds
        setTimeout(() => {
            statusEl.classList.remove('show');
        }, 5000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new OptionsManager();
});
