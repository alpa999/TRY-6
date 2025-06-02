import { useCallback, useEffect, useRef, useState } from "react";

interface UseWebSocketProps {
  onOnlineCount: (count: number) => void;
  onChatMessage: (message: string, fromUserId: string, timestamp: number) => void;
}

interface PartnerInfo {
  country: string;
  flag: string;
}

export function useWebSocket({ onOnlineCount, onChatMessage }: UseWebSocketProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'searching' | 'connected'>('disconnected');
  const [partnerInfo, setPartnerInfo] = useState<PartnerInfo | undefined>();
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return;
    if (ws.current?.readyState === WebSocket.CONNECTING) return;

    // Clean up any existing connection
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    console.log('Attempting to connect to:', wsUrl);
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      setIsConnected(true);
      console.log('WebSocket connected');
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
            // These will be handled by the voice chat hook
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
      
      // Don't auto-reconnect to prevent the connection loop
      // Users can manually reconnect by clicking "Find Partner"
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }, [onOnlineCount, onChatMessage]);

  const sendMessage = useCallback((type: string, payload?: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type, payload }));
    }
  }, []);

  useEffect(() => {
    // Don't auto-connect on mount to prevent connection loops
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  return {
    isConnected,
    connectionStatus,
    partnerInfo,
    sendMessage,
    connect
  };
}
