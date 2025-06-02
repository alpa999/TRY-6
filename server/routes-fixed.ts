import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import type { WSMessage, UserConnection, VoiceOffer, VoiceAnswer, IceCandidate } from "@shared/schema";

interface ConnectedUser {
  ws: WebSocket;
  id: string;
  country: string;
  countryCode: string;
  flag: string;
  isSearching: boolean;
  partnerId?: string;
}

const connectedUsers = new Map<string, ConnectedUser>();
const searchQueue: string[] = [];

const countries = [
  { code: 'us', name: 'United States', flag: '🇺🇸' },
  { code: 'gb', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'de', name: 'Germany', flag: '🇩🇪' },
  { code: 'fr', name: 'France', flag: '🇫🇷' },
  { code: 'jp', name: 'Japan', flag: '🇯🇵' },
  { code: 'kr', name: 'South Korea', flag: '🇰🇷' },
  { code: 'ca', name: 'Canada', flag: '🇨🇦' },
  { code: 'au', name: 'Australia', flag: '🇦🇺' },
  { code: 'br', name: 'Brazil', flag: '🇧🇷' },
  { code: 'in', name: 'India', flag: '🇮🇳' },
  { code: 'mx', name: 'Mexico', flag: '🇲🇽' },
  { code: 'it', name: 'Italy', flag: '🇮🇹' },
  { code: 'es', name: 'Spain', flag: '🇪🇸' },
  { code: 'ru', name: 'Russia', flag: '🇷🇺' },
  { code: 'cn', name: 'China', flag: '🇨🇳' },
  { code: 'ar', name: 'Argentina', flag: '🇦🇷' },
  { code: 'se', name: 'Sweden', flag: '🇸🇪' },
  { code: 'no', name: 'Norway', flag: '🇳🇴' },
  { code: 'nl', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'ch', name: 'Switzerland', flag: '🇨🇭' },
];

function getCountryName(countryCode: string): string {
  const countryNames: { [key: string]: string } = {
    'us': 'United States', 'gb': 'United Kingdom', 'de': 'Germany', 'fr': 'France',
    'jp': 'Japan', 'kr': 'South Korea', 'ca': 'Canada', 'au': 'Australia',
    'br': 'Brazil', 'in': 'India', 'mx': 'Mexico', 'it': 'Italy',
    'es': 'Spain', 'ru': 'Russia', 'cn': 'China', 'ar': 'Argentina',
    'se': 'Sweden', 'no': 'Norway', 'nl': 'Netherlands', 'ch': 'Switzerland',
    'fi': 'Finland', 'dk': 'Denmark', 'be': 'Belgium', 'at': 'Austria',
    'pt': 'Portugal', 'gr': 'Greece', 'ie': 'Ireland', 'nz': 'New Zealand',
    'za': 'South Africa', 'sg': 'Singapore', 'th': 'Thailand', 'vn': 'Vietnam',
    'ph': 'Philippines', 'id': 'Indonesia', 'my': 'Malaysia', 'tr': 'Turkey',
    'ae': 'UAE', 'sa': 'Saudi Arabia', 'il': 'Israel', 'eg': 'Egypt',
    'ma': 'Morocco', 'ng': 'Nigeria', 'ke': 'Kenya', 'gh': 'Ghana',
    'co': 'Colombia', 've': 'Venezuela', 'pe': 'Peru', 'cl': 'Chile',
    'pk': 'Pakistan', 'bd': 'Bangladesh', 'lk': 'Sri Lanka', 'np': 'Nepal'
  };
  return countryNames[countryCode] || countryCode.toUpperCase();
}

