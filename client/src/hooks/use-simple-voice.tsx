import { useCallback, useEffect, useRef, useState } from "react";

interface UseSimpleVoiceProps {
  sendMessage: (type: string, payload: any) => void;
  isConnected: boolean;
}

export function useSimpleVoice({ sendMessage, isConnected }: UseSimpleVoiceProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [microphoneStream, setMicrophoneStream] = useState<MediaStream | null>(null);
  
  const localAudio = useRef<HTMLAudioElement | null>(null);
  const remoteAudio = useRef<HTMLAudioElement | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  
  const initializeMicrophone = useCallback(async () => {
    try {
      console.log('Requesting microphone access...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        },
        video: false
      });
      
      setMicrophoneStream(stream);
      console.log('Microphone access granted, stream ready');
      
      return stream;
    } catch (error) {
      console.error('Failed to access microphone:', error);
      throw error;
    }
  }, []);

  const createPeerConnection = useCallback(() => {
    const config: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' }
      ]
    };

    const pc = new RTCPeerConnection(config);

    pc.onicecandidate = (event) => {
      if (event.candidate && isConnected) {
        console.log('Sending ICE candidate');
        sendMessage('ice-candidate', event.candidate);
      }
    };

    pc.ontrack = (event) => {
      console.log('Received remote audio track');
      const [remoteStream] = event.streams;
      
      if (remoteStream) {
        if (!remoteAudio.current) {
          remoteAudio.current = new Audio();
          remoteAudio.current.autoplay = true;
          remoteAudio.current.volume = 1.0;
        }
        
        remoteAudio.current.srcObject = remoteStream;
        remoteAudio.current.play().then(() => {
          console.log('Remote audio is playing');
          setIsCallActive(true);
        }).catch(console.error);
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      
      if (pc.connectionState === 'connected') {
        setIsCallActive(true);
      } else if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        setIsCallActive(false);
      }
    };

    return pc;
  }, [isConnected, sendMessage]);

  const startCall = useCallback(async () => {
    try {
      if (!isConnected) {
        console.log('Cannot start call: not connected to partner');
        return;
      }

      if (microphoneStream) {
        console.log('Call already in progress, skipping...');
        return;
      }

      console.log('Starting voice call...');
      
      const stream = await initializeMicrophone();
      const pc = createPeerConnection();
      
      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
        console.log('Added local track to peer connection');
      });

      // Create and send offer
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false
      });
      
      await pc.setLocalDescription(offer);
      peerConnection.current = pc;
      
      console.log('Sending voice offer to partner');
      sendMessage('voice-offer', { sdp: offer.sdp, type: offer.type });
      
    } catch (error) {
      console.error('Error starting call:', error);
    }
  }, [isConnected, microphoneStream, initializeMicrophone, createPeerConnection, sendMessage]);

  const handleVoiceOffer = useCallback(async (offer: RTCSessionDescriptionInit) => {
    try {
      console.log('Received voice offer, creating answer...');
      
      const stream = await initializeMicrophone();
      const pc = createPeerConnection();
      
      // Add local stream
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Set remote description and create answer
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      
      peerConnection.current = pc;
      
      console.log('Sending voice answer to partner');
      sendMessage('voice-answer', { sdp: answer.sdp, type: answer.type });
      
    } catch (error) {
      console.error('Error handling voice offer:', error);
    }
  }, [initializeMicrophone, createPeerConnection, sendMessage]);

  const handleVoiceAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
    try {
      console.log('Received voice answer');
      
      if (peerConnection.current) {
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
        console.log('Voice answer processed successfully');
      }
    } catch (error) {
      console.error('Error handling voice answer:', error);
    }
  }, []);

  const handleIceCandidate = useCallback(async (candidate: RTCIceCandidate) => {
    try {
      if (peerConnection.current && peerConnection.current.remoteDescription) {
        await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
        console.log('ICE candidate added successfully');
      }
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (microphoneStream) {
      const audioTrack = microphoneStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        console.log('Microphone', audioTrack.enabled ? 'unmuted' : 'muted');
      }
    }
  }, [microphoneStream]);

  const endCall = useCallback(() => {
    console.log('Ending voice call...');
    
    if (microphoneStream) {
      microphoneStream.getTracks().forEach(track => {
        track.stop();
      });
      setMicrophoneStream(null);
    }
    
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    
    if (remoteAudio.current) {
      remoteAudio.current.pause();
      remoteAudio.current.srcObject = null;
    }
    
    setIsCallActive(false);
    setIsMuted(false);
  }, [microphoneStream]);

  // Only cleanup when disconnected - no auto-start
  useEffect(() => {
    if (!isConnected) {
      endCall();
    }
  }, [isConnected, endCall]);

  return {
    isMuted,
    isCallActive,
    toggleMute,
    startCall,
    endCall,
    handleVoiceOffer,
    handleVoiceAnswer,
    handleIceCandidate
  };
}