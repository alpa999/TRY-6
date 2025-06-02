# SpaceTalk.live - Try 6

A space-themed anonymous voice chat platform that enables global user connections through intelligent matching and real-time communication.

## Features

- **Real-time Voice Chat**: WebRTC-powered voice communication
- **Anonymous Matching**: Connect with strangers worldwide
- **Country Selection**: Choose preferred locations for matching
- **Auto-reconnect**: Automatically find new partners when enabled
- **Text Chat**: Backup communication method
- **Games**: Mini-games to play with your partner
- **Mobile Responsive**: Works on both desktop and mobile devices

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Development mode:
   ```bash
   npm run dev
   ```

3. Production build:
   ```bash
   npm run build
   npm start
   ```

## Deployment

### Render Deployment
1. Upload this folder to your Git repository
2. Create a new Web Service on Render
3. Connect your repository
4. Set build command: `npm install && npm run build`
5. Set start command: `npm start`

### Environment Variables
- `NODE_ENV`: Set to `production` for production deployment
- `PORT`: Automatically provided by hosting services
- `IPINFO_API_KEY`: Optional, for location detection

## Browser Requirements

- Modern browsers with WebRTC support
- Microphone access permission
- Secure context (HTTPS) for production

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, WebSocket
- **Voice**: WebRTC for peer-to-peer communication
- **Build**: Vite for frontend, ESBuild for backend

## Usage

1. Allow microphone access when prompted
2. Click the phone button (📞) to start searching
3. Enable auto-reconnect checkbox for continuous matching
4. Use text chat and games during conversations
5. Click Next to find a new partner

## License

MIT License