function getCountryFlag(countryCode: string): string {
  const flags: { [key: string]: string } = {
    'us': '🇺🇸', 'gb': '🇬🇧', 'de': '🇩🇪', 'fr': '🇫🇷', 'jp': '🇯🇵',
    'es': '🇪🇸', 'it': '🇮🇹', 'br': '🇧🇷', 'mx': '🇲🇽', 'au': '🇦🇺',
    'ca': '🇨🇦', 'in': '🇮🇳', 'kr': '🇰🇷', 'se': '🇸🇪', 'no': '🇳🇴',
    'nl': '🇳🇱', 'ch': '🇨🇭', 'ar': '🇦🇷', 'ru': '🇷🇺', 'cn': '🇨🇳',
    'pk': '🇵🇰', 'bd': '🇧🇩', 'ph': '🇵🇭', 'th': '🇹🇭', 'vn': '🇻🇳',
    'id': '🇮🇩', 'my': '🇲🇾', 'sg': '🇸🇬', 'tr': '🇹🇷', 'ae': '🇦🇪',
    'sa': '🇸🇦', 'il': '🇮🇱', 'eg': '🇪🇬', 'ma': '🇲🇦', 'ng': '🇳🇬',
    'ke': '🇰🇪', 'gh': '🇬🇭', 'za': '🇿🇦', 'co': '🇨🇴', 've': '🇻🇪',
    'pe': '🇵🇪', 'cl': '🇨🇱', 'fi': '🇫🇮', 'dk': '🇩🇰', 'be': '🇧🇪',
    'at': '🇦🇹', 'pt': '🇵🇹', 'gr': '🇬🇷', 'ie': '🇮🇪', 'nz': '🇳🇿',
    'lk': '🇱🇰', 'np': '🇳🇵'
  };
  return flags[countryCode] || '🌍';
}

