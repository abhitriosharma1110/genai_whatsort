# WhatsApp AI Chat Bot Chrome Extension

An intelligent Chrome extension that automatically responds to WhatsApp Web messages using Google's Gemini AI.

## Features

- 🤖 **Automatic AI Responses**: Uses Gemini AI to generate human-like responses
- 🎯 **Smart Message Detection**: Detects incoming messages in real-time
- ⚙️ **Customizable Settings**: Configure response delays, keywords, and behavior
- 🚫 **Message Filtering**: Ignore specific keywords or only respond to certain triggers
- 📊 **Rate Limiting**: Prevent spam with intelligent message limits
- 🔒 **Privacy Focused**: All data stays on your device
- 🎨 **User-Friendly Interface**: Easy-to-use popup and settings page

## Installation

### From Source
1. Download or clone this extension
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The extension icon will appear in your toolbar

### Setup
1. Get a free Gemini API key from [Google AI Studio](https://ai.google.dev/)
2. Click the extension icon and go to Settings
3. Enter your API key and configure preferences
4. Navigate to [WhatsApp Web](https://web.whatsapp.com/)
5. Enable the bot using the extension popup
6. The bot will automatically respond to incoming messages!

## Configuration

### API Settings
- **Gemini API Key**: Your Google AI API key (required)
- **Test Connection**: Verify your API key works

### Response Settings
- **Response Delay**: How long to wait before responding (500-10000ms)
- **Typing Simulation**: Time to show "typing" effect (100-5000ms)
- **Max Response Length**: Maximum characters in responses (50-1000)

### Behavior Settings
- **Context Awareness**: Use chat history for better responses
- **Personalized Responses**: Adapt to conversation style
- **Respect Mute Settings**: Don't respond to muted chats

### Message Filters
- **Ignore Keywords**: Don't respond to messages with these words
- **Response Keywords**: Only respond to messages with these words

### Safety & Privacy
- **Message Logging**: Store messages locally for debugging
- **Rate Limiting**: Maximum responses per hour (1-100)

## Usage

1. **Enable the Bot**: Click the extension icon and toggle "Enable AI Bot"
2. **Monitor Activity**: View real-time statistics and activity logs
3. **Adjust Settings**: Fine-tune behavior through the settings page
4. **Control**: Easily enable/disable or adjust settings as needed

## How It Works

1. **Message Detection**: Uses MutationObserver to detect new messages in WhatsApp Web
2. **AI Processing**: Sends messages to Gemini AI for natural response generation
3. **Smart Sending**: Simulates human typing behavior and sends responses automatically
4. **Rate Limiting**: Prevents spam and respects conversation flow

## Privacy & Security

- ✅ All message processing happens locally on your device
- ✅ Only your messages and responses are sent to Gemini AI
- ✅ No data is stored on external servers
- ✅ API key is securely stored in Chrome's sync storage
- ✅ Complete control over which messages to respond to

## Troubleshooting

### Bot Not Responding
- Check if the bot is enabled in the popup
- Verify your API key in settings
- Ensure you're on WhatsApp Web (web.whatsapp.com)
- Check the activity log for error messages

### API Errors
- Test your API connection in settings
- Verify your API key is correct
- Check if you have API quota remaining
- Ensure internet connection is stable

### Message Detection Issues
- Refresh WhatsApp Web page
- Reload the extension in chrome://extensions/
- Check browser console for error messages

## Supported Platforms

- ✅ Chrome (Manifest V3)
- ✅ Microsoft Edge
- ✅ Other Chromium-based browsers
- ❌ Firefox (different extension API)
- ❌ Safari (different extension API)

## Development

### File Structure
```
whatsapp-ai-bot/
├── manifest.json          # Extension configuration
├── popup.html             # Main popup interface
├── popup.css              # Popup styling
├── popup.js               # Popup functionality
├── options.html           # Settings page
├── options.css            # Settings styling
├── options.js             # Settings functionality
├── content.js             # WhatsApp Web integration
├── background.js          # Service worker
├── injected.js            # Page context helper
└── README.md              # This file
```

### Key Components
- **Content Script**: Detects messages and handles automation
- **Background Service**: Manages API calls and state
- **Popup Interface**: User controls and monitoring
- **Options Page**: Detailed configuration

## License

This project is open source and available under the MIT License.

## Disclaimer

This extension is for educational and personal use only. Please respect WhatsApp's Terms of Service and use responsibly. The extension is not affiliated with WhatsApp or Meta.

## Support

For issues, questions, or contributions, please visit the project repository or contact the developer.

---

**Made with ❤️ for WhatsApp automation enthusiasts**
