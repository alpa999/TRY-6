let localStream: MediaStream | null = null;
let peerConnection: RTCPeerConnection | null = null;
let socket: WebSocket | null = null;

const config = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

export async function initializeVoiceSystem() {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${window.location.host}/ws`;
  
  socket = new WebSocket(wsUrl);
  
  socket.onopen = async () => {
    console.log("✅ WebSocket مفتوح");
    await startAudioAndConnect();
  };

  socket.onmessage = async (event) => {
    const data = JSON.parse(event.data);

    if (data.offer) {
      console.log("📩 عرض وارد");
      if (!localStream) {
        localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log("🎤 تم تفعيل المايك (عرض)");
      }

      setupPeer();

      await peerConnection!.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await peerConnection!.createAnswer();
      await peerConnection!.setLocalDescription(answer);
      socket!.send(JSON.stringify({ answer }));
    }

    if (data.answer) {
      console.log("📩 رد وارد");
      await peerConnection!.setRemoteDescription(new RTCSessionDescription(data.answer));
    }

    if (data.iceCandidate) {
      console.log("📩 ICE وارد");
      await peerConnection!.addIceCandidate(new RTCIceCandidate(data.iceCandidate));
    }
  };
}

async function startAudioAndConnect() {
  try {
    // طلب إذن المايك
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log("🎤 تم تفعيل المايك");

    // إعداد WebRTC
    setupPeer();

    // إرسال عرض الاتصال للطرف الآخر
    const offer = await peerConnection!.createOffer();
    await peerConnection!.setLocalDescription(offer);
    socket!.send(JSON.stringify({ offer }));

  } catch (err) {
    console.error("❌ فشل في تفعيل المايك:", err);
    alert("يرجى السماح باستخدام الميكروفون.");
  }
}

function setupPeer() {
  peerConnection = new RTCPeerConnection(config);

  // إضافة المايك إلى الاتصال
  if (localStream) {
    localStream.getTracks().forEach(track => {
      peerConnection!.addTrack(track, localStream!);
    });
  }

  // استقبال الصوت من الطرف الآخر
  peerConnection.ontrack = (event) => {
    console.log("📥 تم استقبال صوت");
    const remoteAudio = new Audio();
    remoteAudio.srcObject = event.streams[0];
    remoteAudio.autoplay = true;
    remoteAudio.play();
  };

  // مشاركة الـ ICE Candidates
  peerConnection.onicecandidate = (event) => {
    if (event.candidate && socket) {
      socket.send(JSON.stringify({ iceCandidate: event.candidate }));
    }
  };
}

export function muteAudio() {
  if (localStream) {
    localStream.getAudioTracks().forEach(track => {
      track.enabled = !track.enabled;
    });
  }
}

export function cleanup() {
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
    localStream = null;
  }
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
  if (socket) {
    socket.close();
    socket = null;
  }
}