async function getCountryFromRequest(req?: any): Promise<{ code: string; name: string; flag: string }> {
  try {
    const clientIP = req?.headers['x-forwarded-for']?.split(',')[0] || 
                     req?.headers['x-real-ip'] || 
                     req?.connection?.remoteAddress || 
                     req?.socket?.remoteAddress ||
                     '8.8.8.8';

    const cleanIP = clientIP.replace(/^::ffff:/, '');
    
    console.log('Getting location for IP:', cleanIP);

    const response = await fetch(`https://ipinfo.io/${cleanIP}?token=${process.env.IPINFO_API_KEY}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('IPinfo response:', data);
      
      if (data.country) {
        const countryCode = data.country.toLowerCase();
        const countryName = getCountryName(countryCode);
        const flag = getCountryFlag(countryCode);
        
        return {
          code: countryCode,
          name: countryName,
          flag: flag
        };
      }
    }
  } catch (error) {
    console.error('Error getting location:', error);
  }

  return { code: 'us', name: 'United States', flag: '🇺🇸' };
}

function generateUserId(): string {
  return Math.random().toString(36).substr(2, 9);
}

function findMatch(userId: string, preferredCountry?: string): string | null {
  console.log(`Finding match for ${userId}, search queue: [${searchQueue}]`);
  
  const availableUsers = searchQueue.filter(id => {
    const user = connectedUsers.get(id);
    const isValid = user && user.isSearching && !user.partnerId;
    console.log(`User ${id}: valid=${isValid}, isSearching=${user?.isSearching}, partnerId=${user?.partnerId}`);
    return isValid;
  });
  
  console.log(`Available users for matching: [${availableUsers}]`);
  
  if (availableUsers.length === 0) {
    console.log('Selected match: null');
    return null;
  }
  
  let selectedMatch = availableUsers[0];
  console.log(`Selected match: ${selectedMatch}`);
  return selectedMatch;
}

function connectUsers(user1Id: string, user2Id: string) {
  const user1 = connectedUsers.get(user1Id);
  const user2 = connectedUsers.get(user2Id);

  if (!user1 || !user2) return;
  
  if (user1.partnerId || user2.partnerId) {
    console.log(`Users already have partners: ${user1Id}=${user1.partnerId}, ${user2Id}=${user2.partnerId}`);
    return;
  }

  console.log(`Connecting users: ${user1Id} (${user1.country}) with ${user2Id} (${user2.country})`);

  user1.partnerId = user2Id;
  user2.partnerId = user1Id;
  user1.isSearching = false;
  user2.isSearching = false;

  const index1 = searchQueue.indexOf(user1Id);
  const index2 = searchQueue.indexOf(user2Id);
  if (index1 > -1) searchQueue.splice(index1, 1);
  if (index2 > -1) searchQueue.splice(index2, 1);

  console.log(`Search queue after connection: ${searchQueue}`);

  try {
    user1.ws.send(JSON.stringify({
      type: 'user-connected',
      payload: {
        partnerId: user2Id,
        partnerCountry: user2.country,
        partnerFlag: user2.flag
      }
    }));

    user2.ws.send(JSON.stringify({
      type: 'user-connected',
      payload: {
        partnerId: user1Id,
        partnerCountry: user1.country,
        partnerFlag: user1.flag
      }
    }));

    console.log('Both users notified of connection');
  } catch (error) {
    console.error('Error notifying users of connection:', error);
  }
}

function disconnectUsers(user1Id: string, user2Id: string) {
  const user1 = connectedUsers.get(user1Id);
  const user2 = connectedUsers.get(user2Id);

  if (user1) {
    user1.partnerId = undefined;
    user1.isSearching = false;
    try {
      user1.ws.send(JSON.stringify({ type: 'user-disconnected' }));
    } catch (error) {
      console.error('Error notifying user1 of disconnection:', error);
    }
  }

  if (user2) {
    user2.partnerId = undefined;
    user2.isSearching = false;
    try {
      user2.ws.send(JSON.stringify({ type: 'user-disconnected' }));
    } catch (error) {
      console.error('Error notifying user2 of disconnection:', error);
    }
  }
}

function broadcastOnlineCount() {
  const message = JSON.stringify({
    type: 'online-count',
    payload: { count: connectedUsers.size }
  });

  connectedUsers.forEach(user => {
    if (user.ws.readyState === WebSocket.OPEN) {
      user.ws.send(message);
    }
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.get('/api/online-count', async (req, res) => {
    res.json({ count: connectedUsers.size });
  });

  app.get('/api/countries', async (req, res) => {
    res.json(countries);
  });

  const httpServer = createServer(app);

  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws' 
  });

  wss.on('connection', async (ws, req) => {
    console.log('New WebSocket connection from:', req.socket.remoteAddress);
    
    const userId = generateUserId();
    const countryInfo = await getCountryFromRequest(req);
    
    const user: ConnectedUser = {
      ws,
      id: userId,
      country: countryInfo.name,
      countryCode: countryInfo.code,
      flag: countryInfo.flag,
      isSearching: false
    };

    connectedUsers.set(userId, user);
    console.log(`User ${userId} connected. Total users: ${connectedUsers.size}`);
    broadcastOnlineCount();

    ws.on('message', (data) => {
      try {
        const message: WSMessage = JSON.parse(data.toString());
        
        switch (message.type) {
          case 'find-partner':
            user.isSearching = true;
            const match = findMatch(userId, message.payload?.preferredCountry);
            
            if (match) {
              console.log(`Matching ${userId} with ${match}`);
              connectUsers(userId, match);
            } else {
              if (!searchQueue.includes(userId)) {
                searchQueue.push(userId);
                console.log(`User ${userId} added to search queue. Queue size: ${searchQueue.length}`);
              }
            }
            break;

          case 'disconnect':
            if (user.partnerId) {
              disconnectUsers(userId, user.partnerId);
            }
            break;

          case 'voice-offer':
          case 'voice-answer':
          case 'ice-candidate':
            if (user.partnerId) {
              const partner = connectedUsers.get(user.partnerId);
              if (partner && partner.ws.readyState === WebSocket.OPEN) {
                partner.ws.send(JSON.stringify(message));
              }
            }
            break;

          case 'game_rps':
          case 'game_tictactoe':
            if (user.partnerId) {
              const partner = connectedUsers.get(user.partnerId);
              if (partner && partner.ws.readyState === WebSocket.OPEN) {
                partner.ws.send(JSON.stringify({
                  type: message.type,
                  payload: { ...message.payload, fromUser: userId }
                }));
              }
            }
            break;
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });

    ws.on('close', (code, reason) => {
      console.log(`User ${userId} disconnected. Code: ${code}, Reason: ${reason}`);
      
      if (user.partnerId) {
        disconnectUsers(userId, user.partnerId);
      }
      
      const queueIndex = searchQueue.indexOf(userId);
      if (queueIndex > -1) {
        searchQueue.splice(queueIndex, 1);
      }
      
      connectedUsers.delete(userId);
      console.log(`Total users after disconnect: ${connectedUsers.size}`);
      broadcastOnlineCount();
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  return httpServer;
}