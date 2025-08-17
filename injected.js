
// Injected Script for WhatsApp AI Bot
// This script runs in the page context (not isolated like content script)
// Use this for accessing page variables that content scripts cannot reach

(function() {
    'use strict';

    // Helper functions for WhatsApp Web interaction
    window.WhatsAppBotHelper = {
        // Get WhatsApp Web internal functions if needed
        getStore: function() {
            return window.Store || window.require('WAWebCollections').default;
        },

        // Send message using WhatsApp's internal API (if available)
        sendMessageInternal: function(chatId, message) {
            try {
                const Store = this.getStore();
                if (Store && Store.sendMessage) {
                    Store.sendMessage(chatId, message);
                    return true;
                }
            } catch (error) {
                console.error('Error using internal API:', error);
            }
            return false;
        },

        // Get current chat information
        getCurrentChat: function() {
            try {
                const Store = this.getStore();
                return Store && Store.Chat ? Store.Chat.getActive() : null;
            } catch (error) {
                console.error('Error getting current chat:', error);
                return null;
            }
        }
    };

    console.log('WhatsApp Bot Helper injected');
})();
