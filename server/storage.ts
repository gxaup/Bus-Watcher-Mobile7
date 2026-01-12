import { db } from "./db";
import { 
  sessions, violations, violationTypes, users, authSessions,
  type Session, type InsertSession, 
  type Violation, type InsertViolation,
  type ViolationType, type InsertViolationType,
  type User, type AuthSession
} from "@shared/schema";
import { eq, desc, and, gt, lt } from "drizzle-orm";

export interface IStorage {
  // Users
  createUser(email: string, passwordHash: string, displayName: string): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  
  // Auth Sessions
  createAuthSession(userId: number, token: string, expiresAt: Date): Promise<AuthSession>;
  getAuthSessionByToken(token: string): Promise<AuthSession | undefined>;
  deleteAuthSession(token: string): Promise<void>;
  deleteExpiredSessions(): Promise<void>;
  deleteUserSessions(userId: number): Promise<void>;
  
  // Bus Sessions
  createSession(session: InsertSession, userId: number): Promise<Session>;
  updateSession(id: number, data: Partial<InsertSession>): Promise<Session | undefined>;
  endSession(id: number, endTime: Date): Promise<Session>;
  getSession(id: number): Promise<Session | undefined>;
  getSessions(): Promise<Session[]>;
  getUserSessions(userId: number): Promise<Session[]>;
  deleteSession(id: number): Promise<void>;
  deleteAllSessions(): Promise<void>;
  
  // Violations
  createViolation(violation: InsertViolation): Promise<Violation>;
  getViolations(sessionId: number): Promise<Violation[]>;
  deleteViolation(id: number): Promise<void>;
  
  // Violation Types
  createViolationType(type: InsertViolationType): Promise<ViolationType>;
  getViolationTypes(): Promise<ViolationType[]>;
  getViolationTypeByName(name: string): Promise<ViolationType | undefined>;
  deleteCustomViolationTypes(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async createUser(email: string, passwordHash: string, displayName: string): Promise<User> {
    const [newUser] = await db.insert(users).values({
      email,
      passwordHash,
      displayName,
    }).returning();
    return newUser;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  // Auth Sessions
  async createAuthSession(userId: number, token: string, expiresAt: Date): Promise<AuthSession> {
    const [session] = await db.insert(authSessions).values({
      userId,
      token,
      expiresAt,
    }).returning();
    return session;
  }

  async getAuthSessionByToken(token: string): Promise<AuthSession | undefined> {
    const [session] = await db.select().from(authSessions).where(
      and(eq(authSessions.token, token), gt(authSessions.expiresAt, new Date()))
    );
    return session;
  }

  async deleteAuthSession(token: string): Promise<void> {
    await db.delete(authSessions).where(eq(authSessions.token, token));
  }

  async deleteExpiredSessions(): Promise<void> {
    await db.delete(authSessions).where(lt(authSessions.expiresAt, new Date()));
  }

  async deleteUserSessions(userId: number): Promise<void> {
    await db.delete(authSessions).where(eq(authSessions.userId, userId));
  }

  // Bus Sessions
  async createSession(session: InsertSession, userId: number): Promise<Session> {
    const [newSession] = await db.insert(sessions).values({ ...session, userId }).returning();
    return newSession;
  }
  
  async getUserSessions(userId: number): Promise<Session[]> {
    return await db.select().from(sessions).where(eq(sessions.userId, userId)).orderBy(desc(sessions.startTime));
  }

  async updateSession(id: number, data: Partial<InsertSession>): Promise<Session | undefined> {
    const [updatedSession] = await db
      .update(sessions)
      .set(data)
      .where(eq(sessions.id, id))
      .returning();
    return updatedSession;
  }

  async endSession(id: number, endTime: Date): Promise<Session> {
    const [updatedSession] = await db
      .update(sessions)
      .set({ endTime })
      .where(eq(sessions.id, id))
      .returning();
    return updatedSession;
  }

  async getSession(id: number): Promise<Session | undefined> {
    const [session] = await db.select().from(sessions).where(eq(sessions.id, id));
    return session;
  }

  async getSessions(): Promise<Session[]> {
    return await db.select().from(sessions).orderBy(desc(sessions.startTime));
  }

  async deleteSession(id: number): Promise<void> {
    await db.delete(violations).where(eq(violations.sessionId, id));
    await db.delete(sessions).where(eq(sessions.id, id));
  }

  async deleteAllSessions(): Promise<void> {
    await db.delete(violations);
    await db.delete(sessions);
  }

  // Violations
  async createViolation(violation: InsertViolation): Promise<Violation> {
    const [newViolation] = await db.insert(violations).values(violation).returning();
    return newViolation;
  }

  async getViolations(sessionId: number): Promise<Violation[]> {
    return await db
      .select()
      .from(violations)
      .where(eq(violations.sessionId, sessionId))
      .orderBy(desc(violations.timestamp));
  }

  async deleteViolation(id: number): Promise<void> {
    await db.delete(violations).where(eq(violations.id, id));
  }

  // Violation Types
  async createViolationType(type: InsertViolationType): Promise<ViolationType> {
    const [newType] = await db.insert(violationTypes).values(type).returning();
    return newType;
  }

  async getViolationTypes(): Promise<ViolationType[]> {
    return await db.select().from(violationTypes);
  }

  async getViolationTypeByName(name: string): Promise<ViolationType | undefined> {
    const [type] = await db.select().from(violationTypes).where(eq(violationTypes.name, name));
    return type;
  }

  async deleteCustomViolationTypes(): Promise<void> {
    await db.delete(violationTypes).where(eq(violationTypes.isDefault, false));
  }
}

export const storage = new DatabaseStorage();
