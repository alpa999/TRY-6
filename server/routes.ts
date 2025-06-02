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
    // أوروبا
    'ad': 'Andorra', 'al': 'Albania', 'at': 'Austria', 'ba': 'Bosnia and Herzegovina',
    'be': 'Belgium', 'bg': 'Bulgaria', 'by': 'Belarus', 'ch': 'Switzerland',
    'cy': 'Cyprus', 'cz': 'Czech Republic', 'de': 'Germany', 'dk': 'Denmark',
    'ee': 'Estonia', 'es': 'Spain', 'fi': 'Finland', 'fr': 'France',
    'gb': 'United Kingdom', 'ge': 'Georgia', 'gr': 'Greece', 'hr': 'Croatia',
    'hu': 'Hungary', 'ie': 'Ireland', 'is': 'Iceland', 'it': 'Italy',
    'li': 'Liechtenstein', 'lt': 'Lithuania', 'lu': 'Luxembourg', 'lv': 'Latvia',
    'mc': 'Monaco', 'md': 'Moldova', 'me': 'Montenegro', 'mk': 'North Macedonia',
    'mt': 'Malta', 'nl': 'Netherlands', 'no': 'Norway', 'pl': 'Poland',
    'pt': 'Portugal', 'ro': 'Romania', 'rs': 'Serbia', 'ru': 'Russia',
    'se': 'Sweden', 'si': 'Slovenia', 'sk': 'Slovakia', 'sm': 'San Marino',
    'ua': 'Ukraine', 'va': 'Vatican City', 'xk': 'Kosovo',
    
    // آسيا
    'af': 'Afghanistan', 'am': 'Armenia', 'az': 'Azerbaijan', 'bd': 'Bangladesh',
    'bt': 'Bhutan', 'bn': 'Brunei', 'kh': 'Cambodia', 'cn': 'China',
    'in': 'India', 'id': 'Indonesia', 'ir': 'Iran', 'iq': 'Iraq',
    'il': 'Israel', 'jp': 'Japan', 'jo': 'Jordan', 'kz': 'Kazakhstan',
    'kw': 'Kuwait', 'kg': 'Kyrgyzstan', 'la': 'Laos', 'lb': 'Lebanon',
    'my': 'Malaysia', 'mv': 'Maldives', 'mn': 'Mongolia', 'mm': 'Myanmar',
    'np': 'Nepal', 'kp': 'North Korea', 'om': 'Oman', 'pk': 'Pakistan',
    'ps': 'Palestine', 'ph': 'Philippines', 'qa': 'Qatar', 'sa': 'Saudi Arabia',
    'sg': 'Singapore', 'kr': 'South Korea', 'lk': 'Sri Lanka', 'sy': 'Syria',
    'tw': 'Taiwan', 'tj': 'Tajikistan', 'th': 'Thailand', 'tl': 'East Timor',
    'tr': 'Turkey', 'tm': 'Turkmenistan', 'ae': 'UAE', 'uz': 'Uzbekistan',
    'vn': 'Vietnam', 'ye': 'Yemen',
    
    // أفريقيا
    'dz': 'Algeria', 'ao': 'Angola', 'bj': 'Benin', 'bw': 'Botswana',
    'bf': 'Burkina Faso', 'bi': 'Burundi', 'cv': 'Cape Verde', 'cm': 'Cameroon',
    'cf': 'Central African Republic', 'td': 'Chad', 'km': 'Comoros', 'cg': 'Congo',
    'cd': 'DR Congo', 'dj': 'Djibouti', 'eg': 'Egypt', 'gq': 'Equatorial Guinea',
    'er': 'Eritrea', 'sz': 'Eswatini', 'et': 'Ethiopia', 'ga': 'Gabon',
    'gm': 'Gambia', 'gh': 'Ghana', 'gn': 'Guinea', 'gw': 'Guinea-Bissau',
    'ci': 'Ivory Coast', 'ke': 'Kenya', 'ls': 'Lesotho', 'lr': 'Liberia',
    'ly': 'Libya', 'mg': 'Madagascar', 'mw': 'Malawi', 'ml': 'Mali',
    'mr': 'Mauritania', 'mu': 'Mauritius', 'ma': 'Morocco', 'mz': 'Mozambique',
    'na': 'Namibia', 'ne': 'Niger', 'ng': 'Nigeria', 'rw': 'Rwanda',
    'st': 'São Tomé and Príncipe', 'sn': 'Senegal', 'sc': 'Seychelles',
    'sl': 'Sierra Leone', 'so': 'Somalia', 'za': 'South Africa', 'ss': 'South Sudan',
    'sd': 'Sudan', 'tz': 'Tanzania', 'tg': 'Togo', 'tn': 'Tunisia',
    'ug': 'Uganda', 'zm': 'Zambia', 'zw': 'Zimbabwe',
    
    // أمريكا الشمالية
    'us': 'United States', 'ca': 'Canada', 'mx': 'Mexico', 'gt': 'Guatemala',
    'bz': 'Belize', 'sv': 'El Salvador', 'hn': 'Honduras', 'ni': 'Nicaragua',
    'cr': 'Costa Rica', 'pa': 'Panama',
    
    // أمريكا الجنوبية
    'ar': 'Argentina', 'bo': 'Bolivia', 'br': 'Brazil', 'cl': 'Chile',
    'co': 'Colombia', 'ec': 'Ecuador', 'gy': 'Guyana', 'py': 'Paraguay',
    'pe': 'Peru', 'sr': 'Suriname', 'uy': 'Uruguay', 've': 'Venezuela',
    
    // الكاريبي
    'ag': 'Antigua and Barbuda', 'bs': 'Bahamas', 'bb': 'Barbados', 'cu': 'Cuba',
    'dm': 'Dominica', 'do': 'Dominican Republic', 'gd': 'Grenada', 'ht': 'Haiti',
    'jm': 'Jamaica', 'kn': 'Saint Kitts and Nevis', 'lc': 'Saint Lucia',
    'vc': 'Saint Vincent and the Grenadines', 'tt': 'Trinidad and Tobago',
    
    // أوقيانوسيا
    'au': 'Australia', 'fj': 'Fiji', 'ki': 'Kiribati', 'mh': 'Marshall Islands',
    'fm': 'Micronesia', 'nr': 'Nauru', 'nz': 'New Zealand', 'pw': 'Palau',
    'pg': 'Papua New Guinea', 'ws': 'Samoa', 'sb': 'Solomon Islands',
    'to': 'Tonga', 'tv': 'Tuvalu', 'vu': 'Vanuatu'
  };
  return countryNames[countryCode] || countryCode.toUpperCase();
}

