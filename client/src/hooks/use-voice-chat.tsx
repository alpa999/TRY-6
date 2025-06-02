import { useState, useCallback, useRef, useEffect } from 'react';

interface UseVoiceChatProps {
  isConnected: boolean;
  sendMessage: (type: string, payload: any) => void;
}

export function useVoiceChat({ isConnected, sendMessage }: UseVoiceChatProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [microphonePermission, setMicrophonePermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  
  const localStream = useRef<MediaStream | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const remoteAudio = useRef<HTMLAudioElement | null>(null);

  // Request microphone permission
  const requestMicrophonePermission = useCallback(async () => {
    try {
      console.log('Requesting microphone permission...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      localStream.current = stream;
      setMicrophonePermission('granted');
      setIsCallActive(true);
      console.log('Microphone permission granted');
      return stream;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setMicrophonePermission('denied');
      alert('Please allow microphone access to use voice chat. Check your browser settings.');
      throw error;
    }
  }, []);

  // Create peer connection
  const createPeerConnection = useCallback(() => {
    const config: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };

    const pc = new RTCPeerConnection(config);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('Sending ICE candidate');
        sendMessage('ice-candidate', { candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      console.log('Received remote audio stream');
      if (remoteAudio.current) {
        remoteAudio.current.srcObject = event.streams[0];
        remoteAudio.current.play().catch(console.error);
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
    };

    return pc;
  }, [sendMessage]);

  // Start voice call
  const startVoiceCall = useCallback(async () => {
    try {
      if (!isConnected) {
        console.log('Cannot start voice call: not connected');
        return;
      }

      console.log('Starting voice call...');
      
      // Get microphone stream
      const stream = await requestMicrophonePermission();
      
      // Create peer connection
      const pc = createPeerConnection();
      peerConnection.current = pc;

      // Add local stream tracks
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
        console.log('Added local audio track');
      });

      // Create and send offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      console.log('Sending voice offer');
      sendMessage('voice-offer', { sdp: offer.sdp, type: offer.type });
      
    } catch (error) {
      console.error('Failed to start voice call:', error);
    }
  }, [isConnected, requestMicrophonePermission, createPeerConnection, sendMessage]);

  // Handle voice offer
  const handleVoiceOffer = useCallback(async (offer: { sdp: string; type: string }) => {
    try {
      console.log('Received voice offer, creating answer...');
      
      // Get microphone stream
      const stream = await requestMicrophonePermission();
      
      // Create peer connection
      const pc = createPeerConnection();
      peerConnection.current = pc;

      // Add local stream tracks
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Set remote description
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      
      // Create and send answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      
      console.log('Sending voice answer');
      sendMessage('voice-answer', { sdp: answer.sdp, type: answer.type });
      
    } catch (error) {
      console.error('Failed to handle voice offer:', error);
    }
  }, [requestMicrophonePermission, createPeerConnection, sendMessage]);

  // Handle voice answer
  const handleVoiceAnswer = useCallback(async (answer: { sdp: string; type: string }) => {
    try {
      console.log('Received voice answer');
      if (peerConnection.current) {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
      }
    } catch (error) {
      console.error('Failed to handle voice answer:', error);
    }
  }, []);

  // Handle ICE candidate
  const handleIceCandidate = useCallback(async (candidate: RTCIceCandidate) => {
    try {
      if (peerConnection.current) {
        await peerConnection.current.addIceCandidate(candidate);
        console.log('Added ICE candidate');
      }
    } catch (error) {
      console.error('Failed to add ICE candidate:', error);
    }
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (localStream.current) {
      const audioTracks = localStream.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
      console.log(isMuted ? 'Unmuted' : 'Muted');
    }
  }, [isMuted]);

  // End call
  const endCall = useCallback(() => {
    console.log('Ending voice call...');
    
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
      localStream.current = null;
    }
    
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    
    if (remoteAudio.current) {
      remoteAudio.current.srcObject = null;
    }
    
    setIsCallActive(false);
    setIsMuted(false);
  }, []);

  // Cleanup when disconnected
  useEffect(() => {
    if (!isConnected) {
      endCall();
    }
  }, [isConnected, endCall]);

  // Create audio element for remote stream
  useEffect(() => {
    if (!remoteAudio.current) {
      remoteAudio.current = new Audio();
      remoteAudio.current.autoplay = true;
    }
  }, []);

  return {
    isMuted,
    isCallActive,
    microphonePermission,
    startVoiceCall,
    toggleMute,
    endCall,
    handleVoiceOffer,
    handleVoiceAnswer,
    handleIceCandidate
  };
}