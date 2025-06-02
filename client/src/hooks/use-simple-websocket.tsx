import { useCallback, useRef, useState } from "react";

interface UseSimpleWebSocketProps {
  onOnlineCount: (count: number) => void;
  onChatMessage: (message: string, fromUserId: string, timestamp: number) => void;
}

interface PartnerInfo {
  country: string;
  flag: string;
}

export function useSimpleWebSocket({ onOnlineCount, onChatMessage }: UseSimpleWebSocketProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'searching' | 'connected'>('disconnected');
  const [partnerInfo, setPartnerInfo] = useState<PartnerInfo | undefined>();
  const ws = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    try {
      console.log('Attempting WebSocket connection to:', wsUrl);
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        setIsConnected(true);
        console.log('WebSocket connected successfully');
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket connection error:', error);
        console.log('Failed to connect to:', wsUrl);
        setIsConnected(false);
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'user-connected-self':
              setConnectionStatus('disconnected');
              break;
              
            case 'online-count':
              onOnlineCount(data.payload.count);
              break;
              
            case 'searching':
              setConnectionStatus('searching');
              setPartnerInfo(undefined);
              break;
              
            case 'user-connected':
              setConnectionStatus('connected');
              setPartnerInfo({
                country: data.payload.partnerCountry,
                flag: data.payload.partnerFlag
              });
              break;
              
            case 'user-disconnected':
              setConnectionStatus('disconnected');
              setPartnerInfo(undefined);
              break;
              
            case 'chat-message':
              onChatMessage(data.payload.message, data.payload.fromUserId, data.payload.timestamp);
              break;
              
            case 'voice-offer':
            case 'voice-answer':
            case 'ice-candidate':
              window.dispatchEvent(new CustomEvent('voice-signaling', { detail: data }));
              break;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onclose = () => {
        setIsConnected(false);
        setConnectionStatus('disconnected');
        setPartnerInfo(undefined);
        console.log('WebSocket disconnected');
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }, [onOnlineCount, onChatMessage]);

  const sendMessage = useCallback((type: string, payload?: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type, payload }));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }, []);

  const disconnect = useCallback(() => {
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
  }, []);

  return {
    isConnected,
    connectionStatus,
    partnerInfo,
    sendMessage,
    connect,
    disconnect
  };
}