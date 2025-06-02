import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useRef, useEffect } from "react";

interface ChatMessage {
  id: string;
  message: string;
  isOwn: boolean;
  timestamp: number;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isConnected: boolean;
}

export default function ChatModal({ 
  isOpen, 
  onClose, 
  messages, 
  onSendMessage, 
  isConnected 
}: ChatModalProps) {
  const [inputValue, setInputValue] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim() && isConnected) {
      onSendMessage(inputValue.trim());
      setInputValue("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-indigo-400">💬 Chat</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 h-96 flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-3">
            {!isConnected && (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm">Connect to start chatting</p>
                <p className="text-xs text-gray-500 mt-1">Messages will appear here</p>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className="bg-gray-700 rounded-lg p-3 hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-medium ${
                    message.isOwn ? 'text-indigo-400' : 'text-gray-400'
                  }`}>
                    {message.isOwn ? 'You' : 'Explorer'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-white text-sm">{message.message}</p>
              </div>
            ))}
          </div>
          
          <div className="pt-3 border-t border-gray-700">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder={isConnected ? "Type a message..." : "Not connected"}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={!isConnected}
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder:text-gray-400 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/20 h-10 px-3 text-sm"
              />
              <Button
                onClick={handleSend}
                disabled={!inputValue.trim() || !isConnected}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 h-10 rounded-lg text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
