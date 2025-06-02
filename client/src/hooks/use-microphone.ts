import { useState, useCallback } from 'react';

export function useMicrophone() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Request microphone permission
  const requestPermission = useCallback(async () => {
    if (stream) {
      console.log('Microphone already active');
      return stream;
    }

    setIsRequesting(true);
    setError(null);

    try {
      console.log('Requesting microphone permission...');
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000
        }
      });

      setStream(mediaStream);
      setHasPermission(true);
      setIsRequesting(false);
      
      console.log('Microphone permission granted');
      return mediaStream;
      
    } catch (err: any) {
      setIsRequesting(false);
      setHasPermission(false);
      
      let errorMessage = 'فشل في الحصول على إذن المايكروفون';
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'يرجى السماح للمايكروفون في إعدادات المتصفح';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'لم يتم العثور على مايكروفون';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'المايكروفون مستخدم من تطبيق آخر';
      }
      
      setError(errorMessage);
      console.error('Microphone error:', err);
      throw new Error(errorMessage);
    }
  }, [stream]);

  // Stop microphone
  const stopMicrophone = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped microphone track');
      });
      setStream(null);
      setHasPermission(false);
      setError(null);
    }
  }, [stream]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      console.log('Toggled microphone mute');
    }
  }, [stream]);

  // Check if muted
  const isMuted = stream ? !stream.getAudioTracks()[0]?.enabled : true;

  return {
    stream,
    isRequesting,
    hasPermission,
    error,
    isMuted,
    requestPermission,
    stopMicrophone,
    toggleMute
  };
}