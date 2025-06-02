import { 
  users, 
  chatSessions, 
  chatMessages,
  type User, 
  type InsertUser,
  type ChatSession,
  type ChatMessage,
  type InsertChatSession,
  type InsertChatMessage,
  type UserConnection
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  getChatSession(id: number): Promise<ChatSession | undefined>;
  updateChatSessionStatus(id: number, status: string): Promise<void>;
  addChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(sessionId: number): Promise<ChatMessage[]>;
  getActiveConnections(): Promise<UserConnection[]>;
  addConnection(connection: UserConnection): Promise<void>;
  removeConnection(userId: string): Promise<void>;
  getConnectionByUserId(userId: string): Promise<UserConnection | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private chatSessions: Map<number, ChatSession>;
  private chatMessages: Map<number, ChatMessage>;
  private connections: Map<string, UserConnection>;
  private currentUserId: number;
  private currentSessionId: number;
  private currentMessageId: number;

  constructor() {
    this.users = new Map();
    this.chatSessions = new Map();
    this.chatMessages = new Map();
    this.connections = new Map();
    this.currentUserId = 1;
    this.currentSessionId = 1;
    this.currentMessageId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createChatSession(insertSession: InsertChatSession): Promise<ChatSession> {
    const id = this.currentSessionId++;
    const session: ChatSession = {
      ...insertSession,
      id,
      createdAt: new Date(),
    };
    this.chatSessions.set(id, session);
    return session;
  }

  async getChatSession(id: number): Promise<ChatSession | undefined> {
    return this.chatSessions.get(id);
  }

  async updateChatSessionStatus(id: number, status: string): Promise<void> {
    const session = this.chatSessions.get(id);
    if (session) {
      session.status = status;
      this.chatSessions.set(id, session);
    }
  }

  async addChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentMessageId++;
    const message: ChatMessage = {
      ...insertMessage,
      id,
      createdAt: new Date(),
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async getChatMessages(sessionId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values()).filter(
      (message) => message.sessionId === sessionId
    );
  }

  async getActiveConnections(): Promise<UserConnection[]> {
    return Array.from(this.connections.values());
  }

  async addConnection(connection: UserConnection): Promise<void> {
    this.connections.set(connection.id, connection);
  }

  async removeConnection(userId: string): Promise<void> {
    this.connections.delete(userId);
  }

  async getConnectionByUserId(userId: string): Promise<UserConnection | undefined> {
    return this.connections.get(userId);
  }
}

export const storage = new MemStorage();
