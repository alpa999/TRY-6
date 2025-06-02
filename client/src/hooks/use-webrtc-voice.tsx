import { useCallback, useEffect, useRef, useState } from "react";

interface UseWebRTCVoiceProps {
  onOffer: (offer: RTCSessionDescriptionInit) => void;
  onAnswer: (answer: RTCSessionDescriptionInit) => void;
  onIceCandidate: (candidate: RTCIceCandidate) => void;
}

export function useWebRTCVoice({ onOffer, onAnswer, onIceCandidate }: UseWebRTCVoiceProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const remoteAudio = useRef<HTMLAudioElement | null>(null);

  const configuration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' }
    ],
    iceCandidatePoolSize: 10
  };

  const initializeMedia = useCallback(async () => {
    try {
      if (localStream.current) return localStream.current;

      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStream.current = stream;
      console.log('Microphone initialized');
      return stream;
    } catch (error) {
      console.error('Failed to get microphone access:', error);
      throw error;
    }
  }, []);

  const initializePeerConnection = useCallback(() => {
    if (peerConnection.current) {
      // إعادة استخدام الاتصال الموجود
      return peerConnection.current;
    }

    const pc = new RTCPeerConnection(configuration);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        onIceCandidate(event.candidate);
      }
    };

    pc.ontrack = (event) => {
      console.log('Received remote audio stream');
      if (event.streams && event.streams[0]) {
        if (!remoteAudio.current) {
          remoteAudio.current = new Audio();
          remoteAudio.current.autoplay = true;
          remoteAudio.current.volume = 1.0;
        }
        
        remoteAudio.current.srcObject = event.streams[0];
        remoteAudio.current.play().then(() => {
          console.log('Remote audio playing successfully');
          setIsCallActive(true);
        }).catch(error => {
          console.error('Failed to play remote audio:', error);
        });
      }
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      console.log('Connection state:', state);
      
      if (state === 'connected') {
        setIsCallActive(true);
      } else if (state === 'disconnected' || state === 'failed' || state === 'closed') {
        setIsCallActive(false);
      }
    };

    peerConnection.current = pc;
    return pc;
  }, [onIceCandidate]);

  const createOffer = useCallback(async () => {
    try {
      console.log('Starting offer creation...');
      const stream = await initializeMedia();
      console.log('Media initialized, got stream:', stream);
      
      const pc = initializePeerConnection();
      console.log('Peer connection initialized:', pc);

      // فحص إذا كانت المسارات موجودة مسبقاً
      const existingSenders = pc.getSenders();
      if (existingSenders.length === 0) {
        // إضافة المسارات فقط إذا لم تكن موجودة
        stream.getTracks().forEach(track => {
          console.log('Adding track:', track);
          pc.addTrack(track, stream);
        });
      } else {
        console.log('Tracks already added, skipping...');
      }

      console.log('Creating offer...');
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false
      });
      
      console.log('Offer created:', offer);
      await pc.setLocalDescription(offer);
      console.log('Local description set');
      
      onOffer(offer);
      console.log('Voice offer sent to partner');
    } catch (error) {
      console.error('Error creating offer:', error.message || error);
      console.error('Full error:', error);
    }
  }, [initializeMedia, initializePeerConnection, onOffer]);

  const createAnswer = useCallback(async (offer: RTCSessionDescriptionInit) => {
    try {
      const stream = await initializeMedia();
      const pc = initializePeerConnection();

      // فحص إذا كانت المسارات موجودة مسبقاً
      const existingSenders = pc.getSenders();
      if (existingSenders.length === 0) {
        // إضافة المسارات فقط إذا لم تكن موجودة
        stream.getTracks().forEach(track => {
          console.log('Adding track for answer:', track);
          pc.addTrack(track, stream);
        });
      } else {
        console.log('Tracks already added for answer, skipping...');
      }

      await pc.setRemoteDescription(offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      
      onAnswer(answer);
      console.log('Voice answer created successfully');
    } catch (error) {
      console.error('Error creating answer:', error);
    }
  }, [initializeMedia, initializePeerConnection, onAnswer]);

  const handleAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
    try {
      if (peerConnection.current) {
        await peerConnection.current.setRemoteDescription(answer);
        console.log('Answer processed');
      }
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }, []);

  const addIceCandidate = useCallback(async (candidate: RTCIceCandidate) => {
    try {
      if (peerConnection.current?.remoteDescription) {
        await peerConnection.current.addIceCandidate(candidate);
      }
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (localStream.current) {
      const audioTrack = localStream.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  }, []);

  const endCall = useCallback(() => {
    console.log('Ending voice call and cleaning up...');
    
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped local track:', track.kind);
      });
      localStream.current = null;
    }
    
    if (peerConnection.current) {
      peerConnection.current.getSenders().forEach(sender => {
        peerConnection.current?.removeTrack(sender);
      });
      peerConnection.current.close();
      peerConnection.current = null;
      console.log('Peer connection closed and reset');
    }
    
    if (remoteAudio.current) {
      remoteAudio.current.pause();
      remoteAudio.current.srcObject = null;
      remoteAudio.current = null;
      console.log('Remote audio cleaned up');
    }
    
    setIsCallActive(false);
    setIsMuted(false);
  }, []);

  // Handle voice signaling events
  useEffect(() => {
    const handleVoiceSignaling = (event: CustomEvent) => {
      const data = event.detail;
      
      switch (data.type) {
        case 'voice-offer':
          createAnswer(data.payload);
          break;
        case 'voice-answer':
          handleAnswer(data.payload);
          break;
        case 'ice-candidate':
          addIceCandidate(data.payload);
          break;
      }
    };

    window.addEventListener('voice-signaling', handleVoiceSignaling as EventListener);
    
    return () => {
      window.removeEventListener('voice-signaling', handleVoiceSignaling as EventListener);
      endCall();
    };
  }, [createAnswer, handleAnswer, addIceCandidate, endCall]);

  return {
    isMuted,
    isCallActive,
    toggleMute,
    createOffer,
    endCall
  };
}