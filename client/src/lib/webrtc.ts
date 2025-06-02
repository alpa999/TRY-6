export class WebRTCManager {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteAudio: HTMLAudioElement | null = null;

  private configuration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' }
    ]
  };

  constructor(
    private onIceCandidate: (candidate: RTCIceCandidate) => void,
    private onRemoteStream: (stream: MediaStream) => void
  ) {
    this.setupRemoteAudio();
  }

  private setupRemoteAudio() {
    this.remoteAudio = document.createElement('audio');
    this.remoteAudio.autoplay = true;
    this.remoteAudio.style.display = 'none';
    document.body.appendChild(this.remoteAudio);
  }

  async initialize(): Promise<void> {
    try {
      // Get user media first
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      });

      // Create peer connection
      this.peerConnection = new RTCPeerConnection(this.configuration);

      // Set up event handlers
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          this.onIceCandidate(event.candidate);
        }
      };

      this.peerConnection.ontrack = (event) => {
        if (this.remoteAudio && event.streams[0]) {
          this.remoteAudio.srcObject = event.streams[0];
          this.onRemoteStream(event.streams[0]);
        }
      };

      // Add local stream tracks
      this.localStream.getTracks().forEach(track => {
        if (this.peerConnection && this.localStream) {
          this.peerConnection.addTrack(track, this.localStream);
        }
      });

    } catch (error) {
      console.error('Error initializing WebRTC:', error);
      throw error;
    }
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    return offer;
  }

  async createAnswer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    await this.peerConnection.setRemoteDescription(offer);
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    return answer;
  }

  async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    await this.peerConnection.setRemoteDescription(answer);
  }

  async addIceCandidate(candidate: RTCIceCandidate): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    await this.peerConnection.addIceCandidate(candidate);
  }

  toggleMute(): boolean {
    if (!this.localStream) return false;

    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      return !audioTrack.enabled; // Return muted state
    }
    return false;
  }

  disconnect(): void {
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    if (this.remoteAudio) {
      this.remoteAudio.srcObject = null;
    }
  }

  cleanup(): void {
    this.disconnect();
    
    if (this.remoteAudio) {
      document.body.removeChild(this.remoteAudio);
      this.remoteAudio = null;
    }
  }
}