function getCountryFlag(countryCode: string): string {
  const flags: { [key: string]: string } = {
    // أوروبا
    'ad': '🇦🇩', 'al': '🇦🇱', 'at': '🇦🇹', 'ba': '🇧🇦', 'be': '🇧🇪', 'bg': '🇧🇬',
    'by': '🇧🇾', 'ch': '🇨🇭', 'cy': '🇨🇾', 'cz': '🇨🇿', 'de': '🇩🇪', 'dk': '🇩🇰',
    'ee': '🇪🇪', 'es': '🇪🇸', 'fi': '🇫🇮', 'fr': '🇫🇷', 'gb': '🇬🇧', 'ge': '🇬🇪',
    'gr': '🇬🇷', 'hr': '🇭🇷', 'hu': '🇭🇺', 'ie': '🇮🇪', 'is': '🇮🇸', 'it': '🇮🇹',
    'li': '🇱🇮', 'lt': '🇱🇹', 'lu': '🇱🇺', 'lv': '🇱🇻', 'mc': '🇲🇨', 'md': '🇲🇩',
    'me': '🇲🇪', 'mk': '🇲🇰', 'mt': '🇲🇹', 'nl': '🇳🇱', 'no': '🇳🇴', 'pl': '🇵🇱',
    'pt': '🇵🇹', 'ro': '🇷🇴', 'rs': '🇷🇸', 'ru': '🇷🇺', 'se': '🇸🇪', 'si': '🇸🇮',
    'sk': '🇸🇰', 'sm': '🇸🇲', 'ua': '🇺🇦', 'va': '🇻🇦', 'xk': '🇽🇰',
    
    // آسيا
    'af': '🇦🇫', 'am': '🇦🇲', 'az': '🇦🇿', 'bd': '🇧🇩', 'bt': '🇧🇹', 'bn': '🇧🇳',
    'kh': '🇰🇭', 'cn': '🇨🇳', 'in': '🇮🇳', 'id': '🇮🇩', 'ir': '🇮🇷', 'iq': '🇮🇶',
    'il': '🇮🇱', 'jp': '🇯🇵', 'jo': '🇯🇴', 'kz': '🇰🇿', 'kw': '🇰🇼', 'kg': '🇰🇬',
    'la': '🇱🇦', 'lb': '🇱🇧', 'my': '🇲🇾', 'mv': '🇲🇻', 'mn': '🇲🇳', 'mm': '🇲🇲',
    'np': '🇳🇵', 'kp': '🇰🇵', 'om': '🇴🇲', 'pk': '🇵🇰', 'ps': '🇵🇸', 'ph': '🇵🇭',
    'qa': '🇶🇦', 'sa': '🇸🇦', 'sg': '🇸🇬', 'kr': '🇰🇷', 'lk': '🇱🇰', 'sy': '🇸🇾',
    'tw': '🇹🇼', 'tj': '🇹🇯', 'th': '🇹🇭', 'tl': '🇹🇱', 'tr': '🇹🇷', 'tm': '🇹🇲',
    'ae': '🇦🇪', 'uz': '🇺🇿', 'vn': '🇻🇳', 'ye': '🇾🇪',
    
    // أفريقيا
    'dz': '🇩🇿', 'ao': '🇦🇴', 'bj': '🇧🇯', 'bw': '🇧🇼', 'bf': '🇧🇫', 'bi': '🇧🇮',
    'cv': '🇨🇻', 'cm': '🇨🇲', 'cf': '🇨🇫', 'td': '🇹🇩', 'km': '🇰🇲', 'cg': '🇨🇬',
    'cd': '🇨🇩', 'dj': '🇩🇯', 'eg': '🇪🇬', 'gq': '🇬🇶', 'er': '🇪🇷', 'sz': '🇸🇿',
    'et': '🇪🇹', 'ga': '🇬🇦', 'gm': '🇬🇲', 'gh': '🇬🇭', 'gn': '🇬🇳', 'gw': '🇬🇼',
    'ci': '🇨🇮', 'ke': '🇰🇪', 'ls': '🇱🇸', 'lr': '🇱🇷', 'ly': '🇱🇾', 'mg': '🇲🇬',
    'mw': '🇲🇼', 'ml': '🇲🇱', 'mr': '🇲🇷', 'mu': '🇲🇺', 'ma': '🇲🇦', 'mz': '🇲🇿',
    'na': '🇳🇦', 'ne': '🇳🇪', 'ng': '🇳🇬', 'rw': '🇷🇼', 'st': '🇸🇹', 'sn': '🇸🇳',
    'sc': '🇸🇨', 'sl': '🇸🇱', 'so': '🇸🇴', 'za': '🇿🇦', 'ss': '🇸🇸', 'sd': '🇸🇩',
    'tz': '🇹🇿', 'tg': '🇹🇬', 'tn': '🇹🇳', 'ug': '🇺🇬', 'zm': '🇿🇲', 'zw': '🇿🇼',
    
    // أمريكا الشمالية
    'us': '🇺🇸', 'ca': '🇨🇦', 'mx': '🇲🇽', 'gt': '🇬🇹', 'bz': '🇧🇿', 'sv': '🇸🇻',
    'hn': '🇭🇳', 'ni': '🇳🇮', 'cr': '🇨🇷', 'pa': '🇵🇦',
    
    // أمريكا الجنوبية
    'ar': '🇦🇷', 'bo': '🇧🇴', 'br': '🇧🇷', 'cl': '🇨🇱', 'co': '🇨🇴', 'ec': '🇪🇨',
    'gy': '🇬🇾', 'py': '🇵🇾', 'pe': '🇵🇪', 'sr': '🇸🇷', 'uy': '🇺🇾', 've': '🇻🇪',
    
    // الكاريبي
    'ag': '🇦🇬', 'bs': '🇧🇸', 'bb': '🇧🇧', 'cu': '🇨🇺', 'dm': '🇩🇲', 'do': '🇩🇴',
    'gd': '🇬🇩', 'ht': '🇭🇹', 'jm': '🇯🇲', 'kn': '🇰🇳', 'lc': '🇱🇨', 'vc': '🇻🇨',
    'tt': '🇹🇹',
    
    // أوقيانوسيا
    'au': '🇦🇺', 'fj': '🇫🇯', 'ki': '🇰🇮', 'mh': '🇲🇭', 'fm': '🇫🇲', 'nr': '🇳🇷',
    'nz': '🇳🇿', 'pw': '🇵🇼', 'pg': '🇵🇬', 'ws': '🇼🇸', 'sb': '🇸🇧', 'to': '🇹🇴',
    'tv': '🇹🇻', 'vu': '🇻🇺'
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

    // استخدام خدمة مجانية لا تحتاج مفتاح API
    const response = await fetch(`http://ip-api.com/json/${cleanIP}?fields=status,country,countryCode`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('IP-API response:', JSON.stringify(data, null, 2));
      
      if (data.status === 'success' && data.countryCode) {
        const countryCode = data.countryCode.toLowerCase();
        const countryName = getCountryName(countryCode);
        const flag = getCountryFlag(countryCode);
        
        console.log(`Detected location: ${countryCode} -> ${countryName} ${flag}`);
        
        return {
          code: countryCode,
          name: countryName,
          flag: flag
        };
      } else {
        console.log('No country code in IP-API response');
      }
    } else {
      console.log('IP-API request failed:', response.status, response.statusText);
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
    // تأكد من أن المستخدم ليس نفس الشخص الذي يبحث
    const isValid = user && user.isSearching && !user.partnerId && id !== userId;
    console.log(`User ${id}: valid=${isValid}, isSearching=${user?.isSearching}, partnerId=${user?.partnerId}, isDifferentUser=${id !== userId}`);
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
    path: '/ws',
    perMessageDeflate: false,
    verifyClient: (info) => {
      console.log('WebSocket connection attempt from:', info.origin);
      return true;
    }
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
            const foundMatch = findMatch(userId, message.payload?.preferredCountry);
            
            if (foundMatch) {
              console.log(`Matching ${userId} with ${foundMatch}`);
              connectUsers(userId, foundMatch);
            } else {
              if (!searchQueue.includes(userId)) {
                searchQueue.push(userId);
                console.log(`User ${userId} added to search queue. Queue size: ${searchQueue.length}`);
              }
            }
            break;

          case 'next-partner':
            // Fast skip to next partner
            if (user.partnerId) {
              disconnectUsers(userId, user.partnerId);
            }
            
            // Immediately search for new partner
            user.isSearching = true;
            const nextMatch = findMatch(userId, message.payload?.preferredCountry);
            
            if (nextMatch) {
              connectUsers(userId, nextMatch);
            } else {
              if (!searchQueue.includes(userId)) {
                searchQueue.push(userId);
              }
              ws.send(JSON.stringify({ type: 'searching' }));
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
            // Add delay to ensure partner connection is established
            setTimeout(() => {
              const currentUser = connectedUsers.get(userId);
              if (currentUser && currentUser.partnerId) {
                const partner = connectedUsers.get(currentUser.partnerId);
                if (partner && partner.ws.readyState === WebSocket.OPEN) {
                  console.log(`Relaying ${message.type} from ${userId} to partner ${currentUser.partnerId}`);
                  partner.ws.send(JSON.stringify(message));
                  console.log(`Successfully sent ${message.type} to partner`);
                } else {
                  console.log(`Partner not available for ${message.type}`);
                }
              } else {
                console.log(`No partner found for ${message.type} - userId: ${userId}, partnerId: ${currentUser?.partnerId}`);
              }
            }, 100);
            break;

          case 'chat-message':
            if (user.partnerId) {
              const partner = connectedUsers.get(user.partnerId);
              if (partner && partner.ws.readyState === WebSocket.OPEN) {
                partner.ws.send(JSON.stringify({
                  type: 'chat-message',
                  payload: {
                    message: message.payload.message,
                    fromUserId: userId,
                    timestamp: Date.now()
                  }
                }));
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