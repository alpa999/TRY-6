
import ConnectionCard from "@/components/connection-card";
import ControlButtons from "@/components/control-buttons";
import ChatModal from "@/components/chat-modal";
import GamesModal from "@/components/games-modal";
import DonationModal from "@/components/donation-modal";
import { useSimpleWebSocket } from "@/hooks/use-simple-websocket";
import { useVoiceChat } from "@/hooks/use-voice-chat";
import { useMicrophone } from "@/hooks/use-microphone";
import { useState, useEffect, useRef } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Country {
  code: string;
  name: string;
  flag: string;
}

const countries: Country[] = [
  { code: 'any', name: 'Any Country', flag: '🌍' },
  { code: 'moon', name: 'Moon Base', flag: '🌙' },
  { code: 'ad', name: 'Andorra', flag: '🇦🇩' },
  { code: 'ae', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'af', name: 'Afghanistan', flag: '🇦🇫' },
  { code: 'ag', name: 'Antigua and Barbuda', flag: '🇦🇬' },
  { code: 'ai', name: 'Anguilla', flag: '🇦🇮' },
  { code: 'al', name: 'Albania', flag: '🇦🇱' },
  { code: 'am', name: 'Armenia', flag: '🇦🇲' },
  { code: 'ao', name: 'Angola', flag: '🇦🇴' },
  { code: 'aq', name: 'Antarctica', flag: '🇦🇶' },
  { code: 'ar', name: 'Argentina', flag: '🇦🇷' },
  { code: 'as', name: 'American Samoa', flag: '🇦🇸' },
  { code: 'at', name: 'Austria', flag: '🇦🇹' },
  { code: 'au', name: 'Australia', flag: '🇦🇺' },
  { code: 'aw', name: 'Aruba', flag: '🇦🇼' },
  { code: 'ax', name: 'Åland Islands', flag: '🇦🇽' },
  { code: 'az', name: 'Azerbaijan', flag: '🇦🇿' },
  { code: 'ba', name: 'Bosnia and Herzegovina', flag: '🇧🇦' },
  { code: 'bb', name: 'Barbados', flag: '🇧🇧' },
  { code: 'bd', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'be', name: 'Belgium', flag: '🇧🇪' },
  { code: 'bf', name: 'Burkina Faso', flag: '🇧🇫' },
  { code: 'bg', name: 'Bulgaria', flag: '🇧🇬' },
  { code: 'bh', name: 'Bahrain', flag: '🇧🇭' },
  { code: 'bi', name: 'Burundi', flag: '🇧🇮' },
  { code: 'bj', name: 'Benin', flag: '🇧🇯' },
  { code: 'bl', name: 'Saint Barthélemy', flag: '🇧🇱' },
  { code: 'bm', name: 'Bermuda', flag: '🇧🇲' },
  { code: 'bn', name: 'Brunei', flag: '🇧🇳' },
  { code: 'bo', name: 'Bolivia', flag: '🇧🇴' },
  { code: 'bq', name: 'Caribbean Netherlands', flag: '🇧🇶' },
  { code: 'br', name: 'Brazil', flag: '🇧🇷' },
  { code: 'bs', name: 'Bahamas', flag: '🇧🇸' },
  { code: 'bt', name: 'Bhutan', flag: '🇧🇹' },
  { code: 'bv', name: 'Bouvet Island', flag: '🇧🇻' },
  { code: 'bw', name: 'Botswana', flag: '🇧🇼' },
  { code: 'by', name: 'Belarus', flag: '🇧🇾' },
  { code: 'bz', name: 'Belize', flag: '🇧🇿' },
  { code: 'ca', name: 'Canada', flag: '🇨🇦' },
  { code: 'cc', name: 'Cocos Islands', flag: '🇨🇨' },
  { code: 'cd', name: 'Democratic Republic of the Congo', flag: '🇨🇩' },
  { code: 'cf', name: 'Central African Republic', flag: '🇨🇫' },
  { code: 'cg', name: 'Republic of the Congo', flag: '🇨🇬' },
  { code: 'ch', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'ci', name: 'Côte d\'Ivoire', flag: '🇨🇮' },
  { code: 'ck', name: 'Cook Islands', flag: '🇨🇰' },
  { code: 'cl', name: 'Chile', flag: '🇨🇱' },
  { code: 'cm', name: 'Cameroon', flag: '🇨🇲' },
  { code: 'cn', name: 'China', flag: '🇨🇳' },
  { code: 'co', name: 'Colombia', flag: '🇨🇴' },
  { code: 'cr', name: 'Costa Rica', flag: '🇨🇷' },
  { code: 'cu', name: 'Cuba', flag: '🇨🇺' },
  { code: 'cv', name: 'Cape Verde', flag: '🇨🇻' },
  { code: 'cw', name: 'Curaçao', flag: '🇨🇼' },
  { code: 'cx', name: 'Christmas Island', flag: '🇨🇽' },
  { code: 'cy', name: 'Cyprus', flag: '🇨🇾' },
  { code: 'cz', name: 'Czech Republic', flag: '🇨🇿' },
  { code: 'de', name: 'Germany', flag: '🇩🇪' },
  { code: 'dj', name: 'Djibouti', flag: '🇩🇯' },
  { code: 'dk', name: 'Denmark', flag: '🇩🇰' },
  { code: 'dm', name: 'Dominica', flag: '🇩🇲' },
  { code: 'do', name: 'Dominican Republic', flag: '🇩🇴' },
  { code: 'dz', name: 'Algeria', flag: '🇩🇿' },
  { code: 'ec', name: 'Ecuador', flag: '🇪🇨' },
  { code: 'ee', name: 'Estonia', flag: '🇪🇪' },
  { code: 'eg', name: 'Egypt', flag: '🇪🇬' },
  { code: 'eh', name: 'Western Sahara', flag: '🇪🇭' },
  { code: 'er', name: 'Eritrea', flag: '🇪🇷' },
  { code: 'es', name: 'Spain', flag: '🇪🇸' },
  { code: 'et', name: 'Ethiopia', flag: '🇪🇹' },
  { code: 'fi', name: 'Finland', flag: '🇫🇮' },
  { code: 'fj', name: 'Fiji', flag: '🇫🇯' },
  { code: 'fk', name: 'Falkland Islands', flag: '🇫🇰' },
  { code: 'fm', name: 'Micronesia', flag: '🇫🇲' },
  { code: 'fo', name: 'Faroe Islands', flag: '🇫🇴' },
  { code: 'fr', name: 'France', flag: '🇫🇷' },
  { code: 'ga', name: 'Gabon', flag: '🇬🇦' },
  { code: 'gb', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'gd', name: 'Grenada', flag: '🇬🇩' },
  { code: 'ge', name: 'Georgia', flag: '🇬🇪' },
  { code: 'gf', name: 'French Guiana', flag: '🇬🇫' },
  { code: 'gg', name: 'Guernsey', flag: '🇬🇬' },
  { code: 'gh', name: 'Ghana', flag: '🇬🇭' },
  { code: 'gi', name: 'Gibraltar', flag: '🇬🇮' },
  { code: 'gl', name: 'Greenland', flag: '🇬🇱' },
  { code: 'gm', name: 'Gambia', flag: '🇬🇲' },
  { code: 'gn', name: 'Guinea', flag: '🇬🇳' },
  { code: 'gp', name: 'Guadeloupe', flag: '🇬🇵' },
  { code: 'gq', name: 'Equatorial Guinea', flag: '🇬🇶' },
  { code: 'gr', name: 'Greece', flag: '🇬🇷' },
  { code: 'gs', name: 'South Georgia', flag: '🇬🇸' },
  { code: 'gt', name: 'Guatemala', flag: '🇬🇹' },
  { code: 'gu', name: 'Guam', flag: '🇬🇺' },
  { code: 'gw', name: 'Guinea-Bissau', flag: '🇬🇼' },
  { code: 'gy', name: 'Guyana', flag: '🇬🇾' },
  { code: 'hk', name: 'Hong Kong', flag: '🇭🇰' },
  { code: 'hm', name: 'Heard Island', flag: '🇭🇲' },
  { code: 'hn', name: 'Honduras', flag: '🇭🇳' },
  { code: 'hr', name: 'Croatia', flag: '🇭🇷' },
  { code: 'ht', name: 'Haiti', flag: '🇭🇹' },
  { code: 'hu', name: 'Hungary', flag: '🇭🇺' },
  { code: 'id', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'ie', name: 'Ireland', flag: '🇮🇪' },
  { code: 'il', name: 'Israel', flag: '🇮🇱' },
  { code: 'im', name: 'Isle of Man', flag: '🇮🇲' },
  { code: 'in', name: 'India', flag: '🇮🇳' },
  { code: 'io', name: 'British Indian Ocean Territory', flag: '🇮🇴' },
  { code: 'iq', name: 'Iraq', flag: '🇮🇶' },
  { code: 'ir', name: 'Iran', flag: '🇮🇷' },
  { code: 'is', name: 'Iceland', flag: '🇮🇸' },
  { code: 'it', name: 'Italy', flag: '🇮🇹' },
  { code: 'je', name: 'Jersey', flag: '🇯🇪' },
  { code: 'jm', name: 'Jamaica', flag: '🇯🇲' },
  { code: 'jo', name: 'Jordan', flag: '🇯🇴' },
  { code: 'jp', name: 'Japan', flag: '🇯🇵' },
  { code: 'ke', name: 'Kenya', flag: '🇰🇪' },
  { code: 'kg', name: 'Kyrgyzstan', flag: '🇰🇬' },
  { code: 'kh', name: 'Cambodia', flag: '🇰🇭' },
  { code: 'ki', name: 'Kiribati', flag: '🇰🇮' },
  { code: 'km', name: 'Comoros', flag: '🇰🇲' },
  { code: 'kn', name: 'Saint Kitts and Nevis', flag: '🇰🇳' },
  { code: 'kp', name: 'North Korea', flag: '🇰🇵' },
  { code: 'kr', name: 'South Korea', flag: '🇰🇷' },
  { code: 'kw', name: 'Kuwait', flag: '🇰🇼' },
  { code: 'ky', name: 'Cayman Islands', flag: '🇰🇾' },
  { code: 'kz', name: 'Kazakhstan', flag: '🇰🇿' },
  { code: 'la', name: 'Laos', flag: '🇱🇦' },
  { code: 'lb', name: 'Lebanon', flag: '🇱🇧' },
  { code: 'lc', name: 'Saint Lucia', flag: '🇱🇨' },
  { code: 'li', name: 'Liechtenstein', flag: '🇱🇮' },
  { code: 'lk', name: 'Sri Lanka', flag: '🇱🇰' },
  { code: 'lr', name: 'Liberia', flag: '🇱🇷' },
  { code: 'ls', name: 'Lesotho', flag: '🇱🇸' },
  { code: 'lt', name: 'Lithuania', flag: '🇱🇹' },
  { code: 'lu', name: 'Luxembourg', flag: '🇱🇺' },
  { code: 'lv', name: 'Latvia', flag: '🇱🇻' },
  { code: 'ly', name: 'Libya', flag: '🇱🇾' },
  { code: 'ma', name: 'Morocco', flag: '🇲🇦' },
  { code: 'mc', name: 'Monaco', flag: '🇲🇨' },
  { code: 'md', name: 'Moldova', flag: '🇲🇩' },
  { code: 'me', name: 'Montenegro', flag: '🇲🇪' },
  { code: 'mf', name: 'Saint Martin', flag: '🇲🇫' },
  { code: 'mg', name: 'Madagascar', flag: '🇲🇬' },
  { code: 'mh', name: 'Marshall Islands', flag: '🇲🇭' },
  { code: 'mk', name: 'North Macedonia', flag: '🇲🇰' },
  { code: 'ml', name: 'Mali', flag: '🇲🇱' },
  { code: 'mm', name: 'Myanmar', flag: '🇲🇲' },
  { code: 'mn', name: 'Mongolia', flag: '🇲🇳' },
  { code: 'mo', name: 'Macao', flag: '🇲🇴' },
  { code: 'mp', name: 'Northern Mariana Islands', flag: '🇲🇵' },
  { code: 'mq', name: 'Martinique', flag: '🇲🇶' },
  { code: 'mr', name: 'Mauritania', flag: '🇲🇷' },
  { code: 'ms', name: 'Montserrat', flag: '🇲🇸' },
  { code: 'mt', name: 'Malta', flag: '🇲🇹' },
  { code: 'mu', name: 'Mauritius', flag: '🇲🇺' },
  { code: 'mv', name: 'Maldives', flag: '🇲🇻' },
  { code: 'mw', name: 'Malawi', flag: '🇲🇼' },
  { code: 'mx', name: 'Mexico', flag: '🇲🇽' },
  { code: 'my', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'mz', name: 'Mozambique', flag: '🇲🇿' },
  { code: 'na', name: 'Namibia', flag: '🇳🇦' },
  { code: 'nc', name: 'New Caledonia', flag: '🇳🇨' },
  { code: 'ne', name: 'Niger', flag: '🇳🇪' },
  { code: 'nf', name: 'Norfolk Island', flag: '🇳🇫' },
  { code: 'ng', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'ni', name: 'Nicaragua', flag: '🇳🇮' },
  { code: 'nl', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'no', name: 'Norway', flag: '🇳🇴' },
  { code: 'np', name: 'Nepal', flag: '🇳🇵' },
  { code: 'nr', name: 'Nauru', flag: '🇳🇷' },
  { code: 'nu', name: 'Niue', flag: '🇳🇺' },
  { code: 'nz', name: 'New Zealand', flag: '🇳🇿' },
  { code: 'om', name: 'Oman', flag: '🇴🇲' },
  { code: 'pa', name: 'Panama', flag: '🇵🇦' },
  { code: 'pe', name: 'Peru', flag: '🇵🇪' },
  { code: 'pf', name: 'French Polynesia', flag: '🇵🇫' },
  { code: 'pg', name: 'Papua New Guinea', flag: '🇵🇬' },
  { code: 'ph', name: 'Philippines', flag: '🇵🇭' },
  { code: 'pk', name: 'Pakistan', flag: '🇵🇰' },
  { code: 'pl', name: 'Poland', flag: '🇵🇱' },
  { code: 'pm', name: 'Saint Pierre and Miquelon', flag: '🇵🇲' },
  { code: 'pn', name: 'Pitcairn', flag: '🇵🇳' },
  { code: 'pr', name: 'Puerto Rico', flag: '🇵🇷' },
  { code: 'ps', name: 'Palestinian Territory', flag: '🇵🇸' },
  { code: 'pt', name: 'Portugal', flag: '🇵🇹' },
  { code: 'pw', name: 'Palau', flag: '🇵🇼' },
  { code: 'py', name: 'Paraguay', flag: '🇵🇾' },
  { code: 'qa', name: 'Qatar', flag: '🇶🇦' },
  { code: 're', name: 'Réunion', flag: '🇷🇪' },
  { code: 'ro', name: 'Romania', flag: '🇷🇴' },
  { code: 'rs', name: 'Serbia', flag: '🇷🇸' },
  { code: 'ru', name: 'Russia', flag: '🇷🇺' },
  { code: 'rw', name: 'Rwanda', flag: '🇷🇼' },
  { code: 'sa', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'sb', name: 'Solomon Islands', flag: '🇸🇧' },
  { code: 'sc', name: 'Seychelles', flag: '🇸🇨' },
  { code: 'sd', name: 'Sudan', flag: '🇸🇩' },
  { code: 'se', name: 'Sweden', flag: '🇸🇪' },
  { code: 'sg', name: 'Singapore', flag: '🇸🇬' },
  { code: 'sh', name: 'Saint Helena', flag: '🇸🇭' },
  { code: 'si', name: 'Slovenia', flag: '🇸🇮' },
  { code: 'sj', name: 'Svalbard and Jan Mayen', flag: '🇸🇯' },
  { code: 'sk', name: 'Slovakia', flag: '🇸🇰' },
  { code: 'sl', name: 'Sierra Leone', flag: '🇸🇱' },
  { code: 'sm', name: 'San Marino', flag: '🇸🇲' },
  { code: 'sn', name: 'Senegal', flag: '🇸🇳' },
  { code: 'so', name: 'Somalia', flag: '🇸🇴' },
  { code: 'sr', name: 'Suriname', flag: '🇸🇷' },
  { code: 'ss', name: 'South Sudan', flag: '🇸🇸' },
  { code: 'st', name: 'Sao Tome and Principe', flag: '🇸🇹' },
  { code: 'sv', name: 'El Salvador', flag: '🇸🇻' },
  { code: 'sx', name: 'Sint Maarten', flag: '🇸🇽' },
  { code: 'sy', name: 'Syria', flag: '🇸🇾' },
  { code: 'sz', name: 'Eswatini', flag: '🇸🇿' },
  { code: 'tc', name: 'Turks and Caicos Islands', flag: '🇹🇨' },
  { code: 'td', name: 'Chad', flag: '🇹🇩' },
  { code: 'tf', name: 'French Southern Territories', flag: '🇹🇫' },
  { code: 'tg', name: 'Togo', flag: '🇹🇬' },
  { code: 'th', name: 'Thailand', flag: '🇹🇭' },
  { code: 'tj', name: 'Tajikistan', flag: '🇹🇯' },
  { code: 'tk', name: 'Tokelau', flag: '🇹🇰' },
  { code: 'tl', name: 'Timor-Leste', flag: '🇹🇱' },
  { code: 'tm', name: 'Turkmenistan', flag: '🇹🇲' },
  { code: 'tn', name: 'Tunisia', flag: '🇹🇳' },
  { code: 'to', name: 'Tonga', flag: '🇹🇴' },
  { code: 'tr', name: 'Turkey', flag: '🇹🇷' },
  { code: 'tt', name: 'Trinidad and Tobago', flag: '🇹🇹' },
  { code: 'tv', name: 'Tuvalu', flag: '🇹🇻' },
  { code: 'tw', name: 'Taiwan', flag: '🇹🇼' },
  { code: 'tz', name: 'Tanzania', flag: '🇹🇿' },
  { code: 'ua', name: 'Ukraine', flag: '🇺🇦' },
  { code: 'ug', name: 'Uganda', flag: '🇺🇬' },
  { code: 'um', name: 'United States Minor Outlying Islands', flag: '🇺🇲' },
  { code: 'us', name: 'United States', flag: '🇺🇸' },
  { code: 'uy', name: 'Uruguay', flag: '🇺🇾' },
  { code: 'uz', name: 'Uzbekistan', flag: '🇺🇿' },
  { code: 'va', name: 'Vatican City', flag: '🇻🇦' },
  { code: 'vc', name: 'Saint Vincent and the Grenadines', flag: '🇻🇨' },
  { code: 've', name: 'Venezuela', flag: '🇻🇪' },
  { code: 'vg', name: 'British Virgin Islands', flag: '🇻🇬' },
  { code: 'vi', name: 'U.S. Virgin Islands', flag: '🇻🇮' },
  { code: 'vn', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'vu', name: 'Vanuatu', flag: '🇻🇺' },
  { code: 'wf', name: 'Wallis and Futuna', flag: '🇼🇫' },
  { code: 'ws', name: 'Samoa', flag: '🇼🇸' },
  { code: 'ye', name: 'Yemen', flag: '🇾🇪' },
  { code: 'yt', name: 'Mayotte', flag: '🇾🇹' },
  { code: 'za', name: 'South Africa', flag: '🇿🇦' },
  { code: 'zm', name: 'Zambia', flag: '🇿🇲' },
  { code: 'zw', name: 'Zimbabwe', flag: '🇿🇼' },
];

