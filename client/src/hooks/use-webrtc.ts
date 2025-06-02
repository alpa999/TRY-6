import { useState, useRef, useEffect } from 'react';

interface UseWebRTCProps {
  sendMessage: (type: string, payload: any) => void;
  onRemoteStream?: (stream: MediaStream) => void;
}

export function useWebRTC({ sendMessage, onRemoteStream }: UseWebRTCProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const peerConnection = useRef<RTCPeerConnection | null>(null);

  // Initialize peer connection
  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('Sending ICE candidate');
        sendMessage('ice-candidate', { candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      console.log('Received remote stream');
      const remoteStream = event.streams[0];
      if (onRemoteStream) {
        onRemoteStream(remoteStream);
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      setIsConnected(pc.connectionState === 'connected');
    };

    return pc;
  };

  // Start microphone
  const startMicrophone = async () => {
    try {
      console.log('Starting microphone...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true, 
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      setLocalStream(stream);
      console.log('Microphone started successfully');
      return stream;
    } catch (error) {
      console.error('Failed to start microphone:', error);
      throw error;
    }
  };

  // Create offer
  const createOffer = async () => {
    if (!localStream) {
      console.log('No local stream, starting microphone first...');
      await startMicrophone();
    }

    const pc = createPeerConnection();
    peerConnection.current = pc;

    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      console.log('Created and set local offer');
      sendMessage('voice-offer', { 
        sdp: offer.sdp, 
        type: offer.type 
      });
    } catch (error) {
      console.error('Failed to create offer:', error);
    }
  };

  // Handle offer
  const handleOffer = async (offer: { sdp: string; type: string }) => {
    console.log('Handling voice offer');
    
    if (!localStream) {
      await startMicrophone();
    }

    const pc = createPeerConnection();
    peerConnection.current = pc;

    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    try {
      await pc.setRemoteDescription(new RTCSessionDescription({
        sdp: offer.sdp,
        type: offer.type as RTCSdpType
      }));
      
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      
      console.log('Created and sent answer');
      sendMessage('voice-answer', { 
        sdp: answer.sdp, 
        type: answer.type 
      });
    } catch (error) {
      console.error('Failed to handle offer:', error);
    }
  };

  // Handle answer
  const handleAnswer = async (answer: { sdp: string; type: string }) => {
    console.log('Handling voice answer');
    
    if (peerConnection.current) {
      try {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription({
          sdp: answer.sdp,
          type: answer.type as RTCSdpType
        }));
        console.log('Set remote description from answer');
      } catch (error) {
        console.error('Failed to handle answer:', error);
      }
    }
  };

  // Handle ICE candidate
  const handleIceCandidate = async (candidate: RTCIceCandidate) => {
    console.log('Handling ICE candidate');
    
    if (peerConnection.current) {
      try {
        await peerConnection.current.addIceCandidate(candidate);
        console.log('Added ICE candidate');
      } catch (error) {
        console.error('Failed to add ICE candidate:', error);
      }
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
      console.log(isMuted ? 'Unmuted' : 'Muted');
    }
  };

  // Cleanup
  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    setIsConnected(false);
    setIsMuted(false);
  };

  return {
    localStream,
    isConnected,
    isMuted,
    startMicrophone,
    createOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    toggleMute,
    cleanup
  };
}