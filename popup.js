
class PopupManager {
    constructor() {
        this.init();
    }

    async init() {
        await this.loadState();
        this.setupEventListeners();
        this.updateStatus();
    }

    async loadState() {
        try {
            const result = await chrome.storage.sync.get([
                'botEnabled', 
                'messageCount', 
                'responseCount', 
                'activityLog'
            ]);

            this.botEnabled = result.botEnabled || false;
            this.messageCount = result.messageCount || 0;
            this.responseCount = result.responseCount || 0;
            this.activityLog = result.activityLog || [];

            // Update UI
            document.getElementById('botToggle').checked = this.botEnabled;
            document.getElementById('messageCount').textContent = this.messageCount;
            document.getElementById('responseCount').textContent = this.responseCount;

            this.renderActivityLog();
        } catch (error) {
            console.error('Error loading state:', error);
        }
    }

    setupEventListeners() {
        // Bot toggle
        document.getElementById('botToggle').addEventListener('change', (e) => {
            this.toggleBot(e.target.checked);
        });

        // Options button
        document.getElementById('optionsBtn').addEventListener('click', () => {
            chrome.runtime.openOptionsPage();
        });

        // Clear log button
        document.getElementById('clearLogBtn').addEventListener('click', () => {
            this.clearLog();
        });

        // Listen for updates from content script
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.type === 'UPDATE_STATS') {
                this.updateStats(message.data);
            } else if (message.type === 'ADD_LOG') {
                this.addLogEntry(message.data);
            }
        });
    }

    async toggleBot(enabled) {
        this.botEnabled = enabled;

        try {
            await chrome.storage.sync.set({ botEnabled: enabled });

            // Send message to content script
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab && tab.url.includes('web.whatsapp.com')) {
                chrome.tabs.sendMessage(tab.id, {
                    type: 'TOGGLE_BOT',
                    enabled: enabled
                });
            }

            this.updateStatus();
            this.addLogEntry(`Bot ${enabled ? 'enabled' : 'disabled'}`);
        } catch (error) {
            console.error('Error toggling bot:', error);
        }
    }

    updateStatus() {
        const statusDot = document.getElementById('statusDot');
        const statusText = document.getElementById('statusText');

        if (this.botEnabled) {
            statusDot.classList.add('active');
            statusText.textContent = 'Active';
        } else {
            statusDot.classList.remove('active');
            statusText.textContent = 'Inactive';
        }
    }

    updateStats(data) {
        if (data.messageCount !== undefined) {
            this.messageCount = data.messageCount;
            document.getElementById('messageCount').textContent = this.messageCount;
        }

        if (data.responseCount !== undefined) {
            this.responseCount = data.responseCount;
            document.getElementById('responseCount').textContent = this.responseCount;
        }

        chrome.storage.sync.set({
            messageCount: this.messageCount,
            responseCount: this.responseCount
        });
    }

    addLogEntry(message) {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = `${timestamp}: ${message}`;

        this.activityLog.unshift(logEntry);
        if (this.activityLog.length > 20) {
            this.activityLog = this.activityLog.slice(0, 20);
        }

        this.renderActivityLog();
        chrome.storage.sync.set({ activityLog: this.activityLog });
    }

    renderActivityLog() {
        const container = document.getElementById('logContainer');
        container.innerHTML = '';

        this.activityLog.forEach(entry => {
            const div = document.createElement('div');
            div.className = 'log-item';
            div.textContent = entry;
            container.appendChild(div);
        });
    }

    clearLog() {
        this.activityLog = [];
        this.renderActivityLog();
        chrome.storage.sync.set({ activityLog: [] });
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PopupManager();
});