export default function Home() {
  const [selectedCountry, setSelectedCountry] = useState("any");
  const [onlineCount, setOnlineCount] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isGamesOpen, setIsGamesOpen] = useState(false);
  const [isDonationOpen, setIsDonationOpen] = useState(false);
  const [dailyConnections, setDailyConnections] = useState(0);
  const [autoNextTimer, setAutoNextTimer] = useState<number | null>(null);
  const [selectedVibe, setSelectedVibe] = useState("any");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [interests, setInterests] = useState("");
  const [preferredCountries, setPreferredCountries] = useState<string[]>([]);
  const [blockedCountries, setBlockedCountries] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    message: string;
    isOwn: boolean;
    timestamp: number;
  }>>([]);

  // Voice state - declare first
  const [isMuted, setIsMuted] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  // Simple WebRTC setup with immediate microphone access
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  // Request microphone permission on user interaction
  const requestMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true
      });
      console.log("🎤 تم تفعيل المايك");
      setLocalStream(stream);
      setIsCallActive(true);
      
      // Enable audio context for better browser compatibility
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
          console.log("🎵 Audio context initialized");
        }
      } catch (e) {
        console.log("Audio context not supported");
      }
      
      return true;
    } catch (err) {
      console.error("❌ فشل في تفعيل المايك:", err);
      alert("يرجى السماح باستخدام الميكروفون لاستخدام المكالمات الصوتية.");
      return false;
    }
  };
  const [isCallHistoryOpen, setIsCallHistoryOpen] = useState(false);
  const [callHistory, setCallHistory] = useState<Array<{
    id: string;
    country: string;
    flag: string;
    timestamp: number;
  }>>([]);
  const [autoReconnect, setAutoReconnect] = useState(false);

  // Cosmic quotes for inspiration
  const cosmicQuotes = [
    "You're not alone in the universe.",
    "Every voice carries a story from across the stars.",
    "Connection transcends distance in the cosmic web.",
    "Discover new worlds through conversation.",
    "In space, every voice matters."
  ];
  const [currentQuote] = useState(cosmicQuotes[Math.floor(Math.random() * cosmicQuotes.length)]);

  const {
    isConnected: wsConnected,
    connectionStatus,
    partnerInfo,
    sendMessage,
    connect: connectWS
  } = useSimpleWebSocket({
    onOnlineCount: setOnlineCount,
    onChatMessage: (message, fromUserId, timestamp) => {
      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        message,
        isOwn: false,
        timestamp
      }]);
    }
  });

  // Handle voice signaling messages from WebSocket
  useEffect(() => {
    const handleVoiceSignaling = async (event: any) => {
      const data = event.detail;
      
      try {
        if (data.payload?.offer && localStream && !peerConnectionRef.current) {
          console.log("📩 استقبال عرض صوتي جديد");
          
          // Use existing connection if available, or create new one
          const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
          });
          
          // Add local stream
          localStream.getTracks().forEach(track => {
            pc.addTrack(track, localStream);
          });
          
          // Handle remote audio with single handler
          pc.ontrack = (event) => {
            console.log("📥 استقبال تدفق صوتي");
            
            if (remoteAudioRef.current && event.streams[0]) {
              remoteAudioRef.current.srcObject = event.streams[0];
              remoteAudioRef.current.volume = 1.0;
              
              remoteAudioRef.current.play().then(() => {
                console.log("🔊 تم تشغيل الصوت بنجاح");
              }).catch((error) => {
                console.log("يتطلب تفاعل:", error.message);
              });
            }
          };
          
          // Handle ICE candidates
          pc.onicecandidate = (event) => {
            if (event.candidate) {
              sendMessage('ice-candidate', { iceCandidate: event.candidate });
            }
          };
          
          peerConnectionRef.current = pc;
          
          await pc.setRemoteDescription(new RTCSessionDescription(data.payload.offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          sendMessage("voice-answer", { answer });
          console.log('📤 تم إرسال الرد');
          
        } else if (data.payload?.answer && peerConnectionRef.current) {
          console.log("📩 استقبال رد");
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.payload.answer));
          
        } else if (data.payload?.iceCandidate && peerConnectionRef.current) {
          console.log("📩 ICE جديد");
          try {
            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.payload.iceCandidate));
          } catch (e) {
            console.error("❌ خطأ ICE:", e);
          }
        }
      } catch (error) {
        console.error('خطأ في الإشارات:', error);
      }
    };

    window.addEventListener('voice-signaling', handleVoiceSignaling);
    return () => window.removeEventListener('voice-signaling', handleVoiceSignaling);
  }, [sendMessage, localStream]);

  // Simple microphone toggle
  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
      console.log(isMuted ? '🔊 Microphone unmuted' : '🔇 Microphone muted');
    }
  };

  // Initialize WebRTC connection when partner is found
  useEffect(() => {
    if (connectionStatus === 'connected' && partnerInfo && localStream && !peerConnectionRef.current) {
      console.log("🎯 بدء إعداد اتصال صوتي جديد");
      
      setCallHistory(prev => {
        const newEntry = {
          id: Date.now().toString(),
          country: partnerInfo.country,
          flag: partnerInfo.flag,
          timestamp: Date.now()
        };
        const updated = [newEntry, ...prev].slice(0, 3);
        return updated;
      });
      
      // Create single peer connection
      const peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      
      // Add local audio stream
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
      });
      
      // Handle remote audio
      peerConnection.ontrack = (event) => {
        console.log("📥 تدفق صوتي جديد");
        
        if (remoteAudioRef.current && event.streams[0]) {
          remoteAudioRef.current.srcObject = event.streams[0];
          remoteAudioRef.current.volume = 1.0;
          
          remoteAudioRef.current.play().then(() => {
            console.log("🔊 تم التشغيل");
          }).catch((error) => {
            console.log("يتطلب نقرة:", error.message);
          });
        }
      };
      
      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          sendMessage('ice-candidate', { iceCandidate: event.candidate });
        }
      };
      
      peerConnectionRef.current = peerConnection;
      
      // Send offer as initiator
      peerConnection.createOffer().then(offer => {
        peerConnection.setLocalDescription(offer);
        sendMessage('voice-offer', { offer });
        console.log('📤 إرسال عرض');
      });
    }
  }, [connectionStatus, partnerInfo, localStream, sendMessage]);

  // Auto-reconnect functionality when enabled - prevent loops
  const autoReconnectRef = useRef(false);
  useEffect(() => {
    if (autoReconnect && connectionStatus === 'disconnected' && localStream && !autoReconnectRef.current) {
      autoReconnectRef.current = true;
      console.log("🔄 Auto-reconnect enabled, searching for next partner...");
      
      const timer = setTimeout(() => {
        if (connectionStatus === 'disconnected' && autoReconnect) {
          sendMessage('find-partner', { preferredCountry: selectedCountry });
        }
        autoReconnectRef.current = false;
      }, 3000);
      
      return () => {
        clearTimeout(timer);
        autoReconnectRef.current = false;
      };
    }
    
    // Reset flag when connected
    if (connectionStatus === 'connected') {
      autoReconnectRef.current = false;
    }
  }, [autoReconnect, connectionStatus, localStream, selectedCountry, sendMessage]);

  // Removed automatic WebSocket connection to prevent loops
  // Connection will be established when user clicks "Find Partner"

  // Disabled auto-reconnect to prevent infinite matching loops
  // useEffect(() => {
  //   if (autoReconnect && connectionStatus === 'disconnected' && partnerInfo === undefined) {
  //     const timer = setTimeout(() => {
  //       sendMessage('find-partner', { preferredCountry: selectedCountry });
  //     }, 2000);
  //     
  //     return () => clearTimeout(timer);
  //   }
  // }, [autoReconnect, connectionStatus, partnerInfo, sendMessage, selectedCountry]);

  const handleFindNext = async () => {
    // Request microphone permission first if not already granted
    if (!localStream) {
      const micGranted = await requestMicrophone();
      if (!micGranted) {
        return; // Don't proceed if microphone access denied
      }
    }

    // Fast skip/next partner functionality
    if (connectionStatus === 'connected' || connectionStatus === 'searching') {
      // Quick disconnect and find new partner
      sendMessage('next-partner', { preferredCountry: selectedCountry });
      setDailyConnections(prev => prev + 1);
      setChatMessages([]);
      return;
    }
    
    // Connect to WebSocket first if not connected
    console.log('🌐 Starting connection process...');
    if (!wsConnected) {
      console.log('📡 Connecting to WebSocket...');
      connectWS();
      // Wait longer for connection to establish
      setTimeout(() => {
        console.log('🔍 Sending find partner request...');
        sendMessage('find-partner', { preferredCountry: selectedCountry });
      }, 1000);
    } else {
      console.log('✅ Already connected, finding partner...');
      sendMessage('find-partner', { preferredCountry: selectedCountry });
    }
    setChatMessages([]);
  };

  const handleSendChatMessage = (message: string) => {
    sendMessage('chat-message', { message });
    setChatMessages(prev => [...prev, {
      id: Date.now().toString(),
      message,
      isOwn: true,
      timestamp: Date.now()
    }]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-800 to-indigo-900 text-white font-sans">
      {/* Purple glow effects */}
      <div className="fixed inset-0">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-24 h-24 bg-violet-500/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-28 h-28 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-fuchsia-500/20 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>
      
      <div className="relative min-h-screen" style={{ zIndex: 10 }}>
        {/* Compact Header */}
        <header className="p-4 border-b border-white/10">
          <div className="max-w-4xl mx-auto">
            {/* Logo */}
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/50">
                  <span className="text-white text-xs">✨</span>
                </div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent drop-shadow-lg">
                  SpaceTalk.live
                </h1>
              </div>
            </div>

            {/* Compact Stats */}
            <div className="flex justify-center gap-2 mb-3">
              <div className="bg-green-500/20 rounded-full px-2 py-1 text-xs flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                <span>{onlineCount} online</span>
              </div>
              {dailyConnections > 0 && (
                <div className="bg-purple-500/20 rounded-full px-2 py-1 text-xs">
                  Today: {dailyConnections} voices
                </div>
              )}
            </div>

            {/* Settings Row */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Select value={selectedVibe} onValueChange={setSelectedVibe}>
                <SelectTrigger className="bg-purple-500/20 border-purple-500/30 rounded-full h-8 text-xs shadow-lg shadow-purple-500/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-500 max-h-48 text-white">
                  <SelectItem value="any" className="text-white hover:bg-gray-600 focus:bg-gray-600">🌟 Any Vibe</SelectItem>
                  <SelectItem value="chill" className="text-white hover:bg-gray-600 focus:bg-gray-600">😌 Chill</SelectItem>
                  <SelectItem value="fun" className="text-white hover:bg-gray-600 focus:bg-gray-600">🎉 Fun</SelectItem>
                  <SelectItem value="curious" className="text-white hover:bg-gray-600 focus:bg-gray-600">🤔 Curious</SelectItem>
                  <SelectItem value="creative" className="text-white hover:bg-gray-600 focus:bg-gray-600">🎨 Creative</SelectItem>
                  <SelectItem value="adventurous" className="text-white hover:bg-gray-600 focus:bg-gray-600">🚀 Adventurous</SelectItem>
                  <SelectItem value="thoughtful" className="text-white hover:bg-gray-600 focus:bg-gray-600">💭 Thoughtful</SelectItem>
                  <SelectItem value="energetic" className="text-white hover:bg-gray-600 focus:bg-gray-600">⚡ Energetic</SelectItem>
                  <SelectItem value="calm" className="text-white hover:bg-gray-600 focus:bg-gray-600">🧘 Calm</SelectItem>
                  <SelectItem value="playful" className="text-white hover:bg-gray-600 focus:bg-gray-600">🎮 Playful</SelectItem>
                  <SelectItem value="mysterious" className="text-white hover:bg-gray-600 focus:bg-gray-600">🔮 Mysterious</SelectItem>
                  <SelectItem value="friendly" className="text-white hover:bg-gray-600 focus:bg-gray-600">🤝 Friendly</SelectItem>
                  <SelectItem value="philosophical" className="text-white hover:bg-gray-600 focus:bg-gray-600">🤯 Philosophical</SelectItem>
                  <SelectItem value="romantic" className="text-white hover:bg-gray-600 focus:bg-gray-600">💕 Romantic</SelectItem>
                  <SelectItem value="witty" className="text-white hover:bg-gray-600 focus:bg-gray-600">😄 Witty</SelectItem>
                  <SelectItem value="deep" className="text-white hover:bg-gray-600 focus:bg-gray-600">🌊 Deep</SelectItem>
                  <SelectItem value="spontaneous" className="text-white hover:bg-gray-600 focus:bg-gray-600">🌪️ Spontaneous</SelectItem>
                  <SelectItem value="dreamy" className="text-white hover:bg-gray-600 focus:bg-gray-600">☁️ Dreamy</SelectItem>
                  <SelectItem value="ambitious" className="text-white hover:bg-gray-600 focus:bg-gray-600">🎯 Ambitious</SelectItem>
                  <SelectItem value="nostalgic" className="text-white hover:bg-gray-600 focus:bg-gray-600">📸 Nostalgic</SelectItem>
                  <SelectItem value="optimistic" className="text-white hover:bg-gray-600 focus:bg-gray-600">🌈 Optimistic</SelectItem>
                  <SelectItem value="rebellious" className="text-white hover:bg-gray-600 focus:bg-gray-600">🔥 Rebellious</SelectItem>
                  <SelectItem value="zen" className="text-white hover:bg-gray-600 focus:bg-gray-600">🕯️ Zen</SelectItem>
                  <SelectItem value="cosmic" className="text-white hover:bg-gray-600 focus:bg-gray-600">🌌 Cosmic</SelectItem>
                </SelectContent>
              </Select>

              <button
                onClick={() => setIsFiltersOpen(true)}
                className="bg-violet-500/20 border border-violet-500/30 rounded-full h-8 px-3 text-xs hover:bg-violet-500/30 transition-colors shadow-lg shadow-violet-500/20"
              >
                🔍 Filters
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4">
          <div className="max-w-md mx-auto space-y-6">
            {/* Connection Status */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/10">
              {connectionStatus === 'searching' && (
                <div>
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center animate-pulse">
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <h2 className="text-lg font-semibold mb-2">Searching...</h2>
                  <p className="text-sm text-gray-300">Finding your conversation partner</p>
                </div>
              )}

              {connectionStatus === 'connected' && partnerInfo && (
                <div>
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-2xl">👥</span>
                  </div>
                  <h2 className="text-lg font-semibold mb-2">Connected!</h2>
                  <div className="flex items-center justify-center gap-2 text-gray-300">
                    <span className="text-xl">{partnerInfo.flag}</span>
                    <span className="text-sm">{partnerInfo.country}</span>
                  </div>
                </div>
              )}

              {connectionStatus === 'disconnected' && (
                <div>
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🌟</span>
                  </div>
                  <h2 className="text-lg font-semibold mb-2">Ready to Connect</h2>
                  <p className="text-sm text-gray-300">Tap "Next" to find someone</p>
                </div>
              )}
            </div>

            {/* Auto-reconnect option - Always visible */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <input
                type="checkbox"
                id="auto-reconnect"
                checked={autoReconnect}
                onChange={(e) => setAutoReconnect(e.target.checked)}
                className="w-3 h-3 rounded border-gray-600 bg-gray-700 text-emerald-500 focus:ring-emerald-500 focus:ring-1"
              />
              <label htmlFor="auto-reconnect" className="text-xs text-gray-400 cursor-pointer">
                Auto-reconnect to others
              </label>
            </div>

            {/* Control Buttons */}
            <div className="flex justify-center items-center gap-4">
              {/* Mute */}
              <button
                onClick={toggleMute}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  isMuted ? 'bg-gradient-to-r from-red-400 to-pink-400 shadow-red-400/70' : 'bg-gradient-to-r from-emerald-400 to-green-400 hover:from-green-400 hover:to-emerald-400 shadow-emerald-400/70'
                } shadow-xl transform hover:scale-110`}
              >
                <span className="text-white text-lg">{isMuted ? '🔇' : '🎤'}</span>
              </button>

              {/* Next - Main Button */}
              <button
                onClick={handleFindNext}
                className="w-16 h-16 bg-gradient-to-r from-orange-400 to-yellow-400 hover:from-yellow-400 hover:to-orange-400 rounded-full flex items-center justify-center shadow-2xl shadow-orange-400/80 transition-all transform hover:scale-110"
              >
                <span className="text-white text-2xl">📞</span>
              </button>

              {/* Chat */}
              <button
                onClick={() => setIsChatOpen(true)}
                disabled={connectionStatus !== 'connected'}
                className={`w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all transform hover:scale-110 ${
                  connectionStatus === 'connected' 
                    ? 'bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-cyan-400 hover:to-blue-400 shadow-blue-400/70' 
                    : 'bg-gray-600 cursor-not-allowed opacity-50'
                }`}
              >
                <span className="text-white text-lg">💬</span>
              </button>
            </div>

            {/* Secondary Controls */}
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setIsGamesOpen(true)}
                className="bg-gradient-to-r from-purple-400 to-pink-400 hover:from-pink-400 hover:to-purple-400 rounded-full px-4 py-2 text-sm shadow-xl shadow-purple-400/70 transition-all transform hover:scale-110"
              >
                🎮 Games
              </button>
              <button
                onClick={() => setIsCallHistoryOpen(true)}
                className="bg-gradient-to-r from-indigo-400 to-blue-400 hover:from-blue-400 hover:to-indigo-400 rounded-full px-4 py-2 text-sm shadow-xl shadow-indigo-400/70 transition-all transform hover:scale-110"
              >
                📞 History
              </button>
              <button
                onClick={() => setIsDonationOpen(true)}
                className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-orange-400 hover:to-yellow-400 rounded-full px-4 py-2 text-sm shadow-xl shadow-yellow-400/70 transition-all animate-pulse transform hover:scale-110"
              >
                ❤️ Support
              </button>
            </div>

            {/* Quote */}
            <div className="text-center">
              <p className="text-xs text-gray-400 italic">"{currentQuote}"</p>
            </div>
          </div>
        </main>

        {/* Guidelines Section */}
        <footer className="p-4 border-t border-white/10">
          <div className="max-w-md mx-auto text-center space-y-2">
            <h3 className="text-sm font-semibold text-emerald-400">Community Guidelines</h3>
            <div className="text-xs text-gray-300 space-y-1">
              <p>• Must be 18+ years old to use this service</p>
              <p>• Be respectful and kind to other users</p>
              <p>• No harassment, hate speech, or inappropriate content</p>
              <p>• Report any misconduct using the report feature</p>
              <p>• Your privacy and safety are our priority</p>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              By using SpaceTalk.live, you agree to follow these guidelines
            </p>
            
            {/* Links Section */}
            <div className="flex justify-center gap-3 mt-4 text-xs">
              <a href="#" className="bg-cyan-500/20 border border-cyan-500/30 rounded-full px-3 py-1.5 text-cyan-300 hover:text-cyan-200 hover:bg-cyan-500/30 transition-all shadow-lg shadow-cyan-500/20">
                ℹ️ About
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="bg-pink-500/20 border border-pink-500/30 rounded-full px-3 py-1.5 text-pink-300 hover:text-pink-200 hover:bg-pink-500/30 transition-all shadow-lg shadow-pink-500/20">
                📷 Instagram
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="bg-blue-500/20 border border-blue-500/30 rounded-full px-3 py-1.5 text-blue-300 hover:text-blue-200 hover:bg-blue-500/30 transition-all shadow-lg shadow-blue-500/20">
                📘 Facebook
              </a>
              <a href="mailto:contact@spacetalk.live" className="bg-emerald-500/20 border border-emerald-500/30 rounded-full px-3 py-1.5 text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/30 transition-all shadow-lg shadow-emerald-500/20">
                📧 Contact
              </a>
            </div>
          </div>
        </footer>
      </div>

      {/* Call History Modal */}
      {isCallHistoryOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-indigo-400">📞 Call History</h2>
              <button
                onClick={() => setIsCallHistoryOpen(false)}
                className="text-gray-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {callHistory.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-sm">No recent calls</p>
                  <p className="text-xs text-gray-500 mt-1">Your last 3 conversations will appear here</p>
                </div>
              ) : (
                callHistory.map((call, index) => (
                  <div
                    key={call.id}
                    className="bg-gray-700 rounded-lg p-3 flex items-center justify-between hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{call.flag}</span>
                      <div>
                        <p className="text-white text-sm font-medium">{call.country}</p>
                        <p className="text-gray-400 text-xs">
                          {new Date(call.timestamp).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      #{index + 1}
                    </div>
                  </div>
                ))
              )}
            </div>

            {callHistory.length > 0 && (
              <p className="text-xs text-gray-500 text-center mt-4">
                History clears when you leave the page
              </p>
            )}
          </div>
        </div>
      )}

      {/* Filters Modal */}
      {isFiltersOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-emerald-400">Filters & Preferences</h2>
              <button
                onClick={() => setIsFiltersOpen(false)}
                className="text-gray-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Interest Keywords */}
              <div>
                <label className="block text-sm font-medium mb-2 text-teal-400">Interest Keywords</label>
                <input
                  type="text"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  placeholder="e.g., music, travel, technology..."
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:border-emerald-500 focus:outline-none"
                />
                <p className="text-xs text-gray-400 mt-1">Separate with commas</p>
              </div>

              {/* Preferred Countries */}
              <div>
                <label className="block text-sm font-medium mb-2 text-emerald-400">Preferred Countries</label>
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-2 min-h-[60px] max-h-32 overflow-y-auto">
                  {preferredCountries.length === 0 ? (
                    <p className="text-xs text-gray-400 p-2">No countries selected</p>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {preferredCountries.map((countryCode) => {
                        const country = countries.find(c => c.code === countryCode);
                        return country ? (
                          <span key={countryCode} className="bg-emerald-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                            {country.flag} {country.name}
                            <button
                              onClick={() => setPreferredCountries(prev => prev.filter(c => c !== countryCode))}
                              className="text-emerald-200 hover:text-white ml-1"
                            >
                              ✕
                            </button>
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
                <Select value="" onValueChange={(value) => {
                  if (value && !preferredCountries.includes(value)) {
                    setPreferredCountries(prev => [...prev, value]);
                  }
                }}>
                  <SelectTrigger className="mt-2 bg-gray-700 border-gray-600 text-sm">
                    <SelectValue placeholder="Add preferred country..." />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600 max-h-48">
                    {countries.filter(c => c.code !== 'any' && !preferredCountries.includes(c.code)).map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        <span className="flex items-center gap-2">
                          <span>{country.flag}</span>
                          <span className="truncate">{country.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Blocked Countries */}
              <div>
                <label className="block text-sm font-medium mb-2 text-red-400">Blocked Countries</label>
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-2 min-h-[60px] max-h-32 overflow-y-auto">
                  {blockedCountries.length === 0 ? (
                    <p className="text-xs text-gray-400 p-2">No countries blocked</p>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {blockedCountries.map((countryCode) => {
                        const country = countries.find(c => c.code === countryCode);
                        return country ? (
                          <span key={countryCode} className="bg-red-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                            {country.flag} {country.name}
                            <button
                              onClick={() => setBlockedCountries(prev => prev.filter(c => c !== countryCode))}
                              className="text-red-200 hover:text-white ml-1"
                            >
                              ✕
                            </button>
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
                <Select value="" onValueChange={(value) => {
                  if (value && !blockedCountries.includes(value)) {
                    setBlockedCountries(prev => [...prev, value]);
                  }
                }}>
                  <SelectTrigger className="mt-2 bg-gray-700 border-gray-600 text-sm">
                    <SelectValue placeholder="Add blocked country..." />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600 max-h-48">
                    {countries.filter(c => c.code !== 'any' && !blockedCountries.includes(c.code)).map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        <span className="flex items-center gap-2">
                          <span>{country.flag}</span>
                          <span className="truncate">{country.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Auto-Next Timer */}
              <div>
                <label className="block text-sm font-medium mb-2 text-orange-400">Auto-Next Timer</label>
                <Select value={autoNextTimer?.toString() || "off"} onValueChange={(value) => setAutoNextTimer(value === "off" ? null : parseInt(value))}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="off">⏰ Disabled</SelectItem>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="60">60 seconds</SelectItem>
                    <SelectItem value="90">90 seconds</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setInterests("");
                  setPreferredCountries([]);
                  setBlockedCountries([]);
                  setAutoNextTimer(null);
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg text-sm transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={() => setIsFiltersOpen(false)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg text-sm transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={chatMessages}
        onSendMessage={handleSendChatMessage}
        isConnected={connectionStatus === 'connected'}
      />
      
      <GamesModal
        isOpen={isGamesOpen}
        onClose={() => setIsGamesOpen(false)}
        isConnected={connectionStatus === 'connected'}
        sendMessage={sendMessage}
      />
      
      <DonationModal
        isOpen={isDonationOpen}
        onClose={() => setIsDonationOpen(false)}
      />
      
      {/* Remote audio element */}
      <audio 
        ref={remoteAudioRef} 
        autoPlay 
        playsInline
        controls={false}
        style={{ position: 'fixed', bottom: '10px', right: '10px', width: '200px', height: '40px', zIndex: 1000 }}
      />
    </div>
  );
}
