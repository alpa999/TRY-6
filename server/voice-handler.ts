import { WebSocket } from 'ws';

interface VoiceMessage {
  type: 'voice-offer' | 'voice-answer' | 'ice-candidate';
  payload: any;
}

interface ConnectedUser {
  ws: WebSocket;
  id: string;
  partnerId?: string;
}

// Handle voice messages between partners
export function handleVoiceMessage(
  message: VoiceMessage,
  senderId: string,
  users: Map<string, ConnectedUser>
) {
  const sender = users.get(senderId);
  
  if (!sender || !sender.partnerId) {
    console.log(`No partner found for user ${senderId}`);
    return;
  }

  const partner = users.get(sender.partnerId);
  
  if (!partner || partner.ws.readyState !== WebSocket.OPEN) {
    console.log(`Partner not available for ${message.type}`);
    return;
  }

  // Forward the message to partner
  try {
    partner.ws.send(JSON.stringify({
      type: message.type,
      payload: message.payload
    }));
    console.log(`Forwarded ${message.type} from ${senderId} to ${sender.partnerId}`);
  } catch (error) {
    console.error(`Failed to forward ${message.type}:`, error);
  }
}

// Simple voice offer handler
export function handleVoiceOffer(
  offer: { sdp: string; type: string },
  senderId: string,
  users: Map<string, ConnectedUser>
) {
  console.log(`Voice offer from ${senderId}`);
  handleVoiceMessage(
    { type: 'voice-offer', payload: offer },
    senderId,
    users
  );
}

// Simple voice answer handler
export function handleVoiceAnswer(
  answer: { sdp: string; type: string },
  senderId: string,
  users: Map<string, ConnectedUser>
) {
  console.log(`Voice answer from ${senderId}`);
  handleVoiceMessage(
    { type: 'voice-answer', payload: answer },
    senderId,
    users
  );
}

// Simple ICE candidate handler
export function handleIceCandidate(
  candidate: RTCIceCandidate,
  senderId: string,
  users: Map<string, ConnectedUser>
) {
  console.log(`ICE candidate from ${senderId}`);
  handleVoiceMessage(
    { type: 'ice-candidate', payload: { candidate } },
    senderId,
    users
  );
}