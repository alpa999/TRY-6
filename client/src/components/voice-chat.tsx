import { useEffect, useRef } from 'react';
import { useMicrophone } from '@/hooks/use-microphone';
import { useWebRTC } from '@/hooks/use-webrtc';

interface VoiceChatProps {
  isConnected: boolean;
  sendMessage: (type: string, payload: any) => void;
  onVoiceMessage: (handler: any) => void;
}

export function VoiceChat({ isConnected, sendMessage, onVoiceMessage }: VoiceChatProps) {
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const { 
    stream: micStream, 
    hasPermission, 
    requestPermission,
    toggleMute,
    isMuted 
  } = useMicrophone();

  const {
    localStream,
    isConnected: voiceConnected,
    createOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    cleanup
  } = useWebRTC({
    sendMessage,
    onRemoteStream: (stream) => {
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = stream;
        console.log('Set remote audio stream');
      }
    }
  });

  // Handle voice messages
  useEffect(() => {
    const handleVoiceMessage = (message: any) => {
      switch (message.type) {
        case 'voice-offer':
          console.log('Received voice offer');
          handleOffer(message.payload);
          break;
        case 'voice-answer':
          console.log('Received voice answer');
          handleAnswer(message.payload);
          break;
        case 'ice-candidate':
          console.log('Received ICE candidate');
          handleIceCandidate(message.payload.candidate);
          break;
      }
    };

    onVoiceMessage(handleVoiceMessage);
  }, [handleOffer, handleAnswer, handleIceCandidate, onVoiceMessage]);

  // Auto-request microphone when connected
  useEffect(() => {
    if (isConnected && !hasPermission) {
      requestPermission().then(() => {
        console.log('Auto-requested microphone for voice chat');
      }).catch(err => {
        console.log('Auto microphone request failed:', err);
      });
    }
  }, [isConnected, hasPermission, requestPermission]);

  // Start voice call when both connected and have microphone
  useEffect(() => {
    if (isConnected && micStream && !localStream) {
      console.log('Starting voice call...');
      createOffer();
    }
  }, [isConnected, micStream, localStream, createOffer]);

  // Cleanup on disconnect
  useEffect(() => {
    if (!isConnected) {
      cleanup();
    }
  }, [isConnected, cleanup]);

  return (
    <>
      <audio 
        ref={remoteAudioRef} 
        autoPlay 
        playsInline
        style={{ display: 'none' }}
      />
      {/* Voice controls can be added here if needed */}
    </>
  );
}