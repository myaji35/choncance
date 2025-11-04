// In-memory store for QR login sessions
// In production, use Redis or similar distributed cache

export interface QRLoginSession {
  sessionId: string;
  createdAt: Date;
  expiresAt: Date;
  authenticated: boolean;
  userId?: string;
  phone?: string;
}

// Global variable to survive HMR (Hot Module Replacement)
declare global {
  var qrLoginSessions: Map<string, QRLoginSession> | undefined;
  var qrLoginCleanupInterval: NodeJS.Timeout | undefined;
}

class QRLoginStore {
  private sessions: Map<string, QRLoginSession>;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Reuse existing sessions map if it exists (HMR safe)
    if (global.qrLoginSessions) {
      this.sessions = global.qrLoginSessions;
      console.log(`[QR Login] Reusing existing sessions (${this.sessions.size} active)`);
    } else {
      this.sessions = new Map();
      global.qrLoginSessions = this.sessions;
      console.log("[QR Login] Initialized new sessions store");
    }

    // Clear existing interval if any
    if (global.qrLoginCleanupInterval) {
      clearInterval(global.qrLoginCleanupInterval);
    }

    // Cleanup expired sessions every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 1000);
    global.qrLoginCleanupInterval = this.cleanupInterval;
  }

  createSession(sessionId: string): QRLoginSession {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes

    const session: QRLoginSession = {
      sessionId,
      createdAt: now,
      expiresAt,
      authenticated: false,
    };

    this.sessions.set(sessionId, session);
    console.log(`[QR Login] Created session ${sessionId}, expires at ${expiresAt.toISOString()}`);
    return session;
  }

  getSession(sessionId: string): QRLoginSession | undefined {
    const session = this.sessions.get(sessionId);

    if (!session) {
      console.log(`[QR Login] Session ${sessionId} not found`);
      return undefined;
    }

    // Check if expired
    const now = new Date();
    if (now > session.expiresAt) {
      console.log(`[QR Login] Session ${sessionId} expired (${session.expiresAt.toISOString()})`);
      this.sessions.delete(sessionId);
      return undefined;
    }

    return session;
  }

  authenticateSession(sessionId: string, userId: string, phone: string): boolean {
    const session = this.getSession(sessionId);

    if (!session) {
      console.log(`[QR Login] Cannot authenticate - session ${sessionId} not found`);
      return false;
    }

    session.authenticated = true;
    session.userId = userId;
    session.phone = phone;

    this.sessions.set(sessionId, session);
    console.log(`[QR Login] Authenticated session ${sessionId} for user ${userId}`);
    return true;
  }

  deleteSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  cleanup(): void {
    const now = new Date();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now > session.expiresAt) {
        this.sessions.delete(sessionId);
      }
    }
  }

  // For debugging
  getActiveSessionsCount(): number {
    return this.sessions.size;
  }
}

// Singleton instance
export const qrLoginStore = new QRLoginStore();
